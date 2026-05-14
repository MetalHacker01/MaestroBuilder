import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Boxes, Globe, Sliders, Wand2 } from "lucide-react";

/* Lucide dropped the GitHub + LinkedIn icons due to brand-guideline
 * restrictions, so we render the official marks inline as SVG. */
function GitHubIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.21.7-3.89-1.36-3.89-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.71 0-1.26.45-2.3 1.18-3.11-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18a10.96 10.96 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.76.11 3.05.73.81 1.18 1.85 1.18 3.11 0 4.44-2.7 5.42-5.27 5.7.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.55A11.5 11.5 0 0 0 12 .5z" />
    </svg>
  );
}

function LinkedInIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05a3.74 3.74 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.99 0 1.78-.77 1.78-1.72V1.72C24 .77 23.21 0 22.22 0z" />
    </svg>
  );
}

export default function Home() {
  return (
    <main className="mb-grain relative flex min-h-screen flex-col bg-stone-50 text-stone-900">
      {/* Top bar */}
      <header className="z-10 flex items-center justify-between px-8 py-5">
        <Link
          href="/"
          className="flex items-center transition hover:opacity-80"
          aria-label="Maestro Builder home"
        >
          <Image
            src="/maestro-logo.png"
            alt="Maestro Builder"
            width={50}
            height={50}
            priority
            className="h-[50px] w-[50px] select-none"
          />
        </Link>
        <nav className="flex items-center gap-5 text-sm">
          <a
            href="https://github.com/MetalHacker01/MaestroBuilder"
            target="_blank"
            rel="noopener noreferrer"
            className="text-stone-600 transition hover:text-stone-900"
          >
            GitHub
          </a>
          <Link
            href="/editor"
            className="inline-flex items-center gap-1.5 rounded-md bg-stone-900 px-3.5 py-1.5 text-sm font-medium text-white shadow-sm transition hover:-translate-y-px hover:bg-stone-700"
          >
            Open editor <ArrowRight size={14} />
          </Link>
        </nav>
      </header>

      {/* Hero — asymmetric, copy left, mock right */}
      <section className="relative mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 items-center gap-10 px-8 pb-20 pt-14 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-stone-600 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-700" />
            v0.2 · live preview · resend send-test
          </span>

          <h1 className="mt-5 text-5xl font-semibold leading-[1.05] tracking-tight text-stone-900 md:text-6xl">
            Drag, drop, tweak.
            <br />
            <span className="italic text-stone-700">Ship emails that</span>
            <br />
            render everywhere.
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-stone-600">
            Maestro Builder is the modern rebuild of our internal responsive-email
            tool. Compose with typed modules, edit copy with WYSIWYG, tune every
            radius and color, send a test to your inbox — then export bulletproof
            HTML that survives Gmail, Yahoo and Outlook&nbsp;2007+.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/editor"
              className="inline-flex items-center gap-1.5 rounded-md bg-blue-700 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:-translate-y-px hover:bg-blue-800"
            >
              Start building <ArrowRight size={15} />
            </Link>
            <a
              href="https://github.com/MetalHacker01/MaestroBuilder"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium text-stone-800 transition hover:-translate-y-px hover:border-stone-400 hover:bg-stone-50"
            >
              View source on GitHub
            </a>
          </div>
        </div>

        {/* Right side — stylized "editor" mock built in CSS, no fake screenshots */}
        <div className="relative lg:col-span-6">
          <EditorMock />
        </div>
      </section>

      {/* Feature row — asymmetric (one big + two small) */}
      <section className="mx-auto w-full max-w-6xl px-8 pb-24">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <FeatureBig
            icon={Boxes}
            title="Typed modules"
            body="18 curated modules cover preheader, logo, banner, body, footer and spacers — each one a React-defined schema you can extend. Add a new module in under 100 lines."
          />
          <FeatureSmall
            icon={Sliders}
            title="Tweak everything"
            body="Button radius, padding, font color, alignment — all editable from a property panel that adapts to each module."
          />
          <FeatureSmall
            icon={Wand2}
            title="MJML inside"
            body="MJML compiles your modules to bulletproof HTML — Outlook 2007 to Gmail iOS — so you don't write VML by hand."
          />
        </div>
      </section>

      {/* About the maker — editorial / minimalist-ui pattern */}
      <section className="border-t border-stone-200 bg-stone-50/50">
        <div className="mx-auto max-w-5xl px-8 py-20">
          <div className="mb-8 inline-flex items-center gap-2">
            <span className="h-px w-8 bg-stone-300" />
            <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-stone-500">
              About the maker
            </span>
          </div>
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <h2 className="text-3xl font-semibold leading-tight tracking-tight text-stone-900 md:text-4xl">
                Built by a martech engineer for the martech team.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-stone-600">
                I&apos;m Aldorino Rrushi — a Solution Engineer at MarketOne
                International, based in Tirana, Albania. 8+ years across
                marketing-automation platforms (Salesforce Marketing Cloud,
                Oracle Eloqua, Oracle Responsys, HCL Unica) with 6 Salesforce
                certifications including Marketing Cloud Consultant, Developer,
                Administrator, Email Specialist, Agentforce Specialist and
                Salesforce Associate. Day-to-day I translate business
                requirements into scalable SFMC solutions, lead campaign
                development end-to-end and mentor junior team members.
              </p>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-stone-600">
                Maestro Builder is the modern rebuild of our internal
                jQuery-era responsive-email tool, rewritten on Next.js + MJML
                so editors can tune every radius, padding and color without
                ever touching HTML. Same bulletproof output across Gmail,
                Outlook 2007+ and mobile — much better workflow.
              </p>
            </div>
            <div className="lg:col-span-5">
              <div className="grid grid-cols-1 gap-3">
                <SocialLink
                  href="https://github.com/MetalHacker01"
                  icon={GitHubIcon}
                  label="GitHub"
                  hint="MetalHacker01"
                />
                <SocialLink
                  href="https://www.linkedin.com/in/aldorinorrushi/"
                  icon={LinkedInIcon}
                  label="LinkedIn"
                  hint="aldorinorrushi"
                />
                <SocialLink
                  href="https://martech-maestro-folio-sroh.vercel.app/"
                  icon={Globe}
                  label="Portfolio"
                  hint="martech-maestro-folio"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-stone-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-8 py-6 text-xs text-stone-500">
          <span>Maestro Builder · Internal tool for the marketing team</span>
          <span className="font-mono">v0.2</span>
        </div>
      </footer>
    </main>
  );
}

