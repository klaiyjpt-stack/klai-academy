// 신규상담 AI 정리 — 상담내용을 받아 요약·추천반·수업준비 체크리스트·다음액션을 만든다.
// 인증: 원장/데스크(ADMINS) Supabase 세션 토큰. ANTHROPIC_API_KEY 는 서버 env 에만.
const SUPABASE_URL = "https://hxlzccwqxamtsjrrtcdq.supabase.co";
const ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4bHpjY3dxeGFtdHNqcnJ0Y2RxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYyODA2NzgsImV4cCI6MjEwMTg1NjY3OH0.V19Jbcb7fS1lW6SwsZrn-dCTkUPaNN1KmBbdslDxfr4";
const ADMINS = ["klai.yj.pt@gmail.com", "klai.yj.pt.1@gmail.com"];
const MODEL = "claude-sonnet-5";

async function caller(req){
  const token = (req.headers.authorization || "").replace(/^Bearer /, "");
  if(!token) return null;
  const r = await fetch(SUPABASE_URL+"/auth/v1/user", { headers:{ apikey:ANON, Authorization:"Bearer "+token } });
  if(!r.ok) return null;
  return r.json();
}

export default async function handler(req, res){
  if(req.method!=="POST") return res.status(405).json({error:"method"});
  const key = process.env.ANTHROPIC_API_KEY;
  if(!key) return res.status(503).json({error:"ANTHROPIC_API_KEY 미설정"});
  const u = await caller(req);
  if(!u || !ADMINS.includes(String(u.email||"").toLowerCase())) return res.status(403).json({error:"원장/데스크 전용"});

  const b = req.body || {};
  const info = [
    b.student_name && `학생: ${b.student_name}`,
    b.grade && `학년: ${b.grade}`,
    b.prev_academy && `이전 학원: ${b.prev_academy}`,
    b.level_history && `학습이력/수준: ${b.level_history}`,
    b.needs && `학부모 니즈/목표: ${b.needs}`,
    b.level_test && `레벨테스트: ${b.level_test}`,
  ].filter(Boolean).join("\n");
  const note = String(b.consult_note||"").slice(0, 60000);   // 1시간 상담 전사문(수만 자)도 통째로
  if(!note.trim()) return res.status(400).json({error:"상담내용이 비어있음"});

  const sys = "너는 영어학원(초·중·고 대상) 신규상담을 정리하는 한국어 도우미다. "
    + "상담 기록과 학생 정보를 바탕으로 아래 JSON만 출력한다(설명·마크다운 금지). "
    + '{"summary":"핵심요약 3~5줄(줄바꿈 포함)","recommend_class":"추천 반/과목(예: 알파+독해, 원어민 스피킹 등)","level_test":"레벨테스트로 확인할 것 또는 추정 레벨","checklist":["입회 시 수업준비 항목 5~8개(교재·반배정·초기설정·숙제앱계정 등)"],"next_action":"다음 액션 한 줄(예: 레벨테스트 예약, 등록서류 안내)"}';
  const user = `${info}\n\n[상담내용]\n${note}`;

  try{
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method:"POST",
      headers:{ "x-api-key":key, "anthropic-version":"2023-06-01", "content-type":"application/json" },
      body: JSON.stringify({ model:MODEL, max_tokens:2000, system:sys, messages:[{role:"user", content:user}] })
    });
    const j = await r.json();
    if(!r.ok) return res.status(502).json({error:"AI 호출 실패", detail:(j&&j.error&&j.error.message)||JSON.stringify(j).slice(0,200)});
    let text = (j.content && j.content[0] && j.content[0].text) || "";
    // JSON 추출(모델이 코드펜스로 감싸는 경우 대비)
    const m = text.match(/\{[\s\S]*\}/);
    let out; try{ out = JSON.parse(m ? m[0] : text); }catch{ out = { summary:text, recommend_class:"", level_test:"", checklist:[], next_action:"" }; }
    if(!Array.isArray(out.checklist)) out.checklist = out.checklist ? [String(out.checklist)] : [];
    return res.status(200).json({ ok:true, ...out });
  }catch(e){ return res.status(500).json({error:String(e.message||e)}); }
}
