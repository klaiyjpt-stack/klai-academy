// 관리자(선생님) PIN 확인. Vercel 서버리스(자동 인식).
// PIN 을 HTML 소스에 두지 않으려고 만든 것 — 값은 환경변수 TEACHER_PIN 에만 있다.
// ponytail: 화면 전환은 여전히 브라우저가 하므로 devtools 로는 우회 가능하다.
// 막는 건 "소스 보면 PIN 이 보이는 것"까지. 진짜 잠금은 서버 렌더 + 세션(Supabase).

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false });

  const pin = String((req.body && req.body.pin) || "");
  const want = process.env.TEACHER_PIN || "";
  if (!want) return res.status(503).json({ ok: false, error: "TEACHER_PIN 미설정" });

  // 무차별 대입을 느리게 한다. PIN 이 짧아서 이게 유일한 방어다.
  await new Promise((r) => setTimeout(r, 400));

  if (pin.length !== want.length) return res.status(401).json({ ok: false });
  let diff = 0;
  for (let i = 0; i < want.length; i++) diff |= pin.charCodeAt(i) ^ want.charCodeAt(i);
  if (diff !== 0) return res.status(401).json({ ok: false });

  res.status(200).json({ ok: true });
}
