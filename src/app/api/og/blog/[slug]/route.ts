import { ImageResponse } from "next/og";
import React from "react";
import { db, blogPosts } from "@/db";
import { eq } from "drizzle-orm";
import { buildCoverSvg, svgToDataUri, themeForSeed } from "@/lib/blog-cover";

export const runtime = "nodejs";
export const revalidate = 60;

function wrapTitle(title: string, max = 22): string[] {
  const words = title.split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if (!cur) { cur = w; continue; }
    if ((cur + " " + w).length <= max) cur += " " + w;
    else { lines.push(cur); cur = w; }
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 4);
}

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } },
) {
  let title = "Bijeen — Inzichten voor welzijnsorganisaties";
  let tags: string[] = [];
  try {
    const [post] = await db
      .select({ title: blogPosts.title, tags: blogPosts.tags })
      .from(blogPosts)
      .where(eq(blogPosts.slug, params.slug));
    if (post) {
      title = post.title;
      tags = post.tags ?? [];
    }
  } catch {
    // DB niet beschikbaar — ga door met fallback waarden
  }

  const t = themeForSeed(params.slug);
  const titleLines = wrapTitle(title);
  const chips = tags.filter(Boolean).slice(0, 3);

  const circle = (opacity: number, size: number, top: string, right: string) =>
    React.createElement("div", {
      style: {
        position: "absolute", top, right,
        width: `${size}px`, height: `${size}px`,
        borderRadius: "50%", background: t.accent, opacity,
      },
    });

  const chipEls = chips.map((tag) =>
    React.createElement(
      "div",
      {
        key: tag,
        style: {
          display: "flex", alignItems: "center",
          padding: "10px 22px", borderRadius: "999px",
          background: t.chip, color: t.chipInk,
          fontSize: "22px", fontWeight: 700,
        },
      },
      `#${tag}`,
    ),
  );

  const titleEls = titleLines.map((ln, i) =>
    React.createElement(
      "div",
      {
        key: i,
        style: {
          fontSize: "62px", fontWeight: 800, lineHeight: 1.08,
          letterSpacing: "-1px", color: t.ink, maxWidth: "980px",
        },
      },
      ln,
    ),
  );

  const brand = React.createElement(
    "div",
    { style: { display: "flex", alignItems: "center", gap: "16px", zIndex: 1 } },
    React.createElement(
      "div",
      {
        style: {
          width: "52px", height: "52px", borderRadius: "13px",
          background: "#FAF9F7", display: "flex",
          alignItems: "center", justifyContent: "center",
        },
      },
      React.createElement("div", {
        style: { width: "26px", height: "26px", borderRadius: "50%", background: "#C8522A" },
      }),
    ),
    React.createElement(
      "div",
      { style: { display: "flex", flexDirection: "column" } },
      React.createElement("div", { style: { fontSize: "30px", fontWeight: 800, color: t.ink } }, "Bijeen"),
      React.createElement("div", { style: { fontSize: "15px", fontWeight: 600, color: t.inkSoft } }, "Inzichten voor het sociaal domein"),
    ),
  );

  const element = React.createElement(
    "div",
    {
      style: {
        width: "1200px", height: "630px",
        display: "flex", flexDirection: "column",
        justifyContent: "space-between", padding: "72px",
        background: `linear-gradient(135deg, ${t.bg} 0%, ${t.bg2} 100%)`,
        color: t.ink, fontFamily: "sans-serif", position: "relative",
      },
    },
    circle(0.18, 420, "-120px", "-80px"),
    circle(0.14, 320, "-160px", "120px"),
    React.createElement("div", { style: { display: "flex", gap: "14px", zIndex: 1 } }, ...chipEls),
    React.createElement("div", { style: { display: "flex", flexDirection: "column", zIndex: 1 } }, ...titleEls),
    brand,
  );

  try {
    return new ImageResponse(element, { width: 1200, height: 630 });
  } catch {
    const svg = buildCoverSvg({ title, tags, seed: params.slug, w: 1200, h: 630 });
    return new Response(svgToDataUri(svg), {
      headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=3600, s-maxage=3600" },
    });
  }
}
