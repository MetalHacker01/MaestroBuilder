"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { nanoid } from "nanoid";
import type { ModuleInstance, ModuleProps, Template, Theme } from "@/lib/modules/types";
import { getDefaultProps, getModule } from "@/lib/modules/registry";

type State = {
  instances: ModuleInstance[];
  selectedUid: string | null;
  templateName: string;
  theme: Theme;
};

type Actions = {
  add: (moduleId: string, atIndex?: number) => string;
  remove: (uid: string) => void;
  move: (uid: string, toIndex: number) => void;
  reorder: (fromIndex: number, toIndex: number) => void;
  duplicate: (uid: string) => void;
  select: (uid: string | null) => void;
  updateProp: (uid: string, key: string, value: unknown) => void;
  setName: (name: string) => void;
  setTheme: (patch: Partial<Theme>) => void;
  loadTemplate: (t: Template) => void;
  reset: () => void;
  toTemplate: () => Template;
};

export const useEditor = create<State & Actions>()(
  persist(
    (set, get) => ({
      instances: [],
      selectedUid: null,
      templateName: "Untitled email",
      theme: { darkMode: false },

      add: (moduleId, atIndex) => {
        const m = getModule(moduleId);
        if (!m) throw new Error(`Unknown module: ${moduleId}`);
        const instance: ModuleInstance = {
          uid: nanoid(8),
          moduleId,
          props: getDefaultProps(moduleId),
        };
        const list = [...get().instances];
        const idx = atIndex == null ? list.length : Math.max(0, Math.min(atIndex, list.length));
        list.splice(idx, 0, instance);
        set({ instances: list, selectedUid: instance.uid });
        return instance.uid;
      },

      remove: (uid) =>
        set((s) => ({
          instances: s.instances.filter((i) => i.uid !== uid),
          selectedUid: s.selectedUid === uid ? null : s.selectedUid,
        })),

      move: (uid, toIndex) =>
        set((s) => {
          const from = s.instances.findIndex((i) => i.uid === uid);
          if (from === -1) return s;
          const list = [...s.instances];
          const [item] = list.splice(from, 1);
          const idx = Math.max(0, Math.min(toIndex, list.length));
          list.splice(idx, 0, item);
          return { instances: list };
        }),

      reorder: (fromIndex, toIndex) =>
        set((s) => {
          if (fromIndex === toIndex) return s;
          const list = [...s.instances];
          const [item] = list.splice(fromIndex, 1);
          list.splice(toIndex, 0, item);
          return { instances: list };
        }),

      duplicate: (uid) =>
        set((s) => {
          const idx = s.instances.findIndex((i) => i.uid === uid);
          if (idx === -1) return s;
          const original = s.instances[idx];
          const copy: ModuleInstance = {
            uid: nanoid(8),
            moduleId: original.moduleId,
            props: JSON.parse(JSON.stringify(original.props)) as ModuleProps,
          };
          const list = [...s.instances];
          list.splice(idx + 1, 0, copy);
          return { instances: list, selectedUid: copy.uid };
        }),

      select: (uid) => set({ selectedUid: uid }),

      updateProp: (uid, key, value) =>
        set((s) => ({
          instances: s.instances.map((i) =>
            i.uid === uid ? { ...i, props: { ...i.props, [key]: value } } : i
          ),
        })),

      setName: (name) => set({ templateName: name }),

      setTheme: (patch) => set((s) => ({ theme: { ...s.theme, ...patch } })),

      loadTemplate: (t) =>
        set({
          instances: t.instances.map((i) => ({
            uid: i.uid || nanoid(8),
            moduleId: i.moduleId,
            props: i.props,
          })),
          templateName: t.name ?? "Untitled email",
          theme: t.theme ?? { darkMode: false },
          selectedUid: null,
        }),

      reset: () =>
        set({
          instances: [],
          selectedUid: null,
          templateName: "Untitled email",
          theme: { darkMode: false },
        }),

      toTemplate: () => ({
        version: 1,
        name: get().templateName,
        theme: get().theme,
        instances: get().instances,
      }),
    }),
    {
      name: "maestro-builder-state",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        instances: s.instances,
        templateName: s.templateName,
        theme: s.theme,
      }),
    }
  )
);
