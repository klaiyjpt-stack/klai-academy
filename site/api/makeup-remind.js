// 보강 리마인더 — 매일 17시(KST) 실행. 내일 보강(status=scheduled) 찾아 학부모께 문자.
// Vercel Cron이 호출. 수동 테스트: /api/makeup-remind?token=klai_cron_7k2p
import crypto from "crypto";
const SUPABASE_URL = "https://hxlzccwqxamtsjrrtcdq.supabase.co";
const ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4bHpjY3dxeGFtdHNqcnJ0Y2RxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYyODA2NzgsImV4cCI6MjEwMTg1NjY3OH0.V19Jbcb7fS1lW6SwsZrn-dCTkUPaNN1KmBbdslDxfr4";
const TOKEN = "klai_cron_7k2p";

function normPhone(p){ return String(p||"").replace(/[^0-9]/g,""); }
async function sb(path, opts){
  const KEY = process.env.SUPABASE_SERVICE_ROLE;
  // apikey=공개키(항상 유효), Authorization=서비스키 → 신/구 키 형식 모두 호환
  return fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...opts, headers: { apikey: ANON, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json", ...(opts&&opts.headers||{}) }
  });
}
async function solapi(to, text){
  const KEY = process.env.SOLAPI_API_KEY, SECRET = process.env.SOLAPI_API_SECRET, FROM = process.env.SOLAPI_SENDER;
  const date = new Date().toISOString();
  const salt = crypto.randomBytes(32).toString("hex");
  const sig = crypto.createHmac("sha256", SECRET).update(date + salt).digest("hex");
  const auth = `HMAC-SHA256 apiKey=${KEY}, date=${date}, salt=${salt}, signature=${sig}`;
  const msg = { to: normPhone(to), from: normPhone(FROM), text };
  if (Buffer.byteLength(text, "utf8") > 90) { msg.type = "LMS"; msg.subject = "보강 안내"; }
  const r = await fetch("https://api.solapi.com/messages/v4/send", {
    method: "POST", headers: { Authorization: auth, "Content-Type": "application/json" }, body: JSON.stringify({ message: msg }) });
  return { ok: r.ok, body: await r.text() };
}

export default async function handler(req, res) {
  if (req.query.token !== TOKEN && !req.headers["x-vercel-cron"]) return res.status(403).json({ error: "forbidden" });
  if (!process.env.SUPABASE_SERVICE_ROLE || !process.env.SOLAPI_API_KEY || !process.env.SOLAPI_API_SECRET || !process.env.SOLAPI_SENDER)
    return res.status(500).json({ error: "환경변수 미설정: SOLAPI_API_KEY / SOLAPI_API_SECRET / SOLAPI_SENDER 필요" });

  // 내일(KST) 00:00 ~ 24:00 범위를 UTC로 환산
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 3600e3);
  const startUTC = new Date(Date.UTC(kst.getUTCFullYear(), kst.getUTCMonth(), kst.getUTCDate() + 1, 0, 0, 0) - 9 * 3600e3);
  const endUTC = new Date(startUTC.getTime() + 24 * 3600e3);
  const q = `makeup?status=eq.scheduled&reminded=eq.false&makeup_at=gte.${startUTC.toISOString()}&makeup_at=lt.${endUTC.toISOString()}&select=id,student_name,parent_phone,makeup_at`;

  try {
    const r = await sb(q, { method: "GET" });
    const rows = await r.json();
    if (!Array.isArray(rows)) return res.status(500).json({ error: "조회 실패", detail: rows });
    let sent = 0, skipped = 0, failed = [];
    for (const row of rows) {
      if (!row.parent_phone) { skipped++; continue; }
      const at = new Date(row.makeup_at);
      const k = new Date(at.getTime() + 9 * 3600e3);
      const hh = k.getUTCHours(), mm = k.getUTCMinutes();
      const timeStr = `${hh}시${mm ? mm + "분" : ""}`;
      const text = `[클라이 어학원] 안녕하세요. 내일 ${timeStr} ${row.student_name} 학생 보충수업이 있습니다. 잊지 마시고 참석 부탁드립니다.`;
      const s = await solapi(row.parent_phone, text);
      if (s.ok) {
        await sb(`makeup?id=eq.${row.id}`, { method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ reminded: true }) });
        sent++;
      } else failed.push({ id: row.id, err: s.body });
    }
    return res.status(200).json({ ok: true, due: rows.length, sent, skipped, failed });
  } catch (e) { return res.status(500).json({ error: String(e) }); }
}
