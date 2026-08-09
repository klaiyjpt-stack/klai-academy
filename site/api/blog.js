// 네이버 블로그 RSS → 최신 글 JSON. Vercel 서버리스(자동 인식).
// 블로그에 글 올리면 최대 1시간 내 홈페이지에 반영(캐시 s-maxage=3600).
const BLOG_ID = "elea6540571";
const FEED = `https://rss.blog.naver.com/${BLOG_ID}.xml`;

function tag(block, name) {
  const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, "i"));
  let v = m ? m[1] : "";
  v = v.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1"); // CDATA 벗기기
  return v.trim();
}
function fmtDate(s) {
  const d = new Date(s);
  if (isNaN(d)) return "";
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}
function snippet(html, n = 70) {
  const t = html.replace(/<[^>]*>/g, "").replace(/&[a-z]+;/gi, " ").replace(/\s+/g, " ").trim();
  return t.length > n ? t.slice(0, n) + "…" : t;
}

export default async function handler(req, res) {
  try {
    const r = await fetch(FEED, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!r.ok) throw new Error("feed " + r.status);
    const xml = await r.text();
    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].slice(0, 6).map((m) => {
      const b = m[1];
      return {
        title: tag(b, "title"),
        link: tag(b, "link"),
        date: fmtDate(tag(b, "pubDate")),
        snippet: snippet(tag(b, "description")),
      };
    }).filter((x) => x.title && x.link);
    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
    res.status(200).json({ items });
  } catch (e) {
    res.status(200).json({ items: [], error: String(e) });
  }
}
