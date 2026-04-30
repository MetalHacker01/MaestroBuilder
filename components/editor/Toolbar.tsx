"use client";

import {
  Download,
  FolderOpen,
  Link as LinkIcon,
  Moon,
  RotateCcw,
  Save,
  Send,
} from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
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
    <header className="relative flex items-center justify-between gap-3 border-b border-stone-200 bg-white/85 px-3 py-2 backdrop-blur">
      <div className="flex items-center gap-3">
        <a
          href="/"
          className="flex items-center transition hover:opacity-80"
          aria-label="Home"
          title="Home"
        >
          <Image
            src="/maestro-logo.png"
            alt="Maestro Builder"
            width={1024}
            height={1024}
            priority
            className="h-14 w-auto select-none"
          />
        </a>
        <span className="h-9 w-px bg-stone-200" aria-hidden />
        <div className="flex flex-col leading-tight">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-stone-400">
            Template
          </span>
          <input
            type="text"
            value={templateName}
            onChange={(e) => setName(e.target.value)}
            className="-ml-0.5 mt-0.5 w-56 rounded bg-transparent px-0.5 text-[12px] font-medium text-stone-800 transition hover:bg-stone-100 focus:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            spellCheck={false}
          />
        </div>
      </div>

      <div className="flex items-center gap-1">
        <ToolbarBtn icon={FolderOpen} label="Open" onClick={() => fileInput.current?.click()} />
        <ToolbarBtn icon={Save} label="Save" onClick={saveJson} />
        <ToolbarBtn icon={LinkIcon} label="Share" onClick={copyShareUrl} />
        <ToolbarBtn icon={RotateCcw} label="Clear" onClick={clearAll} variant="ghost-danger" />
        <span className="mx-1 h-5 w-px bg-stone-200" aria-hidden />
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
            "inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition",
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
        <span className="mx-1 h-5 w-px bg-stone-200" aria-hidden />
        <button
          type="button"
          onClick={() => setSendOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-md border border-stone-200 bg-white px-2.5 py-1.5 text-xs font-medium text-stone-700 shadow-sm transition hover:-translate-y-px hover:border-stone-300 hover:shadow"
        >
          <Send size={13} />
          Send test
        </button>
        <button
          type="button"
          onClick={exportHtml}
          disabled={exporting}
          className="inline-flex items-center gap-1.5 rounded-md bg-stone-900 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:-translate-y-px hover:bg-stone-700 disabled:opacity-60"
        >
          <Download size={13} />
          {exporting ? "Exporting…" : "Export HTML"}
        </button>
      </div>

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
