// 보강 리마인더 — 매일 17시(KST) 실행. 내일 보강(status=scheduled) 찾아 학부모께 문자.
// Vercel Cron이 호출. 수동 테스트: /api/makeup-remind?token=klai_cron_7k2p
import crypto from "crypto";
const SUPABASE_URL = "https://hxlzccwqxamtsjrrtcdq.supabase.co";
const ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4bHpjY3dxeGFtdHNqcnJ0Y2RxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYyODA2NzgsImV4cCI6MjEwMTg1NjY3OH0.V19Jbcb7fS1lW6SwsZrn-dCTkUPaNN1KmBbdslDxfr4";
const TOKEN = "klai_cron_7k2p";

function normPhone(p){ return String(p||"").replace(/[^0-9]/g,""); }
async function sb(path, opts){
  const KEY = process.env.SUPABASE_SERVICE_ROLE;
  // 구 키(service_role JWT, 3파트)=apikey+Bearer / 신 키(sb_secret…, JWT아님)=apikey만
  const isJwt = String(KEY).split(".").length === 3;
  const auth = isJwt ? { apikey: KEY, Authorization: `Bearer ${KEY}` } : { apikey: KEY };
  return fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...opts, headers: { ...auth, "Content-Type": "application/json", ...(opts&&opts.headers||{}) }
  });
}
const KAKAO_PFID = "KA01PF260817180947577udzkuFcQP6K";        // 평택클라이어학원 채널
// 메시지 종류 → 알림톡 템플릿 (승인 후 자동 알림톡, 미승인 시 문자대체)
const TEMPLATES = {
  "보강": "KA01TP260821195022548I06grn1Hz3X",
  "결석 보강": "KA01TP2608211955248424PEIwhN3HI2",
  "주말 보강": "KA01TP260821195525856zucWqdkD7CO",
  "시험 보충": "KA01TP260821195527762DzF0Df9Xwpw",
  "주말 보충": "KA01TP260821195528682aJrtwqXpEef"
};
function solapiAuth(){
  const KEY = process.env.SOLAPI_API_KEY, SECRET = process.env.SOLAPI_API_SECRET;
  const date = new Date().toISOString();
  const salt = crypto.randomBytes(32).toString("hex");
  const sig = crypto.createHmac("sha256", SECRET).update(date + salt).digest("hex");
  return `HMAC-SHA256 apiKey=${KEY}, date=${date}, salt=${salt}, signature=${sig}`;
}
async function sendMsg(msg){
  const r = await fetch("https://api.solapi.com/messages/v4/send", {
    method: "POST", headers: { Authorization: solapiAuth(), "Content-Type": "application/json" }, body: JSON.stringify({ message: msg }) });
  return { ok: r.ok, body: await r.text() };
}
async function solapi(to, name, timeStr, smsText, templateId){
  const FROM = process.env.SOLAPI_SENDER;
  const base = { to: normPhone(to), from: normPhone(FROM), text: smsText };
  // 1차: 알림톡(템플릿 승인되면 이걸로 발송)
  const kakao = await sendMsg({ ...base, kakaoOptions: { pfId: KAKAO_PFID, templateId,
    variables: { "#{학생명}": name, "#{시간}": timeStr } } });
  if (kakao.ok) return { ok: true, via: "alimtalk", body: kakao.body };
  // 2차: 알림톡 실패(미승인 등) → 문자로 대체
  const sms = await sendMsg(base);
  return { ok: sms.ok, via: "sms", body: sms.body };
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
  const q = `makeup?status=eq.scheduled&reminded=eq.false&makeup_at=gte.${startUTC.toISOString()}&makeup_at=lt.${endUTC.toISOString()}&select=id,student_name,parent_phone,makeup_at,msg_type`;

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
      const ap = hh < 12 ? "오전" : "오후";
      const h12 = hh % 12 === 0 ? 12 : hh % 12;
      const timeStr = `${ap} ${h12}시${mm ? " " + mm + "분" : ""}`;
      const label = TEMPLATES[row.msg_type] ? row.msg_type : "보강";
      const tid = TEMPLATES[label];
      const text = `[클라이 어학원] ${label} 안내\n\n안녕하세요. ${row.student_name} 학생의 ${label} 일정을 안내드립니다.\n\n▪ 일시: 내일 ${timeStr}\n\n잊지 마시고 참석 부탁드립니다.\n문의: 031-654-0571`;
      const s = await solapi(row.parent_phone, row.student_name, timeStr, text, tid);
      if (s.ok) {
        await sb(`makeup?id=eq.${row.id}`, { method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ reminded: true }) });
        sent++;
      } else failed.push({ id: row.id, err: s.body });
    }
    return res.status(200).json({ ok: true, due: rows.length, sent, skipped, failed });
  } catch (e) { return res.status(500).json({ error: String(e) }); }
}
