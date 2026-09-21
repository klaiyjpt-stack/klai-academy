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
async function sendMsg(msg, scheduledDate){
  const payload = { message: msg };
  if (scheduledDate) payload.scheduledDate = scheduledDate;   // 예약발송: 최상위 필드(KST)
  const r = await fetch("https://api.solapi.com/messages/v4/send", {
    method: "POST", headers: { Authorization: solapiAuth(), "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  return { ok: r.ok, body: await r.text() };
}
async function solapi(to, name, timeStr, smsText, templateId, scheduledDate){
  const FROM = process.env.SOLAPI_SENDER;
  const base = { to: normPhone(to), from: normPhone(FROM), text: smsText };
  // 1차: 알림톡. disableSms:false = 카톡 미가입·차단 등 개별 전달실패는 Solapi가 base.text로 자동 SMS 대체.
  const kakao = await sendMsg({ ...base, kakaoOptions: { pfId: KAKAO_PFID, templateId,
    variables: { "#{학생명}": name, "#{시간}": timeStr }, disableSms: false } }, scheduledDate);
  if (kakao.ok) return { ok: true, via: "alimtalk", body: kakao.body };
  // 2차: 요청 자체 실패(템플릿 미승인 등) → 문자로 대체
  const sms = await sendMsg(base, scheduledDate);
  return { ok: sms.ok, via: "sms", body: sms.body };
}

export default async function handler(req, res) {
  if (req.query.token !== TOKEN && !req.headers["x-vercel-cron"]) return res.status(403).json({ error: "forbidden" });
  // 진단: ?check=1 — 발송 안 하고 환경변수 + Solapi 최근 발송내역만 조회
  if (req.query.check) {
    const env = { key: !!process.env.SOLAPI_API_KEY, secret: !!process.env.SOLAPI_API_SECRET, sender: process.env.SOLAPI_SENDER || null, service_role: !!process.env.SUPABASE_SERVICE_ROLE };
    if (!env.key || !env.secret) return res.status(200).json({ env, note: "SOLAPI 키 미설정 → 리마인더 발송 불가" });
    // ?check=send&to=01012345678 → 그 번호로 보강 알림톡 1건 실발송(카톡 채널 작동 확인용). to 없으면 발신번호로.
    if (req.query.check === "send") {
      const to = req.query.to || env.sender;
      const s = await solapi(to, "테스트", "오후 5시", "[클라이 어학원] 보강 안내\n\n(카카오 채널 발행 테스트) 내일 오후 5시 보강 안내드립니다.\n문의: 031-654-0571", TEMPLATES["보강"]);
      return res.status(200).json({ env, test_to: normPhone(to), result: s });
    }
    try {
      const r = await fetch("https://api.solapi.com/messages/v4/list?limit=30", { headers: { Authorization: solapiAuth() } });
      const j = await r.json();
      const list = (j.messageList ? Object.values(j.messageList) : (j.data || [])).map(m => ({ to: m.to, type: m.type, status: m.status, statusCode: m.statusCode, reason: m.reason || m.statusMessage, date: m.dateReceived || m.dateCreated }));
      return res.status(200).json({ env, count: list.length, recent: list });
    } catch (e) { return res.status(502).json({ env, error: String(e.message || e) }); }
  }
  if (!process.env.SUPABASE_SERVICE_ROLE || !process.env.SOLAPI_API_KEY || !process.env.SOLAPI_API_SECRET || !process.env.SOLAPI_SENDER)
    return res.status(500).json({ error: "환경변수 미설정: SOLAPI_API_KEY / SOLAPI_API_SECRET / SOLAPI_SENDER 필요" });

  // 대상일: 기본 내일. ?day=today 면 오늘. 예약발송: ?at=ISO(KST) 지정 시 그 시각에 예약.
  const dayOffset = req.query.day === "today" ? 0 : 1;
  const scheduledDate = req.query.at || null;
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 3600e3);
  const startUTC = new Date(Date.UTC(kst.getUTCFullYear(), kst.getUTCMonth(), kst.getUTCDate() + dayOffset, 0, 0, 0) - 9 * 3600e3);
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
      const whenWord = dayOffset === 0 ? "오늘" : "내일";
      const text = `[클라이 어학원] ${label} 안내\n\n안녕하세요. ${row.student_name} 학생의 ${label} 일정을 안내드립니다.\n\n▪ 일시: ${whenWord} ${timeStr}\n\n잊지 마시고 참석 부탁드립니다.\n문의: 031-654-0571`;
      const s = await solapi(row.parent_phone, row.student_name, timeStr, text, tid, scheduledDate);
      if (s.ok) {
        await sb(`makeup?id=eq.${row.id}`, { method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ reminded: true }) });
        sent++;
      } else failed.push({ id: row.id, err: s.body });
    }
    return res.status(200).json({ ok: true, due: rows.length, sent, skipped, failed });
  } catch (e) { return res.status(500).json({ error: String(e) }); }
}
