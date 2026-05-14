"use client";

import {
  Download,
  FolderOpen,
  Link as LinkIcon,
  Menu,
  Moon,
  RotateCcw,
  Save,
  Send,
  X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useEditor } from "@/lib/state/store";
import { templateSchema } from "@/lib/schema/template";
import { buildShareUrl, URL_STATE_WARN_BYTES } from "@/lib/state/url";
import { SendTestDialog } from "./SendTestDialog";
import { cn } from "@/lib/utils";

export function Toolbar() {
  const templateName = useEditor((s) => s.templateName);
  const setName = useEditor((s) => s.setName);
  const theme = useEditor((s) => s.theme);
  const setTheme = useEditor((s) => s.setTheme);
  const toTemplate = useEditor((s) => s.toTemplate);
  const loadTemplate = useEditor((s) => s.loadTemplate);
  const reset = useEditor((s) => s.reset);
  const fileInput = useRef<HTMLInputElement>(null);
  const [exporting, setExporting] = useState(false);
  const [sendOpen, setSendOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the mobile hamburger menu on Escape
  useEffect(() => {
    if (!menuOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2400);
  }

  function downloadBlob(name: string, content: string, type: string) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async function exportHtml() {
    setExporting(true);
    try {
      const t = toTemplate();
      const res = await fetch("/api/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(t),
      });
      const data = (await res.json()) as { html: string };
      const safeName = (t.name || "email").replace(/[^a-z0-9-_]+/gi, "_").toLowerCase();
      downloadBlob(`${safeName}.html`, data.html, "text/html");
      showToast("HTML downloaded");
    } catch (e) {
      showToast(`Export failed: ${(e as Error).message}`);
    } finally {
      setExporting(false);
    }
  }

  function saveJson() {
    const t = toTemplate();
    const safeName = (t.name || "email").replace(/[^a-z0-9-_]+/gi, "_").toLowerCase();
    downloadBlob(`${safeName}.maestro.json`, JSON.stringify(t, null, 2), "application/json");
    showToast("Template saved");
  }

  async function loadJson(file: File) {
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const parsed = templateSchema.safeParse(json);
      if (!parsed.success) {
        showToast("Invalid template file");
        return;
      }
      loadTemplate(parsed.data);
      showToast("Template loaded");
    } catch {
      showToast("Couldn't read file");
    }
  }

  async function copyShareUrl() {
    const t = toTemplate();
    const url = buildShareUrl(t);
    if (url.length > URL_STATE_WARN_BYTES) {
      const proceed = window.confirm(
        `This URL is ${url.length} characters long and may be truncated by some clients. Copy anyway?`
      );
      if (!proceed) return;
    }
    try {
      await navigator.clipboard.writeText(url);
      showToast("Share URL copied");
    } catch {
      window.prompt("Copy this URL:", url);
    }
  }

  function clearAll() {
    if (window.confirm("Clear the canvas? This will remove all modules.")) {
      reset();
    }
  }

  return (
    <header
      className="relative flex items-center justify-between gap-2 border-b border-stone-200 bg-white/85 px-3 py-2 backdrop-blur"
      style={{ paddingTop: "max(8px, env(safe-area-inset-top))" }}
    >
      <div className="flex min-w-0 items-center gap-2 md:gap-3">
        <a
          href="/"
          className="flex shrink-0 items-center transition hover:opacity-80"
          aria-label="Home"
          title="Home"
        >
          <Image
            src="/maestro-logo.png"
            alt="Maestro Builder"
            width={1024}
            height={1024}
            priority
            className="h-9 w-auto select-none md:h-14"
          />
        </a>
        <span className="hidden h-9 w-px bg-stone-200 md:block" aria-hidden />
        <div className="flex min-w-0 flex-col leading-tight">
          <span className="hidden text-[10px] font-semibold uppercase tracking-wide text-stone-400 md:block">
            Template
          </span>
          <input
            type="text"
            value={templateName}
            onChange={(e) => setName(e.target.value)}
            className="-ml-0.5 mt-0 w-full min-w-0 max-w-[44vw] rounded bg-transparent px-0.5 text-[13px] font-medium text-stone-800 transition hover:bg-stone-100 focus:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 md:mt-0.5 md:w-56 md:max-w-none md:text-[12px]"
            spellCheck={false}
            aria-label="Template name"
          />
        </div>
      </div>

      <div className="flex items-center gap-1">
        {/* Secondary actions (Open/Save/Share/Clear) hidden on mobile to
            keep the toolbar single-line — accessible by scrolling the
            template-name input. Re-enabled at md+. */}
        <div className="hidden items-center gap-1 md:flex">
          <ToolbarBtn icon={FolderOpen} label="Open" onClick={() => fileInput.current?.click()} />
          <ToolbarBtn icon={Save} label="Save" onClick={saveJson} />
          <ToolbarBtn icon={LinkIcon} label="Share" onClick={copyShareUrl} />
          <ToolbarBtn icon={RotateCcw} label="Clear" onClick={clearAll} variant="ghost-danger" />
          <span className="mx-1 h-5 w-px bg-stone-200" aria-hidden />
        </div>
        <button
          type="button"
          aria-pressed={!!theme.darkMode}
          onClick={() => {
            const next = !theme.darkMode;
            setTheme({ darkMode: next });
            showToast(next ? "Dark mode enabled" : "Dark mode disabled");
          }}
          title={
            theme.darkMode
              ? "Email includes dark-mode CSS — Apple Mail and Outlook 2019 macOS will adapt; click to disable."
              : "Add dark-mode CSS for Apple Mail / Outlook 2019 macOS / Outlook.com."
          }
          className={cn(
            "hidden items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition md:inline-flex",
            theme.darkMode
              ? "bg-stone-900 text-white shadow-sm hover:bg-stone-700"
              : "border border-stone-200 bg-white text-stone-700 hover:-translate-y-px hover:border-stone-300 hover:shadow-sm"
          )}
        >
          <Moon size={13} />
          Dark mode
          <span
            className={cn(
              "ml-1 inline-flex h-3.5 w-6 shrink-0 items-center rounded-full px-0.5 transition-colors",
              theme.darkMode ? "bg-blue-500" : "bg-stone-200"
            )}
          >
            <span
              className={cn(
                "h-2.5 w-2.5 rounded-full bg-white shadow-sm transition-transform",
                theme.darkMode ? "translate-x-2.5" : "translate-x-0"
              )}
            />
          </span>
        </button>
        <span className="mx-1 hidden h-5 w-px bg-stone-200 md:block" aria-hidden />
        <button
          type="button"
          onClick={() => setSendOpen(true)}
          className="hidden items-center gap-1.5 rounded-md border border-stone-200 bg-white px-2.5 py-1.5 text-xs font-medium text-stone-700 shadow-sm transition hover:-translate-y-px hover:border-stone-300 hover:shadow md:inline-flex"
        >
          <Send size={13} />
          Send test
        </button>
        <button
          type="button"
          onClick={exportHtml}
          disabled={exporting}
          aria-label="Export HTML"
          className="inline-flex h-9 items-center gap-1.5 rounded-md bg-stone-900 px-3 text-xs font-medium text-white shadow-sm transition hover:-translate-y-px hover:bg-stone-700 disabled:opacity-60 md:h-auto md:py-1.5"
        >
          <Download size={14} />
          <span className="hidden md:inline">{exporting ? "Exporting…" : "Export HTML"}</span>
          <span className="md:hidden">{exporting ? "…" : "Export"}</span>
        </button>

        {/* Mobile hamburger — opens a sheet containing all the actions
            that are hidden on mobile (Open/Save/Share/Clear/Dark/Send). */}
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="More actions"
          aria-expanded={menuOpen}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-stone-200 bg-white text-stone-700 transition active:scale-95 active:bg-stone-100 md:hidden"
        >
          <Menu size={16} />
        </button>
      </div>

      {/* Mobile actions sheet */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30 md:hidden"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
          <div
            className="fixed inset-x-0 top-0 z-50 flex flex-col rounded-b-2xl border-b border-stone-200 bg-white shadow-[0_12px_32px_-8px_rgba(0,0,0,0.18)] md:hidden"
            style={{ paddingTop: "max(8px, env(safe-area-inset-top))" }}
            role="dialog"
            aria-label="Editor actions"
          >
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">
                Actions
              </span>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-stone-500 transition active:bg-stone-100"
              >
                <X size={16} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 px-3 pb-3">
              <SheetBtn icon={FolderOpen} label="Open file" onClick={() => { setMenuOpen(false); fileInput.current?.click(); }} />
              <SheetBtn icon={Save} label="Save JSON" onClick={() => { setMenuOpen(false); saveJson(); }} />
              <SheetBtn icon={LinkIcon} label="Share URL" onClick={() => { setMenuOpen(false); copyShareUrl(); }} />
              <SheetBtn icon={Send} label="Send test" onClick={() => { setMenuOpen(false); setSendOpen(true); }} />
              <SheetBtn
                icon={Moon}
                label={theme.darkMode ? "Dark mode: on" : "Dark mode: off"}
                active={!!theme.darkMode}
                onClick={() => {
                  const next = !theme.darkMode;
                  setTheme({ darkMode: next });
                  showToast(next ? "Dark mode enabled" : "Dark mode disabled");
                  setMenuOpen(false);
                }}
              />
              <SheetBtn icon={Download} label={exporting ? "Exporting…" : "Export HTML"} onClick={() => { setMenuOpen(false); exportHtml(); }} />
              <SheetBtn icon={RotateCcw} label="Clear all" danger onClick={() => { setMenuOpen(false); clearAll(); }} />
            </div>
          </div>
        </>
      )}

      <input
        ref={fileInput}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) loadJson(f);
          e.target.value = "";
        }}
      />

      {toast && (
        <div
          role="status"
          className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 -translate-x-1/2 rounded-md bg-stone-900 px-3 py-1.5 text-[11px] font-medium text-white shadow-lg"
        >
          {toast}
        </div>
      )}

      {sendOpen && (
        <SendTestDialog
          onClose={() => setSendOpen(false)}
          onResult={showToast}
          getTemplate={toTemplate}
        />
      )}
    </header>
  );
}

