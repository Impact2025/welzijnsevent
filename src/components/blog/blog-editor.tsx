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
import Youtube from "@tiptap/extension-youtube";
import { PodcastEmbed } from "./podcast-embed-extension";
import { useEffect, useCallback, useState, useRef, forwardRef, useImperativeHandle } from "react";
import {
  Bold, Italic, Underline as UnderlineIcon, List, ListOrdered,
  Heading1, Heading2, Heading3, Minus, Link as LinkIcon, Image as ImageIcon,
  Quote, Code, Redo, Undo, Highlighter, Strikethrough, RemoveFormatting,
  Youtube as YoutubeIcon, Mic, Upload, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface BlogEditorHandle {
  /** Zoekt ankertekst in document en linkt die. Geeft true als gevonden, false als fallback op cursor. */
  insertLink: (text: string, href: string) => boolean;
}

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

export const BlogEditor = forwardRef<BlogEditorHandle, Props>(function BlogEditor(
  { value, onChange, placeholder, className }: Props,
  ref,
) {
  const [linkUrl, setLinkUrl]       = useState("");
  const [showLink, setShowLink]     = useState(false);
  const [imageUrl, setImageUrl]     = useState("");
  const [showImage, setShowImage]   = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [showYoutube, setShowYoutube] = useState(false);
  const [podcastUrl, setPodcastUrl]         = useState("");
  const [podcastTitle, setPodcastTitle]     = useState("");
  const [podcastTranscript, setPodcastTranscript] = useState("");
  const [showPodcast, setShowPodcast]       = useState(false);
  const [podcastUploading, setPodcastUploading] = useState(false);
  const [podcastUploadError, setPodcastUploadError] = useState("");
  const podcastFileRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading:     { levels: [1, 2, 3] },
        bulletList:  { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
        codeBlock:   {},
        // StarterKit v3 bundles these — disable so our explicit configs take effect
        underline:   false,
        link:        false,
      }),
      Placeholder.configure({ placeholder: placeholder ?? "Begin hier met schrijven..." }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      CharacterCount,
      Link.configure({ openOnClick: false, autolink: true, linkOnPaste: true }),
      Image.configure({ allowBase64: false }),
      Youtube.configure({ nocookie: true, width: 640, height: 360 }),
      PodcastEmbed,
    ],
    content: value || "",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: { class: "tiptap-content focus:outline-none min-h-[500px] px-6 py-5 prose prose-slate max-w-none" },
    },
  });

  useImperativeHandle(ref, () => ({
    insertLink: (text: string, href: string): boolean => {
      if (!editor) return false;
      const isExternal = href.startsWith("http");
      const linkAttrs = {
        href,
        target: isExternal ? "_blank" : null,
        rel:    isExternal ? "noopener noreferrer" : null,
      };

      const { doc } = editor.state;
      let foundFrom = -1;
      let foundTo   = -1;
      const needle  = text.toLowerCase().trim();

      // Exacte match over node-grenzen heen via volledige tekst van elke node
      doc.descendants((node, pos) => {
        if (foundFrom !== -1) return false;
        if (node.isText && node.text) {
          const haystack = node.text.toLowerCase();
          const idx = haystack.indexOf(needle);
          if (idx !== -1) {
            foundFrom = pos + idx;
            foundTo   = foundFrom + text.length;
          }
        }
      });

      if (foundFrom !== -1) {
        editor.chain().focus()
          .setTextSelection({ from: foundFrom, to: foundTo })
          .setLink(linkAttrs)
          .run();
        return true;
      }

      // Fallback: voeg in op cursorpositie
      const attrs = isExternal ? ` target="_blank" rel="noopener noreferrer"` : "";
      editor.chain().focus().insertContent(`<a href="${href}"${attrs}>${text}</a> `).run();
      return false;
    },
  }), [editor]);

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

  const insertYoutube = () => {
    if (!editor || !youtubeUrl) return;
    editor.commands.setYoutubeVideo({ src: youtubeUrl });
    setYoutubeUrl("");
    setShowYoutube(false);
  };

  const insertPodcast = () => {
    if (!editor || !podcastUrl) return;
    editor.chain().focus().setPodcastEmbed({
      audioUrl: podcastUrl,
      title: podcastTitle || undefined,
      transcript: podcastTranscript || undefined,
    }).run();
    setPodcastUrl("");
    setPodcastTitle("");
    setPodcastTranscript("");
    setShowPodcast(false);
  };

  async function uploadPodcastFile(file: File) {
    setPodcastUploading(true);
    setPodcastUploadError("");
    const form = new FormData();
    form.append("file", file);
    try {
      const res  = await fetch("/api/upload/audio", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) { setPodcastUploadError(data.error ?? "Upload mislukt"); return; }
      setPodcastUrl(data.url);
    } catch {
      setPodcastUploadError("Upload mislukt");
    } finally {
      setPodcastUploading(false);
    }
  }

  function handlePodcastFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadPodcastFile(file);
    e.target.value = "";
  }

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
          onClick={() => { setShowLink(v => !v); setShowImage(false); setShowYoutube(false); setShowPodcast(false); }}>
          <LinkIcon size={13} />
        </Btn>

        {/* Image */}
        <Btn title="Afbeelding invoegen" active={showImage}
          onClick={() => { setShowImage(v => !v); setShowLink(false); setShowYoutube(false); setShowPodcast(false); }}>
          <ImageIcon size={13} />
        </Btn>

        {/* YouTube */}
        <Btn title="YouTube-video invoegen" active={showYoutube}
          onClick={() => { setShowYoutube(v => !v); setShowLink(false); setShowImage(false); setShowPodcast(false); }}>
          <YoutubeIcon size={13} />
        </Btn>

        {/* Podcast + transcript */}
        <Btn title="Podcast met transcript invoegen" active={showPodcast}
          onClick={() => { setShowPodcast(v => !v); setShowLink(false); setShowImage(false); setShowYoutube(false); }}>
          <Mic size={13} />
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

      {/* YouTube URL input */}
      {showYoutube && (
        <div className="flex items-center gap-2 px-3 py-2 border-b border-[#E8E4DE] bg-red-50">
          <YoutubeIcon size={14} className="text-red-500 shrink-0" />
          <input
            autoFocus
            type="url"
            value={youtubeUrl}
            onChange={e => setYoutubeUrl(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); insertYoutube(); } if (e.key === "Escape") setShowYoutube(false); }}
            placeholder="https://www.youtube.com/watch?v=..."
            className="flex-1 text-sm bg-transparent border-none outline-none text-[#1C1814] placeholder:text-[#9E9890]"
          />
          <button type="button" onClick={insertYoutube}
            className="text-xs font-semibold text-red-600 hover:text-red-800 transition-colors px-2 py-0.5 rounded-md hover:bg-red-100">
            Invoegen
          </button>
        </div>
      )}

      {/* Podcast + transcript input */}
      {showPodcast && (
        <div className="flex flex-col gap-2 px-3 py-3 border-b border-[#E8E4DE] bg-violet-50">
          <div className="flex items-center gap-2">
            <Mic size={14} className="text-violet-500 shrink-0" />
            <input
              autoFocus
              type="url"
              value={podcastUrl}
              onChange={e => setPodcastUrl(e.target.value)}
              placeholder="https://... (directe audio-URL, bv. .mp3)"
              className="flex-1 text-sm bg-white rounded-lg px-2 py-1.5 border border-violet-200 outline-none text-[#1C1814] placeholder:text-[#9E9890]"
            />
            <input ref={podcastFileRef} type="file" accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/mp4,audio/x-m4a,audio/aac"
              onChange={handlePodcastFile} className="hidden" />
            <button type="button" onClick={() => podcastFileRef.current?.click()} disabled={podcastUploading}
              title="Audiobestand uploaden"
              className="flex items-center gap-1.5 shrink-0 text-xs font-semibold text-violet-700 hover:text-violet-900 bg-white border border-violet-200 hover:bg-violet-100 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50">
              {podcastUploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
              Uploaden
            </button>
          </div>
          {podcastUploadError && <p className="text-xs text-red-500 -mt-1">{podcastUploadError}</p>}
          <input
            type="text"
            value={podcastTitle}
            onChange={e => setPodcastTitle(e.target.value)}
            placeholder="Titel van de aflevering (optioneel)"
            className="text-sm bg-white rounded-lg px-2 py-1.5 border border-violet-200 outline-none text-[#1C1814] placeholder:text-[#9E9890]"
          />
          <textarea
            value={podcastTranscript}
            onChange={e => setPodcastTranscript(e.target.value)}
            placeholder="Plak hier het transcript (alinea's gescheiden door een lege regel)..."
            rows={5}
            className="text-sm bg-white rounded-lg px-2 py-1.5 border border-violet-200 outline-none text-[#1C1814] placeholder:text-[#9E9890] resize-y"
          />
          <div className="flex justify-end">
            <button type="button" onClick={insertPodcast} disabled={!podcastUrl}
              className="text-xs font-semibold text-violet-700 hover:text-violet-900 transition-colors px-3 py-1.5 rounded-md hover:bg-violet-100 disabled:opacity-40">
              Invoegen
            </button>
          </div>
        </div>
      )}

      {/* Editor content */}
      <EditorContent editor={editor} className="flex-1" />
    </div>
  );
});
