"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { TextStyle, Color } from "@tiptap/extension-text-style";
import Highlight from "@tiptap/extension-highlight";
import CharacterCount from "@tiptap/extension-character-count";
import { useEffect, useCallback, useState } from "react";
import {
  Bold, Italic, Underline as UnderlineIcon, List, ListOrdered,
  Heading1, Heading2, Heading3, Minus, Link as LinkIcon, Image as ImageIcon,
  Quote, Code, Redo, Undo, Highlighter, Strikethrough, RemoveFormatting,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

function Btn({
  active, onClick, title, disabled, children,
}: {
  active?: boolean;
  onClick: () => void;
  title: string;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      className={cn(
        "flex items-center justify-center w-7 h-7 rounded-lg text-sm font-semibold transition-colors disabled:opacity-30",
        active
          ? "bg-[#C8522A]/15 text-[#C8522A]"
          : "text-[#6B5E54] hover:bg-[#F0EDE8] hover:text-[#1C1814]"
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-4 bg-[#E8E4DE] mx-0.5" />;
}

export function BlogEditor({ value, onChange, placeholder, className }: Props) {
  const [linkUrl, setLinkUrl]       = useState("");
  const [showLink, setShowLink]     = useState(false);
  const [imageUrl, setImageUrl]     = useState("");
  const [showImage, setShowImage]   = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading:     { levels: [1, 2, 3] },
        bulletList:  { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
        codeBlock:   {},
      }),
      Placeholder.configure({ placeholder: placeholder ?? "Begin hier met schrijven..." }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      CharacterCount,
      Link.configure({ openOnClick: false, autolink: true, linkOnPaste: true }),
      Image.configure({ allowBase64: false }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: { class: "tiptap-content focus:outline-none min-h-[500px] px-6 py-5 prose prose-slate max-w-none" },
    },
  });

  const setExternal = useCallback(
    (html: string) => {
      if (!editor) return;
      if (editor.getHTML() !== html) editor.commands.setContent(html || "");
    },
    [editor]
  );
  useEffect(() => { setExternal(value); }, [value, setExternal]);

  const insertLink = () => {
    if (!editor || !linkUrl) return;
    const url = linkUrl.startsWith("http") ? linkUrl : `https://${linkUrl}`;
    if (editor.state.selection.empty) {
      editor.chain().focus().insertContent(`<a href="${url}">${url}</a>`).run();
    } else {
      editor.chain().focus().setLink({ href: url }).run();
    }
    setLinkUrl("");
    setShowLink(false);
  };

  const insertImage = () => {
    if (!editor || !imageUrl) return;
    editor.chain().focus().setImage({ src: imageUrl }).run();
    setImageUrl("");
    setShowImage(false);
  };

  const charCount = editor ? editor.storage.characterCount.characters() : 0;
  const wordCount = editor ? editor.getText().trim().split(/\s+/).filter(Boolean).length : 0;

  if (!editor) return null;

  return (
    <div className={cn("flex flex-col rounded-xl border border-[#E8E4DE] overflow-hidden bg-white", className)}>

      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-[#E8E4DE] bg-[#FAF9F7] flex-wrap">
        {/* History */}
        <Btn title="Ongedaan maken" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
          <Undo size={13} />
        </Btn>
        <Btn title="Opnieuw" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
          <Redo size={13} />
        </Btn>
        <Divider />

        {/* Headings */}
        <Btn title="Kop 1" active={editor.isActive("heading", { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
          <Heading1 size={13} />
        </Btn>
        <Btn title="Kop 2" active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 size={13} />
        </Btn>
        <Btn title="Kop 3" active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          <Heading3 size={13} />
        </Btn>
        <Divider />

        {/* Inline formatting */}
        <Btn title="Vet" active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold size={13} />
        </Btn>
        <Btn title="Cursief" active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic size={13} />
        </Btn>
        <Btn title="Onderstreept" active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <UnderlineIcon size={13} />
        </Btn>
        <Btn title="Doorgehaald" active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}>
          <Strikethrough size={13} />
        </Btn>
        <Btn title="Markeren" active={editor.isActive("highlight")}
          onClick={() => editor.chain().focus().toggleHighlight({ color: "#FFF176" }).run()}>
          <Highlighter size={13} />
        </Btn>
        <Divider />

        {/* Lists */}
        <Btn title="Opsomming" active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List size={13} />
        </Btn>
        <Btn title="Genummerd" active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered size={13} />
        </Btn>
        <Divider />

        {/* Blocks */}
        <Btn title="Citaat" active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Quote size={13} />
        </Btn>
        <Btn title="Code" active={editor.isActive("codeBlock")}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
          <Code size={13} />
        </Btn>
        <Btn title="Horizontale lijn" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          <Minus size={13} />
        </Btn>
        <Divider />

        {/* Link */}
        <Btn title="Link invoegen" active={editor.isActive("link") || showLink}
          onClick={() => { setShowLink(v => !v); setShowImage(false); }}>
          <LinkIcon size={13} />
        </Btn>

        {/* Image */}
        <Btn title="Afbeelding invoegen" active={showImage}
          onClick={() => { setShowImage(v => !v); setShowLink(false); }}>
          <ImageIcon size={13} />
        </Btn>

        {/* Remove formatting */}
        <Btn title="Opmaak verwijderen"
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}>
          <RemoveFormatting size={13} />
        </Btn>

        {/* Stats */}
        <div className="ml-auto flex items-center gap-3 text-[10px] text-[#9E9890] font-medium tabular-nums">
          <span>{wordCount} woorden</span>
          <span>{charCount} tekens</span>
        </div>
      </div>

      {/* Link input */}
      {showLink && (
        <div className="flex items-center gap-2 px-3 py-2 border-b border-[#E8E4DE] bg-blue-50">
          <LinkIcon size={14} className="text-blue-500 shrink-0" />
          <input
            autoFocus
            type="url"
            value={linkUrl}
            onChange={e => setLinkUrl(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); insertLink(); } if (e.key === "Escape") setShowLink(false); }}
            placeholder="https://..."
            className="flex-1 text-sm bg-transparent border-none outline-none text-[#1C1814] placeholder:text-[#9E9890]"
          />
          <button type="button" onClick={insertLink}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors px-2 py-0.5 rounded-md hover:bg-blue-100">
            Invoegen
          </button>
          {editor.isActive("link") && (
            <button type="button" onClick={() => editor.chain().focus().unsetLink().run()}
              className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors px-2 py-0.5 rounded-md hover:bg-red-50">
              Verwijderen
            </button>
          )}
        </div>
      )}

      {/* Image URL input */}
      {showImage && (
        <div className="flex items-center gap-2 px-3 py-2 border-b border-[#E8E4DE] bg-amber-50">
          <ImageIcon size={14} className="text-amber-500 shrink-0" />
          <input
            autoFocus
            type="url"
            value={imageUrl}
            onChange={e => setImageUrl(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); insertImage(); } if (e.key === "Escape") setShowImage(false); }}
            placeholder="https://... (directe afbeelding-URL)"
            className="flex-1 text-sm bg-transparent border-none outline-none text-[#1C1814] placeholder:text-[#9E9890]"
          />
          <button type="button" onClick={insertImage}
            className="text-xs font-semibold text-amber-600 hover:text-amber-800 transition-colors px-2 py-0.5 rounded-md hover:bg-amber-100">
            Invoegen
          </button>
        </div>
      )}

      {/* Editor content */}
      <EditorContent editor={editor} className="flex-1" />
    </div>
  );
}