function ToolbarBtn({
  icon: Icon,
  label,
  onClick,
  variant,
}: {
  icon: typeof FolderOpen;
  label: string;
  onClick: () => void;
  variant?: "ghost" | "ghost-danger";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-stone-600 transition hover:bg-stone-100 hover:text-stone-900",
        variant === "ghost-danger" && "hover:bg-red-50 hover:text-red-700"
      )}
    >
      <Icon size={13} />
      <span>{label}</span>
    </button>
  );
}

/** Sheet button — bigger touch target version of ToolbarBtn for the
 *  mobile hamburger menu. 2-column grid item, 56px tall, icon + label. */
function SheetBtn({
  icon: Icon,
  label,
  onClick,
  active,
  danger,
}: {
  icon: typeof FolderOpen;
  label: string;
  onClick: () => void;
  active?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-14 items-center gap-3 rounded-lg border border-stone-200 bg-white px-3 text-left text-sm font-medium text-stone-800 transition active:scale-[0.98] active:bg-stone-50",
        active && "border-stone-900 bg-stone-900 text-white active:bg-stone-800",
        danger && "border-red-200 text-red-700 active:bg-red-50"
      )}
    >
      <Icon size={16} className="shrink-0" />
      <span className="truncate">{label}</span>
    </button>
  );
}
