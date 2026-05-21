"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import { useEffect, useCallback } from "react";
import {
  Bold, Italic, Underline as UnderlineIcon, List, ListOrdered,
  Heading2, Heading3, Minus,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

function ToolbarBtn({
  active,
  onClick,
  title,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      className={cn(
        "flex items-center justify-center w-7 h-7 rounded-lg text-sm font-semibold transition-colors",
        active
          ? "bg-terra-100 text-terra-700"
          : "text-ink-muted hover:bg-sand hover:text-ink"
      )}
    >
      {children}
    </button>
  );
}

export function TiptapEditor({ value, onChange, placeholder, className }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading:     { levels: [2, 3] },
        bulletList:  { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
        underline:   false,
        link:        false,
      }),
      Placeholder.configure({
        placeholder: placeholder ?? "Beschrijf de vacature: taken, tijden en wat vrijwilligers kunnen verwachten...",
      }),
      Underline,
    ],
    content: value || "",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "tiptap-content focus:outline-none min-h-[200px] px-4 py-3",
      },
    },
  });

  const setExternal = useCallback(
    (html: string) => {
      if (!editor) return;
      const current = editor.getHTML();
      if (current !== html) editor.commands.setContent(html || "");
    },
    [editor]
  );

  useEffect(() => { setExternal(value); }, [value, setExternal]);

  const wordCount = editor
    ? editor.getText().trim().split(/\s+/).filter(Boolean).length
    : 0;

  if (!editor) return null;

  return (
    <div className={cn("flex flex-col rounded-xl border border-sand overflow-hidden bg-white", className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-sand bg-cream/50 flex-wrap">
        <ToolbarBtn
          title="Kop 2"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 size={14} />
        </ToolbarBtn>
        <ToolbarBtn
          title="Kop 3"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 size={14} />
        </ToolbarBtn>

        <div className="w-px h-4 bg-sand mx-0.5" />

        <ToolbarBtn
          title="Vet"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold size={14} />
        </ToolbarBtn>
        <ToolbarBtn
          title="Cursief"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic size={14} />
        </ToolbarBtn>
        <ToolbarBtn
          title="Onderstreept"
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon size={14} />
        </ToolbarBtn>

        <div className="w-px h-4 bg-sand mx-0.5" />

        <ToolbarBtn
          title="Opsomming"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List size={14} />
        </ToolbarBtn>
        <ToolbarBtn
          title="Genummerde lijst"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered size={14} />
        </ToolbarBtn>

        <div className="w-px h-4 bg-sand mx-0.5" />

        <ToolbarBtn
          title="Horizontale lijn"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <Minus size={14} />
        </ToolbarBtn>

        <div className="ml-auto text-[11px] text-ink-muted font-medium tabular-nums">
          {wordCount} {wordCount === 1 ? "woord" : "woorden"}
        </div>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} className="flex-1" />
    </div>
  );
}