function FeatureBig({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Boxes;
  title: string;
  body: string;
}) {
  return (
    <article className="md:col-span-1 md:row-span-1 group relative overflow-hidden rounded-xl border border-stone-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-md bg-stone-900 text-white">
        <Icon size={16} />
      </div>
      <h3 className="text-base font-semibold text-stone-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-stone-600">{body}</p>
    </article>
  );
}

function SocialLink({
  href,
  icon: Icon,
  label,
  hint,
}: {
  href: string;
  icon: (props: { size?: number }) => React.ReactNode;
  label: string;
  hint: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center justify-between rounded-lg border border-stone-200 bg-white px-4 py-3 transition hover:-translate-y-px hover:border-stone-300 hover:shadow-sm"
    >
      <span className="flex items-center gap-3">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-stone-200 bg-stone-50 text-stone-700 transition group-hover:border-stone-300 group-hover:bg-stone-100">
          <Icon size={15} />
        </span>
        <span>
          <span className="block text-sm font-medium text-stone-900">{label}</span>
          <span className="block font-mono text-[11px] text-stone-500">{hint}</span>
        </span>
      </span>
      <ArrowRight
        size={15}
        className="text-stone-400 transition group-hover:translate-x-0.5 group-hover:text-stone-700"
      />
    </a>
  );
}

function FeatureSmall({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Boxes;
  title: string;
  body: string;
}) {
  return (
    <article className="group relative overflow-hidden rounded-xl border border-stone-200 bg-white/60 p-5 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-sm">
      <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-md border border-stone-200 bg-white text-stone-700">
        <Icon size={14} />
      </div>
      <h3 className="text-sm font-semibold text-stone-900">{title}</h3>
      <p className="mt-1.5 text-[13px] leading-relaxed text-stone-600">{body}</p>
    </article>
  );
}

