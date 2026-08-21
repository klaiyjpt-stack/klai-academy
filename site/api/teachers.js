// 강사 계정 관리 — 원장만. service_role 키는 Vercel 환경변수 SUPABASE_SERVICE_ROLE 에만 둠(브라우저 노출 금지).
// GET=목록 / POST{email,password}=생성 / DELETE?id=삭제.
const SUPABASE_URL = "https://hxlzccwqxamtsjrrtcdq.supabase.co";
const ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4bHpjY3dxeGFtdHNqcnJ0Y2RxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYyODA2NzgsImV4cCI6MjEwMTg1NjY3OH0.V19Jbcb7fS1lW6SwsZrn-dCTkUPaNN1KmBbdslDxfr4";
const ADMINS = ["klai.yj.pt@gmail.com", "klai.yj.pt.1@gmail.com"];   // 원장 이메일(삭제 불가·관리 권한)

async function caller(req) {
  const token = (req.headers.authorization || "").replace(/^Bearer /, "");
  if (!token) return null;
  const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: { apikey: ANON, Authorization: `Bearer ${token}` } });
  if (!r.ok) return null;
  return r.json();
}
const isAdmin = e => ADMINS.includes(String(e || "").toLowerCase());

export default async function handler(req, res) {
  const KEY = process.env.SUPABASE_SERVICE_ROLE;
  if (!KEY) return res.status(500).json({ error: "SUPABASE_SERVICE_ROLE 환경변수 미설정" });

  const u = await caller(req);
  if (!u || !isAdmin(u.email)) return res.status(403).json({ error: "원장 전용" });

  const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };
  try {
    if (req.method === "GET") {
      const r = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?per_page=200`, { headers: H });
      const d = await r.json();
      const users = (d.users || []).map(x => ({ id: x.id, email: x.email, created_at: x.created_at, admin: isAdmin(x.email) }))
        .sort((a, b) => (a.admin === b.admin ? String(a.email).localeCompare(b.email) : a.admin ? -1 : 1));
      return res.status(200).json({ users });
    }
    if (req.method === "POST") {
      const b = req.body || {};
      if (!b.email || !b.password) return res.status(400).json({ error: "이메일·비밀번호 필요" });
      if (String(b.password).length < 6) return res.status(400).json({ error: "비밀번호는 6자 이상" });
      const r = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
        method: "POST", headers: H, body: JSON.stringify({ email: b.email, password: b.password, email_confirm: true }) });
      const d = await r.json();
      if (!r.ok) return res.status(400).json({ error: d.msg || d.error_description || JSON.stringify(d) });
      return res.status(200).json({ ok: true, id: d.id, email: d.email });
    }
    if (req.method === "DELETE") {
      const id = (req.query && req.query.id) || (req.body && req.body.id);
      if (!id) return res.status(400).json({ error: "id 필요" });
      // 원장 계정은 삭제 금지 — 대상 이메일 조회 후 확인
      const lr = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${id}`, { headers: H });
      if (lr.ok) { const tu = await lr.json(); if (isAdmin(tu.email)) return res.status(403).json({ error: "원장 계정은 삭제할 수 없어요" }); }
      const r = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${id}`, { method: "DELETE", headers: H });
      if (!r.ok) return res.status(400).json({ error: await r.text() });
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ error: "method" });
  } catch (e) { return res.status(500).json({ error: String(e) }); }
}
