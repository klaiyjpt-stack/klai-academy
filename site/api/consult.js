// 상담 관리 프록시 — admin.html → (여기서 원장 인증) → Apps Script 웹앱(구글시트+문자).
// CORS 회피(서버-서버 호출) + service 노출 없음. WEBAPP/SECRET은 서버함수에만 존재(브라우저 안 감).
const SUPABASE_URL = "https://hxlzccwqxamtsjrrtcdq.supabase.co";
const ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4bHpjY3dxeGFtdHNqcnJ0Y2RxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYyODA2NzgsImV4cCI6MjEwMTg1NjY3OH0.V19Jbcb7fS1lW6SwsZrn-dCTkUPaNN1KmBbdslDxfr4";
const ADMINS = ["klai.yj.pt@gmail.com", "klai.yj.pt.1@gmail.com"];
const WEBAPP = "https://script.google.com/macros/s/AKfycbxcVwOEsw8JWvySqKLzzcD8pXTLPHRWmydyRB1PXIfoFMPfTudP6RsV2b-5tn9k40KZ/exec";
const SECRET = "klai_consult_9x7Qk2mVp4tR";

async function caller(req) {
  const token = (req.headers.authorization || "").replace(/^Bearer /, "");
  if (!token) return null;
  const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: { apikey: ANON, Authorization: `Bearer ${token}` } });
  if (!r.ok) return null;
  return r.json();
}

export default async function handler(req, res) {
  const u = await caller(req);
  if (!u || !ADMINS.includes(String(u.email || "").toLowerCase())) return res.status(403).json({ error: "원장 전용" });
  try {
    if (req.method === "GET") {
      const r = await fetch(`${WEBAPP}?secret=${encodeURIComponent(SECRET)}&action=list`);
      return res.status(200).json(await r.json());
    }
    if (req.method === "POST") {
      const b = req.body || {};
      const r = await fetch(WEBAPP, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret: SECRET, action: "update", row: b.row, date: b.date, status: b.status })
      });
      const d = await r.json();
      return res.status(d && d.error ? 400 : 200).json(d);
    }
    return res.status(405).json({ error: "method" });
  } catch (e) { return res.status(500).json({ error: String(e) }); }
}
