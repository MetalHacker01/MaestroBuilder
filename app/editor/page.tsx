"use client";

import dynamic from "next/dynamic";

// dnd-kit assigns incrementing internal IDs (DndDescribedBy-N) on the client,
// which means SSR'd output diverges from the first client render and React
// emits a hydration warning. The editor is fully interactive — there's no
// SEO benefit to SSR'ing it — so we skip SSR entirely.
const Editor = dynamic(
  () => import("@/components/editor/Editor").then((m) => m.Editor),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-screen items-center justify-center bg-stone-50 text-sm text-stone-500">
        Loading editor…
      </div>
    ),
  }
);

export default function EditorPage() {
  return <Editor />;
}
