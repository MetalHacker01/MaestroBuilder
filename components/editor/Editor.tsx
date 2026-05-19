"use client";

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useEffect, useState } from "react";
import { useEditor } from "@/lib/state/store";
import { decodeTemplateFromUrl, URL_STATE_PARAM } from "@/lib/state/url";
import { getModule } from "@/lib/modules/registry";
import { ModulePalette } from "./ModulePalette";
import { Outline } from "./Outline";
import { Canvas } from "./Canvas";
import { PropertyPanel } from "./PropertyPanel";
import { Toolbar } from "./Toolbar";

export function Editor() {
  const instances = useEditor((s) => s.instances);
  const reorder = useEditor((s) => s.reorder);
  const add = useEditor((s) => s.add);
  const loadTemplate = useEditor((s) => s.loadTemplate);
  const remove = useEditor((s) => s.remove);
  const selectedUid = useEditor((s) => s.selectedUid);
  const select = useEditor((s) => s.select);
  const darkMode = useEditor((s) => s.theme.darkMode);

  const [activeDrag, setActiveDrag] = useState<
    { source: "palette"; moduleId: string } | { source: "canvas"; uid: string } | null
  >(null);

  const sensors = useSensors(
    // distance:6 (was 4) — slightly more deliberate so clicks on the
    // palette card don't accidentally pick up as drags. The drag handle
    // is a separate region now, but a stray pointermove during a click
    // on the click-to-add area should still resolve as a click, not a
    // drag-cancel.
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Hydrate from URL ?state= once, then strip it so reload doesn't clobber edits.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get(URL_STATE_PARAM);
    if (!encoded) return;
    const t = decodeTemplateFromUrl(encoded);
    if (t) loadTemplate(t);
    params.delete(URL_STATE_PARAM);
    const newUrl =
      window.location.pathname + (params.size ? `?${params.toString()}` : "");
    window.history.replaceState(null, "", newUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // App-wide dark mode. Toggling `theme.darkMode` from the toolbar adds
  // `app-dark` to <html>, which flips:
  //   1. CSS variables (--color-app, --color-surface, --color-text, ...)
  //   2. utility-class overrides in globals.css (.app-dark .bg-white, ...)
  //   3. anything portalled into document.body (toasts, hamburger menu,
  //      SendTestDialog), which would otherwise live outside the
  //      editor's DOM tree and miss any class on a wrapper div.
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) root.classList.add("app-dark");
    else root.classList.remove("app-dark");
    return () => {
      // On unmount (e.g. navigating away from /editor), drop the class
      // so the landing page never picks up app-dark styling.
      root.classList.remove("app-dark");
    };
  }, [darkMode]);

  // Keyboard: Backspace/Delete removes selected; Escape clears selection.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      )
        return;
      if ((e.key === "Backspace" || e.key === "Delete") && selectedUid) {
        e.preventDefault();
        remove(selectedUid);
      }
      if (e.key === "Escape") select(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedUid, remove, select]);

  function onDragStart(e: DragStartEvent) {
    const data = e.active.data.current as
      | { source: "palette"; moduleId: string }
      | { source: "canvas"; uid: string }
      | undefined;
    if (data) setActiveDrag(data);
  }

  function onDragEnd(e: DragEndEvent) {
    setActiveDrag(null);
    const { active, over } = e;
    if (!over) return;
    const aData = active.data.current as
      | { source: "palette"; moduleId: string }
      | { source: "canvas"; uid: string }
      | undefined;
    if (!aData) return;

    if (aData.source === "palette") {
      let atIndex: number | undefined;
      const overData = over.data.current as { source?: string; uid?: string } | undefined;
      if (overData?.source === "canvas" && overData.uid) {
        atIndex = instances.findIndex((i) => i.uid === overData.uid);
      }
      add(aData.moduleId, atIndex);
      return;
    }

    if (aData.source === "canvas") {
      const fromIndex = instances.findIndex((i) => i.uid === aData.uid);
      const overData = over.data.current as { source?: string; uid?: string } | undefined;
      let toIndex = fromIndex;
      if (overData?.source === "canvas" && overData.uid) {
        toIndex = instances.findIndex((i) => i.uid === overData.uid);
      } else if (over.id === "canvas-drop-area" || over.id === "outline-drop-area") {
        toIndex = instances.length - 1;
      }
      if (fromIndex !== -1 && toIndex !== -1 && fromIndex !== toIndex) {
        reorder(fromIndex, toIndex);
      }
    }
  }

  return (
    <div
      className={`flex h-screen min-h-0 w-full flex-col bg-stone-100${darkMode ? " app-dark" : ""}`}
    >
      <Toolbar />
      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragCancel={() => setActiveDrag(null)}
      >
        {/* Layout: 3-column on desktop, vertical stack on mobile.
             Mobile order: palette (top, horizontal scroll) → canvas → property panel.
             The Outline list (layout/reorder) is desktop-only — on mobile users
             reorder by selecting + tapping arrows in the property panel header. */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col md:flex-row">
          {/* Aside: full-width top bar on mobile, fixed-width left rail on
              md+. `w-full min-w-0` + `max-w-full` on mobile is what forces
              the horizontal-scroll pill container inside to clip overflow
              instead of stretching the entire layout sideways. */}
          <aside className="flex w-full min-w-0 max-w-full shrink-0 flex-row overflow-hidden border-b border-stone-200 bg-white md:w-[260px] md:max-w-none md:flex-col md:overflow-visible md:border-b-0 md:border-r">
            <div className="flex min-w-0 flex-1 flex-row overflow-hidden md:min-h-0 md:flex-[3] md:flex-col md:overflow-visible">
              <ModulePalette />
            </div>
            <div className="hidden md:flex md:min-h-0 md:flex-[2] md:flex-col">
              <Outline />
            </div>
          </aside>

          <Canvas />

          <PropertyPanel />
        </div>
        <DragOverlay dropAnimation={null}>
          {activeDrag?.source === "palette" ? (
            <div className="rounded-md border border-blue-500 bg-white px-3 py-2 text-xs font-medium text-stone-900 shadow-lg">
              {getModule(activeDrag.moduleId)?.label ?? activeDrag.moduleId}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
