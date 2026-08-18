import { Node, mergeAttributes } from "@tiptap/core";
import type { DOMOutputSpec } from "@tiptap/pm/model";

export interface PodcastEmbedOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    podcastEmbed: {
      setPodcastEmbed: (options: { audioUrl: string; title?: string; transcript?: string }) => ReturnType;
    };
  }
}

/**
 * Atom node voor een podcast-fragment: een <audio>-speler met eronder een
 * inklapbare transcript-sectie (<details>). De transcript-tekst wordt als
 * platte tekst opgeslagen en bij render omgezet naar losse <p>'s, zodat
 * plakken vanuit bv. Otter/Descript geen rommelige HTML meesleept.
 */
export const PodcastEmbed = Node.create<PodcastEmbedOptions>({
  name: "podcastEmbed",
  group: "block",
  atom: true,
  draggable: true,

  addOptions() {
    return { HTMLAttributes: {} };
  },

  addAttributes() {
    return {
      audioUrl: { default: null, parseHTML: el => el.getAttribute("data-audio-url") },
      title: { default: null, parseHTML: el => el.getAttribute("data-title") },
      transcript: {
        default: "",
        parseHTML: el => {
          const box = el.querySelector(".podcast-embed-transcript-body");
          if (!box) return "";
          return Array.from(box.querySelectorAll("p")).map(p => p.textContent ?? "").join("\n\n");
        },
      },
    };
  },

  parseHTML() {
    return [{ tag: "div.podcast-embed" }];
  },

  renderHTML({ HTMLAttributes, node }) {
    const { audioUrl, title, transcript } = node.attrs as { audioUrl: string; title: string | null; transcript: string };
    const paragraphs: DOMOutputSpec[] = (transcript || "")
      .split(/\n{2,}/)
      .map((p: string) => p.trim())
      .filter(Boolean)
      .map((p: string) => ["p", {}, p]);

    const children: DOMOutputSpec[] = [];
    if (title) children.push(["p", { class: "podcast-embed-title" }, title]);
    children.push(["audio", { controls: "", src: audioUrl, class: "podcast-embed-audio" }]);
    if (transcript) {
      children.push([
        "details",
        { class: "podcast-embed-transcript" },
        ["summary", {}, "Transcript"],
        ["div", { class: "podcast-embed-transcript-body" }, ...paragraphs],
      ]);
    }

    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: "podcast-embed",
        "data-audio-url": audioUrl,
        "data-title": title,
      }),
      ...children,
    ];
  },

  addCommands() {
    return {
      setPodcastEmbed:
        options =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs: options }),
    };
  },
});
