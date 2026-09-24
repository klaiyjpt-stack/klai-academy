// 신규상담 녹음 전사 — 클라이언트가 Supabase 스토리지에 올린 오디오 URL을 받아 OpenAI Whisper로 전사.
// 인증: 원장/데스크(ADMINS) Supabase 세션. OPENAI_API_KEY 는 서버 env 에만.
// Vercel 함수 페이로드 한계(4.5MB) 회피 위해 오디오는 스토리지에 올리고 URL만 받는다.
const SUPABASE_URL = "https://hxlzccwqxamtsjrrtcdq.supabase.co";
const ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4bHpjY3dxeGFtdHNqcnJ0Y2RxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYyODA2NzgsImV4cCI6MjEwMTg1NjY3OH0.V19Jbcb7fS1lW6SwsZrn-dCTkUPaNN1KmBbdslDxfr4";
const ADMINS = ["klai.yj.pt@gmail.com", "klai.yj.pt.1@gmail.com"];

export const config = { maxDuration: 60 };

async function caller(req){
  const token = (req.headers.authorization || "").replace(/^Bearer /, "");
  if(!token) return null;
  const r = await fetch(SUPABASE_URL+"/auth/v1/user", { headers:{ apikey:ANON, Authorization:"Bearer "+token } });
  if(!r.ok) return null;
  return r.json();
}

export default async function handler(req, res){
  if(req.method!=="POST") return res.status(405).json({error:"method"});
  const key = process.env.OPENAI_API_KEY;
  if(!key) return res.status(503).json({error:"OPENAI_API_KEY 미설정"});
  const u = await caller(req);
  if(!u || !ADMINS.includes(String(u.email||"").toLowerCase())) return res.status(403).json({error:"원장/데스크 전용"});

  const url = String((req.body||{}).url||"");
  if(!/^https:\/\/hxlzccwqxamtsjrrtcdq\.supabase\.co\/storage\//.test(url)) return res.status(400).json({error:"오디오 URL 없음"});

  try{
    const a = await fetch(url);
    if(!a.ok) return res.status(400).json({error:"오디오 다운로드 실패"});
    const buf = Buffer.from(await a.arrayBuffer());
    if(buf.length > 25*1024*1024) return res.status(413).json({error:"오디오가 25MB를 넘어요. 더 짧게 녹음하세요."});

    const fd = new FormData();
    fd.append("file", new Blob([buf], { type:"audio/webm" }), "audio.webm");
    fd.append("model", "whisper-1");
    fd.append("language", "ko");
    const r = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method:"POST", headers:{ Authorization:"Bearer "+key }, body: fd
    });
    const j = await r.json();
    if(!r.ok) return res.status(502).json({error:"전사 실패", detail:(j&&j.error&&j.error.message)||""});
    return res.status(200).json({ ok:true, text: j.text||"" });
  }catch(e){ return res.status(500).json({error:String(e.message||e)}); }
}
