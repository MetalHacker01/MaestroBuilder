"use client";

import { ExternalLink, Loader2, Mail, Send, ShieldCheck, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Template } from "@/lib/modules/types";

const RECENT_KEY = "maestro-builder-recent-emails";
const MAX_RECIPIENTS = 50;

type Props = {
  onClose: () => void;
  onResult: (msg: string) => void;
  getTemplate: () => Template;
};

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parseRecipients(raw: string): { valid: string[]; invalid: string[] } {
  const tokens = raw
    .split(/[,;\s\n]+/)
    .map((t) => t.trim())
    .filter(Boolean);
  const seen = new Set<string>();
  const valid: string[] = [];
  const invalid: string[] = [];
  for (const t of tokens) {
    const k = t.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    if (EMAIL_RX.test(t)) valid.push(t);
    else invalid.push(t);
  }
  return { valid, invalid };
}

export function SendTestDialog({ onClose, onResult, getTemplate }: Props) {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [recent, setRecent] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notConfigured, setNotConfigured] = useState(false);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { valid: validRecipients, invalid: invalidRecipients } = parseRecipients(to);
  const tooMany = validRecipients.length > MAX_RECIPIENTS;

  useEffect(() => {
    setMounted(true);
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(RECENT_KEY);
      const list = raw ? (JSON.parse(raw) as string[]) : [];
      setRecent(list);
    } catch {
      // ignore
    }
    const t = getTemplate();
    setSubject(t.name ? `Test: ${t.name}` : "Test email from Maestro Builder");
    setTimeout(() => inputRef.current?.focus(), 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function rememberEmails(addrs: string[]) {
    if (typeof window === "undefined") return;
    const next = [...addrs, ...recent.filter((r) => !addrs.includes(r))].slice(0, 8);
    setRecent(next);
    try {
      window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }

  function appendRecent(addr: string) {
    setTo((cur) => {
      const trimmed = cur.trim();
      if (!trimmed) return addr;
      if (cur.toLowerCase().includes(addr.toLowerCase())) return cur;
      return trimmed.endsWith(",") ? `${trimmed} ${addr}` : `${trimmed}, ${addr}`;
    });
  }

  /**
   * Fallback path that doesn't require Mailjet (or any configured provider).
   * Renders the current template to export HTML, copies it to the user's
   * clipboard, and opens htmltest.email in a new tab — they paste, add a
   * recipient, hit Send. We never call htmltest.email's backend ourselves;
   * this is just deep-linking + clipboard convenience, fully consistent
   * with how their site is meant to be used.
   */
  async function openInHtmlTestEmail() {
    setError(null);
    setNotConfigured(false);
    const template = getTemplate();
    if (template.instances.length === 0) {
      setError("Add at least one module to the canvas first.");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/render?mode=export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(template),
      });
      const data = (await res.json()) as { html?: string; error?: string };
      if (!res.ok || !data.html) {
        setError(data.error ?? "Couldn't render HTML.");
        return;
      }
      try {
        await navigator.clipboard.writeText(data.html);
      } catch {
        // clipboard may be blocked in some contexts — open the tab anyway,
        // user can copy from a fallback prompt
        window.prompt(
          "Couldn't auto-copy. Copy this HTML and paste it into htmltest.email:",
          data.html
        );
      }
      window.open("https://htmltest.email/", "_blank", "noopener,noreferrer");
      onResult("HTML copied — paste it into htmltest.email");
      onClose();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSending(false);
    }
  }

  async function send() {
    setError(null);
    setNotConfigured(false);
    if (validRecipients.length === 0) {
      setError("Add at least one valid email address.");
      return;
    }
    if (invalidRecipients.length > 0) {
      setError(
        `These don't look like valid emails: ${invalidRecipients.slice(0, 3).join(", ")}${
          invalidRecipients.length > 3 ? "…" : ""
        }`
      );
      return;
    }
    if (tooMany) {
      setError(`Mailjet free tier allows up to ${MAX_RECIPIENTS} recipients per send.`);
      return;
    }
    const template = getTemplate();
    if (template.instances.length === 0) {
      setError("Add at least one module to the canvas before sending.");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/send-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: validRecipients,
          subject: subject.trim() || "Test email",
          template,
        }),
      });
      const data = (await res.json()) as {
        id?: string;
        error?: string;
        notConfigured?: boolean;
      };
      if (!res.ok) {
        setNotConfigured(!!data.notConfigured);
        setError(data.error ?? "Failed to send.");
        return;
      }
      rememberEmails(validRecipients);
      onResult(
        validRecipients.length === 1
          ? `Sent to ${validRecipients[0]}`
          : `Sent to ${validRecipients.length} recipients`
      );
      onClose();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSending(false);
    }
  }

  // Close on escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        send();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [to, subject]);

  if (!mounted || typeof document === "undefined") return null;

  const dialog = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-950/70 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal
      aria-labelledby="send-test-title"
      onClick={(e) => {
        // dismiss when clicking outside the dialog
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-[0_30px_80px_-20px_rgba(0,0,0,0.45)]">
        <header className="flex items-start justify-between gap-3 border-b border-stone-100 px-6 py-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <Mail size={16} />
            </div>
            <div>
              <h2 id="send-test-title" className="text-base font-semibold text-stone-900">
                Send a test email
              </h2>
              <p className="mt-0.5 text-xs leading-relaxed text-stone-500">
                Compiles your current template and sends it. Multiple recipients can
                be separated by comma, semicolon, space or newline.
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="rounded-md p-1 text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
          >
            <X size={16} />
          </button>
        </header>

        <div className="flex flex-col gap-4 px-6 py-5">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="send-to"
                className="text-[11px] font-semibold uppercase tracking-wide text-stone-600"
              >
                To
              </label>
              <span
                className={
                  tooMany
                    ? "text-[11px] font-medium text-red-600"
                    : "text-[11px] tabular-nums text-stone-400"
                }
              >
                {validRecipients.length}
                {invalidRecipients.length > 0 ? ` valid · ${invalidRecipients.length} invalid` : ""}
              </span>
            </div>
            <textarea
              id="send-to"
              ref={inputRef}
              value={to}
              onChange={(e) => setTo(e.target.value)}
              rows={2}
              placeholder="alice@example.com, bob@example.com&#10;carol@example.com"
              className="w-full resize-y rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            {validRecipients.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {validRecipients.slice(0, 8).map((r) => (
                  <span
                    key={r}
                    className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2 py-0.5 text-[11px] text-stone-700"
                  >
                    {r}
                  </span>
                ))}
                {validRecipients.length > 8 && (
                  <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[11px] text-stone-500">
                    +{validRecipients.length - 8} more
                  </span>
                )}
              </div>
            )}
          </div>

          {recent.length > 0 && (
            <div className="flex flex-wrap items-center gap-1">
              <span className="text-[11px] font-medium uppercase tracking-wide text-stone-400">
                Recent
              </span>
              {recent.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => appendRecent(r)}
                  className="rounded-full border border-stone-200 bg-stone-50 px-2 py-0.5 text-[11px] text-stone-700 transition hover:-translate-y-px hover:border-stone-300 hover:bg-white hover:shadow-sm"
                >
                  + {r}
                </button>
              ))}
            </div>
          )}

          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-stone-600">
              Subject
            </span>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </label>

          {error && !notConfigured && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </div>
          )}

          {notConfigured && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
              <div className="flex items-start gap-2">
                <ShieldCheck size={14} className="mt-0.5 shrink-0 text-amber-600" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-amber-900">
                    Mailjet isn&apos;t fully configured yet
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed text-amber-800">
                    {error}
                  </p>
                  <p className="mt-2 text-[11px] font-semibold text-amber-900">
                    Quick setup (~2 min):
                  </p>
                  <ol className="mt-1 list-decimal space-y-0.5 pl-4 text-[11px] leading-relaxed text-amber-800">
                    <li>
                      Sign in at{" "}
                      <a
                        href="https://app.mailjet.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium underline"
                      >
                        app.mailjet.com
                      </a>
                    </li>
                    <li>
                      <strong>Senders &amp; Domains</strong> → Add a sender →
                      enter your email → click the confirmation link Mailjet
                      sends you
                    </li>
                    <li>
                      Set{" "}
                      <span className="rounded bg-white/60 px-1 font-mono">
                        MAILJET_FROM_ADDRESS
                      </span>{" "}
                      in <span className="font-mono">.env.local</span> to that
                      verified email, then restart the dev server
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          <p className="rounded-lg bg-stone-50 px-3 py-2 text-[11px] leading-relaxed text-stone-500">
            Sends via{" "}
            <span className="rounded bg-white px-1 font-mono text-stone-700">
              Mailjet
            </span>{" "}
            free tier: 200 emails/day, 6000/month. Sender address must be
            verified inside Mailjet&apos;s dashboard one time before you can
            send.
          </p>
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-stone-100 bg-stone-50/70 px-6 py-3.5">
          <span className="font-mono text-[10px] text-stone-400">
            ⌘/Ctrl + Enter to send · Esc to close
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={sending}
              className="rounded-md px-3 py-1.5 text-xs font-medium text-stone-600 transition hover:bg-stone-100 hover:text-stone-900 disabled:opacity-60"
            >
              Cancel
            </button>
            {/* Custom tooltip wrapper — instant-show CSS tooltip beats the
                ~1s native title= delay and the wording is explicit about
                what happens when you click. */}
            <div className="group relative">
              <button
                type="button"
                onClick={openInHtmlTestEmail}
                disabled={sending}
                aria-label="Open in htmltest.email"
                className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 transition hover:-translate-y-px hover:border-stone-300 hover:bg-stone-50 disabled:opacity-60"
              >
                <ExternalLink size={12} />
                htmltest.email
              </button>
              <div
                role="tooltip"
                className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-md bg-stone-900 px-2.5 py-1.5 text-[10.5px] font-medium leading-tight text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100"
              >
                HTML will be auto-copied — paste into htmltest.email in the new tab
                <span
                  aria-hidden
                  className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-stone-900"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={send}
              disabled={sending || validRecipients.length === 0 || tooMany}
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md bg-stone-900 px-3.5 py-1.5 text-xs font-medium text-white shadow-sm transition hover:-translate-y-px hover:bg-stone-700 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-stone-900"
            >
              {sending ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
              {sending
                ? "Sending…"
                : validRecipients.length > 1
                ? `Send to ${validRecipients.length}`
                : "Send test"}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );

  // Portal to document.body so the fixed-position dialog escapes any parent
  // stacking context (the toolbar uses backdrop-blur which would otherwise
  // trap us underneath it).
  return createPortal(dialog, document.body);
}