function EditorMock() {
  return (
    <div className="relative">
      {/* drop shadow */}
      <div
        aria-hidden
        className="absolute -inset-x-4 -bottom-6 h-32 rounded-[40px] bg-gradient-to-t from-stone-200/70 to-transparent blur-2xl"
      />
      <div className="relative overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-[0_1px_0_rgba(28,25,23,0.04),0_30px_60px_-30px_rgba(28,25,23,0.35)]">
        {/* fake titlebar */}
        <div className="flex items-center gap-1.5 border-b border-stone-200 bg-stone-50/80 px-3 py-2">
          <span className="h-2.5 w-2.5 rounded-full bg-stone-200" />
          <span className="h-2.5 w-2.5 rounded-full bg-stone-200" />
          <span className="h-2.5 w-2.5 rounded-full bg-stone-200" />
          <span className="ml-2 truncate font-mono text-[10px] text-stone-500">
            maestro-builder · /editor
          </span>
        </div>
        <div className="grid grid-cols-12">
          {/* mock palette */}
          <div className="col-span-3 border-r border-stone-200 bg-white px-2 py-3">
            <div className="mb-2 px-1 text-[8px] font-semibold uppercase tracking-wider text-stone-400">
              Modules
            </div>
            <div className="flex flex-col gap-1">
              {["Preheader", "Logo", "Hero banner", "Headline + CTA", "Two columns", "Footer"].map(
                (n, i) => (
                  <div
                    key={n}
                    className="rounded border border-stone-200 bg-white px-1.5 py-1 text-[10px] text-stone-700"
                    style={{ opacity: 0.55 + i * 0.08 }}
                  >
                    {n}
                  </div>
                )
              )}
            </div>
          </div>
          {/* mock canvas */}
          <div className="col-span-6 bg-stone-100 px-3 py-3">
            <div className="mx-auto rounded-lg bg-white shadow-sm">
              <div className="h-3" />
              <div className="mx-auto h-3 w-1/2 rounded bg-stone-900/85" />
              <div className="mt-3 mx-auto h-24 w-[90%] rounded bg-blue-700/85" />
              <div className="mt-3 mx-auto h-2 w-[80%] rounded bg-stone-200" />
              <div className="mt-1.5 mx-auto h-2 w-[70%] rounded bg-stone-200" />
              <div className="mt-1.5 mx-auto h-2 w-[60%] rounded bg-stone-200" />
              <div className="mt-3 mx-auto h-6 w-24 rounded bg-stone-900" />
              <div className="h-4" />
            </div>
          </div>
          {/* mock properties */}
          <div className="col-span-3 border-l border-stone-200 bg-white px-2 py-3">
            <div className="mb-2 px-1 text-[8px] font-semibold uppercase tracking-wider text-stone-400">
              Properties
            </div>
            <div className="space-y-2">
              <div>
                <div className="mb-0.5 text-[8px] text-stone-500">Button radius</div>
                <div className="flex items-center gap-1">
                  <div className="h-1 flex-1 rounded bg-stone-200">
                    <div className="h-1 w-2/5 rounded bg-blue-700" />
                  </div>
                  <span className="font-mono text-[8px] text-stone-500">8px</span>
                </div>
              </div>
              <div>
                <div className="mb-0.5 text-[8px] text-stone-500">Button color</div>
                <div className="flex items-center gap-1">
                  <span className="h-3 w-3 rounded border border-stone-300 bg-blue-700" />
                  <span className="font-mono text-[8px] text-stone-700">#1D4ED8</span>
                </div>
              </div>
              <div>
                <div className="mb-0.5 text-[8px] text-stone-500">Alignment</div>
                <div className="inline-flex overflow-hidden rounded border border-stone-200 bg-stone-50 p-0.5 text-[8px]">
                  <span className="rounded px-1.5 py-0.5 text-stone-500">L</span>
                  <span className="rounded bg-white px-1.5 py-0.5 text-stone-900 shadow-sm">C</span>
                  <span className="rounded px-1.5 py-0.5 text-stone-500">R</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
