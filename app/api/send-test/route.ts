import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import Mailjet from "node-mailjet";
import { compileTemplate } from "@/lib/render/compile";
import { templateSchema } from "@/lib/schema/template";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const sendSchema = z.object({
  to: z.union([z.string().email(), z.array(z.string().email()).min(1).max(50)]),
  subject: z.string().min(1).max(200),
  template: templateSchema,
});

type MailjetMessage = {
  Status?: string;
  Errors?: { ErrorMessage?: string; ErrorCode?: string }[];
  To?: { MessageID?: string }[];
};

/**
 * Detect Mailjet's "sender not validated" / "domain not authorised" errors so
 * we can surface a useful message in the UI. Mailjet returns these as
 * `Errors[].ErrorMessage` strings inside a `Status: "error"` message rather
 * than throwing, so we have to walk the response.
 */
function extractMailjetError(messages: MailjetMessage[] | undefined): string | null {
  if (!messages || messages.length === 0) return null;
  for (const m of messages) {
    if (m.Status && m.Status !== "success" && m.Errors && m.Errors.length > 0) {
      return m.Errors.map((e) => e.ErrorMessage).filter(Boolean).join("; ") || null;
    }
  }
  return null;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.MAILJET_API_KEY;
  const apiSecret = process.env.MAILJET_API_SECRET;
  const fromAddress = process.env.MAILJET_FROM_ADDRESS;
  const fromName = process.env.MAILJET_FROM_NAME?.trim() || "Maestro Builder";

  if (!apiKey || !apiSecret || !fromAddress) {
    return NextResponse.json(
      {
        error:
          "Mailjet is not configured on the server. Set MAILJET_API_KEY, MAILJET_API_SECRET, and MAILJET_FROM_ADDRESS in .env.local, then restart the dev server. See README for the 4-step Mailjet account setup.",
        notConfigured: true,
      },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = sendSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { to, subject, template } = parsed.data;
  const recipients = Array.isArray(to) ? to : [to];

  // Compile the email — mode:"export" emits the bulletproof HTML without the
  // editor preview chrome (no click-to-select script).
  const compiled = await compileTemplate(template.instances, {
    mode: "export",
    theme: template.theme,
  });
  if (!compiled.html) {
    return NextResponse.json(
      { error: "Render produced empty HTML — add at least one module." },
      { status: 400 }
    );
  }

  try {
    const mailjet = Mailjet.apiConnect(apiKey, apiSecret);

    const result = await mailjet.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: { Email: fromAddress, Name: fromName },
          // Mailjet's v3.1 API only allows ONE entry in the To[] array per
          // message — for multiple recipients we'd need separate messages.
          // For test sends, use BCC so all recipients receive the same render
          // and don't see each other.
          To: [{ Email: recipients[0] }],
          ...(recipients.length > 1
            ? { Bcc: recipients.slice(1).map((email) => ({ Email: email })) }
            : {}),
          Subject: subject,
          HTMLPart: compiled.html,
        },
      ],
    });

    // node-mailjet types are loose; coerce.
    const responseBody = (result.body as { Messages?: MailjetMessage[] }) ?? {};
    const errMessage = extractMailjetError(responseBody.Messages);
    if (errMessage) {
      return NextResponse.json(
        { error: errMessage, provider: "mailjet" },
        { status: 502 }
      );
    }

    const firstMessage = responseBody.Messages?.[0];
    return NextResponse.json({
      id: firstMessage?.To?.[0]?.MessageID,
      from: `${fromName} <${fromAddress}>`,
      to: recipients,
      provider: "mailjet",
    });
  } catch (e) {
    const message = (e as Error).message ?? "Mailjet rejected the request.";
    return NextResponse.json(
      { error: humanizeMailjetError(message), provider: "mailjet" },
      { status: 502 }
    );
  }
}

function humanizeMailjetError(raw: string): string {
  // Order matters — most specific patterns first, generic 401 LAST so we
  // don't misattribute account-block / sender-validation errors as auth.
  if (/temporarily blocked|account.*blocked|account.*suspended/i.test(raw)) {
    return "Mailjet has temporarily blocked your account from sending. This happens to new free-tier accounts as part of their anti-abuse review — sign in to app.mailjet.com, look for a banner asking you to describe your use case, fill it in, and Mailjet usually unblocks within a few hours. If there's no banner, email support@mailjet.com from your account email and ask them to release the validation hold.";
  }
  if (/sender.*not.*valid|sender.*authoris|sender address.*not|Sender.*not.*confirm/i.test(raw)) {
    return "The sender address isn't validated in Mailjet yet. Go to Senders & Domains → Add a sender → enter your address → click the confirmation link Mailjet emails you. Once validated, this send will work.";
  }
  if (/quota|over.*limit|429/i.test(raw)) {
    return "Mailjet daily/monthly quota hit. Free tier is 200/day, 6000/month. Try again tomorrow or upgrade the plan.";
  }
  if (/401|unauthorized|invalid api/i.test(raw)) {
    return "Mailjet rejected the API credentials. Double-check MAILJET_API_KEY and MAILJET_API_SECRET in .env.local — they're in Account Settings → API Key Management on Mailjet's dashboard.";
  }
  return raw;
}
