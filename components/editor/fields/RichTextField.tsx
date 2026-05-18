"use client";

import { useEditor as useTiptap, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { useEffect } from "react";
import { Bold, Italic, Link as LinkIcon, List, ListOrdered, Underline as UnderlineIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value: string;
  onChange: (v: string) => void;
};

export function RichTextField({ label, value, onChange }: Props) {
  const editor = useTiptap({
    extensions: [
      // Tiptap v3 StarterKit bundles a default Link extension. We need
      // custom Link config (autolink + target=_blank) so disable the
      // bundled one and provide our own — otherwise Tiptap warns about
      // "Duplicate extension names found: ['link']" on every keystroke.
      StarterKit.configure({
        heading: false,
        horizontalRule: false,
        codeBlock: false,
        blockquote: false,
        link: false,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: "noopener", target: "_blank" },
      }),
    ],
    content: value || "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none min-h-[80px] px-3 py-2 text-sm text-zinc-900",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (editor.getHTML() !== value) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [value, editor]);

  if (!editor) {
    return (
      <div className="flex flex-col gap-1">
        <span className="text-[11px] font-medium text-stone-600">{label}</span>
        <div className="rounded-md border border-stone-200 bg-stone-50 p-3 text-xs text-stone-400">
          Loading editor…
        </div>
      </div>
    );
  }

  const tools: {
    icon: typeof Bold;
    label: string;
    isActive: () => boolean;
    onClick: () => void;
  }[] = [
    {
      icon: Bold,
      label: "Bold",
      isActive: () => editor.isActive("bold"),
      onClick: () => editor.chain().focus().toggleBold().run(),
    },
    {
      icon: Italic,
      label: "Italic",
      isActive: () => editor.isActive("italic"),
      onClick: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      icon: UnderlineIcon,
      label: "Strike",
      isActive: () => editor.isActive("strike"),
      onClick: () => editor.chain().focus().toggleStrike().run(),
    },
    {
      icon: List,
      label: "Bulleted list",
      isActive: () => editor.isActive("bulletList"),
      onClick: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      icon: ListOrdered,
      label: "Numbered list",
      isActive: () => editor.isActive("orderedList"),
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      icon: LinkIcon,
      label: "Link",
      isActive: () => editor.isActive("link"),
      onClick: () => {
        const prev = editor.getAttributes("link").href as string | undefined;
        const url = window.prompt("Link URL", prev || "https://");
        if (url === null) return;
        if (url === "") {
          editor.chain().focus().unsetLink().run();
        } else {
          editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
        }
      },
    },
  ];

  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] font-medium text-stone-600">{label}</span>
      <div className="overflow-hidden rounded-md border border-stone-200 bg-white transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
        <div className="flex items-center gap-0.5 border-b border-stone-200 bg-stone-50 px-1 py-1">
          {tools.map(({ icon: Icon, label: l, isActive, onClick }) => (
            <button
              key={l}
              type="button"
              title={l}
              onClick={onClick}
              className={cn(
                "rounded p-1 text-stone-500 transition hover:bg-stone-200 hover:text-stone-900",
                isActive() && "bg-stone-200 text-stone-900"
              )}
            >
              <Icon size={13} />
            </button>
          ))}
        </div>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
