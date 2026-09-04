// 학생 계정 관리 (원장페이지 전용). service_role 은 서버(이 파일)에만.
// 인증: 호출자의 Supabase 세션 토큰을 검증 → 허용 이메일(원장/관리)만 통과.
// ponytail: 시드는 offset 페이지로 나눠 처리(서버리스 타임아웃 회피).
const URL  = process.env.SUPABASE_URL  || "https://hxlzccwqxamtsjrrtcdq.supabase.co";
const ANON = process.env.SUPABASE_ANON || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4bHpjY3dxeGFtdHNqcnJ0Y2RxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYyODA2NzgsImV4cCI6MjEwMTg1NjY3OH0.V19Jbcb7fS1lW6SwsZrn-dCTkUPaNN1KmBbdslDxfr4";
const SVC  = process.env.SUPABASE_SERVICE_ROLE || "";
const ALLOWED = (process.env.ADMIN_EMAILS || "klai.yj.pt@gmail.com").split(",").map(s=>s.trim().toLowerCase());
const BATCH = 25;

// 등록 대상 108명 (비번은 서버에만 존재)
const ACCOUNTS = [
{
"name": "고태이",
"id": "taei4885",
"email": "taei4885@klai.kr",
"pw": "klai4885",
"subj": "엘리아G/W·영어도서관·정독"
},
{
"name": "곽도윤",
"id": "steven0412",
"email": "steven0412@klai.kr",
"pw": "klai7444",
"subj": "엘리아G/W·영어도서관·정독"
},
{
"name": "곽설아",
"id": "leah0412",
"email": "leah0412@klai.kr",
"pw": "klai7444",
"subj": "단어&Extra·독해·문법·정독"
},
{
"name": "김나연",
"id": "sophia4003",
"email": "sophia4003@klai.kr",
"pw": "klai4003",
"subj": "문법·정독"
},
{
"name": "김다솜",
"id": "sally0143",
"email": "sally0143@klai.kr",
"pw": "klai0143",
"subj": ""
},
{
"name": "김동현",
"id": "mason1690",
"email": "mason1690@klai.kr",
"pw": "klai1690",
"subj": "단어&Extra·독해·문법·알파"
},
{
"name": "김라율",
"id": "jane6141",
"email": "jane6141@klai.kr",
"pw": "klai6141",
"subj": "독해·알파·영어도서관·정독"
},
{
"name": "김륜형",
"id": "ryun2778",
"email": "ryun2778@klai.kr",
"pw": "klai2778",
"subj": "문법"
},
{
"name": "김민성",
"id": "ethan3633",
"email": "ethan3633@klai.kr",
"pw": "klai3633",
"subj": "독해·엘리아G/W·영어도서관·정독"
},
{
"name": "김서우",
"id": "seowoo5431",
"email": "seowoo5431@klai.kr",
"pw": "klai5431",
"subj": "엘리아G/W·영어도서관·정독"
},
{
"name": "김승유",
"id": "billy4574",
"email": "billy4574@klai.kr",
"pw": "klai4574",
"subj": "단어&Extra·문법·알파·정독"
},
{
"name": "김아인",
"id": "1657ain",
"email": "1657ain@klai.kr",
"pw": "klai1657",
"subj": "엘리아G/W·영어도서관·정독"
},
{
"name": "김예린",
"id": "elin1136",
"email": "elin1136@klai.kr",
"pw": "klai1136",
"subj": "독해·엘리아G/W·정독"
},
{
"name": "김유솔",
"id": "selena8479",
"email": "selena8479@klai.kr",
"pw": "klai8479",
"subj": "독해·알파"
},
{
"name": "김윤서",
"id": "ivy3760",
"email": "ivy3760@klai.kr",
"pw": "klai3760",
"subj": "단어&Extra·독해·문법·정독"
},
{
"name": "김윤슬",
"id": "yunseul9328",
"email": "yunseul9328@klai.kr",
"pw": "klai9328",
"subj": "문법"
},
{
"name": "김윤우",
"id": "dbsdn1260",
"email": "dbsdn1260@klai.kr",
"pw": "klai1260",
"subj": "문법·알파"
},
{
"name": "김윤중",
"id": "yunjung3760",
"email": "yunjung3760@klai.kr",
"pw": "klai3760",
"subj": "문법"
},
{
"name": "김재원",
"id": "leo4220",
"email": "leo4220@klai.kr",
"pw": "klai4220",
"subj": "엘리아G/W·영어도서관·정독"
},
{
"name": "김지안",
"id": "jian9328",
"email": "jian9328@klai.kr",
"pw": "klai9328",
"subj": "문법"
},
{
"name": "김태은",
"id": "elena5695",
"email": "elena5695@klai.kr",
"pw": "klai5695",
"subj": "독해·알파·영어도서관·정독"
},
{
"name": "김하엘",
"id": "hl6378",
"email": "hl6378@klai.kr",
"pw": "klai7791",
"subj": "문법"
},
{
"name": "김하율",
"id": "jessi6141",
"email": "jessi6141@klai.kr",
"pw": "klai6141",
"subj": "문법"
},
{
"name": "나이림",
"id": "ellie0804",
"email": "ellie0804@klai.kr",
"pw": "klai0804",
"subj": ""
},
{
"name": "남소은",
"id": "soeun6798",
"email": "soeun6798@klai.kr",
"pw": "klai6798",
"subj": "문법"
},
{
"name": "노범준",
"id": "rickey7794",
"email": "rickey7794@klai.kr",
"pw": "klai7794",
"subj": "알파·정독"
},
{
"name": "문서준",
"id": "seojun4571",
"email": "seojun4571@klai.kr",
"pw": "klai8315",
"subj": "문법·알파"
},
{
"name": "박도준",
"id": "jun2503",
"email": "jun2503@klai.kr",
"pw": "klai2503",
"subj": "문법·알파·정독"
},
{
"name": "박서윤",
"id": "rosa1431",
"email": "rosa1431@klai.kr",
"pw": "klai1431",
"subj": "영어도서관·정독"
},
{
"name": "박성하",
"id": "kenneth3440",
"email": "kenneth3440@klai.kr",
"pw": "klai3440",
"subj": "엘리아G/W·영어도서관·정독"
},
{
"name": "박소율",
"id": "joy9087",
"email": "joy9087@klai.kr",
"pw": "klai9087",
"subj": "독해·알파"
},
{
"name": "박시윤",
"id": "lucas9257",
"email": "lucas9257@klai.kr",
"pw": "klai9257",
"subj": "독해·엘리아G/W·정독"
},
{
"name": "박정음",
"id": "daisy4270",
"email": "daisy4270@klai.kr",
"pw": "klai4270",
"subj": "단어&Extra·독해·문법·정독"
},
{
"name": "박채연",
"id": "celina0091",
"email": "celina0091@klai.kr",
"pw": "klai0091",
"subj": "알파·영어도서관·정독"
},
{
"name": "박하율",
"id": "hayul2982",
"email": "hayul2982@klai.kr",
"pw": "klai2982",
"subj": "문법"
},
{
"name": "반시후",
"id": "ben0618",
"email": "ben0618@klai.kr",
"pw": "klai0618",
"subj": "독해·엘리아G/W·영어도서관·정독"
},
{
"name": "방서현",
"id": "ellie9572",
"email": "ellie9572@klai.kr",
"pw": "klai9572",
"subj": "독해·알파·영어도서관·정독"
},
{
"name": "서승우",
"id": "ethan5978",
"email": "ethan5978@klai.kr",
"pw": "klai5978",
"subj": "문법·정독"
},
{
"name": "서예인",
"id": "amber6691",
"email": "amber6691@klai.kr",
"pw": "klai6691",
"subj": "엘리아G/W·영어도서관·정독"
},
{
"name": "서지율",
"id": "jiyul7859",
"email": "jiyul7859@klai.kr",
"pw": "klai7859",
"subj": "독해·알파·정독"
},
{
"name": "송주환",
"id": "henry3309",
"email": "henry3309@klai.kr",
"pw": "klai3309",
"subj": "문법·알파·정독"
},
{
"name": "송지윤",
"id": "olivia5818",
"email": "olivia5818@klai.kr",
"pw": "klai5818",
"subj": "문법·정독"
},
{
"name": "송채윤C",
"id": "audrey4404",
"email": "audrey4404@klai.kr",
"pw": "klai5818",
"subj": "독해·알파"
},
{
"name": "송태환",
"id": "andy3309",
"email": "andy3309@klai.kr",
"pw": "klai3309",
"subj": "알파·영어도서관·정독"
},
{
"name": "신승현",
"id": "evan6812",
"email": "evan6812@klai.kr",
"pw": "klai6812",
"subj": "독해·알파·영어도서관·정독"
},
{
"name": "심근호",
"id": "greg3862",
"email": "greg3862@klai.kr",
"pw": "klai3862",
"subj": "독해·알파·영어도서관·정독"
},
{
"name": "심수연",
"id": "jenny3862",
"email": "jenny3862@klai.kr",
"pw": "klai3862",
"subj": "문법"
},
{
"name": "연진서",
"id": "jennie4176",
"email": "jennie4176@klai.kr",
"pw": "klai4176",
"subj": "독해·알파·정독"
},
{
"name": "오예준",
"id": "jude0911",
"email": "jude0911@klai.kr",
"pw": "klai0911",
"subj": "독해·알파·정독"
},
{
"name": "우소율",
"id": "sophia4520",
"email": "sophia4520@klai.kr",
"pw": "klai4520",
"subj": "독해·알파·영어도서관·정독"
},
{
"name": "우하율",
"id": "andy4520",
"email": "andy4520@klai.kr",
"pw": "klai4520",
"subj": "엘리아G/W·영어도서관·정독"
},
{
"name": "유길태",
"id": "john8607",
"email": "john8607@klai.kr",
"pw": "klai8607",
"subj": "독해·문법·정독"
},
{
"name": "유서윤",
"id": "seoyoon9695",
"email": "seoyoon9695@klai.kr",
"pw": "klai9695",
"subj": "문법·알파"
},
{
"name": "유정현",
"id": "alex8607",
"email": "alex8607@klai.kr",
"pw": "klai8607",
"subj": "독해·알파·영어도서관·정독"
},
{
"name": "윤채원",
"id": "yuncw4359",
"email": "yuncw4359@klai.kr",
"pw": "klai4359",
"subj": "독해·알파·엘리아G/W·정독"
},
{
"name": "이가은",
"id": "gaeun6457",
"email": "gaeun6457@klai.kr",
"pw": "klai6457",
"subj": "문법"
},
{
"name": "이규은",
"id": "ellie4004",
"email": "ellie4004@klai.kr",
"pw": "klai4004",
"subj": "단어&Extra·문법·알파·정독"
},
{
"name": "이기원",
"id": "giwon0814",
"email": "giwon0814@klai.kr",
"pw": "klai0814",
"subj": "문법·정독"
},
{
"name": "이로운",
"id": "evan1891",
"email": "evan1891@klai.kr",
"pw": "klai1891",
"subj": "독해·알파·정독"
},
{
"name": "이상준",
"id": "delbert",
"email": "delbert@klai.kr",
"pw": "klai8923",
"subj": "영어도서관·정독"
},
{
"name": "이서안",
"id": "luna7204",
"email": "luna7204@klai.kr",
"pw": "klai7204",
"subj": "독해·엘리아G/W·정독"
},
{
"name": "이세아",
"id": "8294sarah",
"email": "8294sarah@klai.kr",
"pw": "klai8294",
"subj": "엘리아G/W·영어도서관·정독"
},
{
"name": "이수호",
"id": "owen7493",
"email": "owen7493@klai.kr",
"pw": "klai7493",
"subj": "엘리아G/W·영어도서관·정독"
},
{
"name": "이연서",
"id": "leanna4217",
"email": "leanna4217@klai.kr",
"pw": "klai4217",
"subj": "엘리아G/W·영어도서관·정독"
},
{
"name": "이준규",
"id": "harry4004",
"email": "harry4004@klai.kr",
"pw": "klai4004",
"subj": "엘리아G/W·영어도서관·정독"
},
{
"name": "이준석",
"id": "june6155",
"email": "june6155@klai.kr",
"pw": "klai6155",
"subj": "단어&Extra·독해·문법·정독"
},
{
"name": "이진명",
"id": "lucas7363",
"email": "lucas7363@klai.kr",
"pw": "klai7363",
"subj": ""
},
{
"name": "이채연",
"id": "ella6155",
"email": "ella6155@klai.kr",
"pw": "klai6155",
"subj": "알파·영어도서관·정독"
},
{
"name": "이하준",
"id": "hajun7204",
"email": "hajun7204@klai.kr",
"pw": "klai7204",
"subj": "단어&Extra·알파"
},
{
"name": "이해인",
"id": "stella8514",
"email": "stella8514@klai.kr",
"pw": "klai8514",
"subj": "알파·엘리아G/W·영어도서관·정독"
},
{
"name": "임재윤",
"id": "jake8927",
"email": "jake8927@klai.kr",
"pw": "klai8927",
"subj": "엘리아G/W·영어도서관·정독"
},
{
"name": "임채아",
"id": "liz8017",
"email": "liz8017@klai.kr",
"pw": "klai8017",
"subj": "문법·알파·정독"
},
{
"name": "임채우",
"id": "hero8017",
"email": "hero8017@klai.kr",
"pw": "klai8017",
"subj": "문법·정독"
},
{
"name": "장범준",
"id": "jayden3518",
"email": "jayden3518@klai.kr",
"pw": "klai3518",
"subj": "단어&Extra·문법·알파·정독"
},
{
"name": "장시완",
"id": "5322david",
"email": "5322david@klai.kr",
"pw": "klai5322",
"subj": "엘리아G/W·영어도서관·정독"
},
{
"name": "전다은",
"id": "9949elly",
"email": "9949elly@klai.kr",
"pw": "klai9949",
"subj": "영어도서관·정독"
},
{
"name": "전호영",
"id": "kevin9949",
"email": "kevin9949@klai.kr",
"pw": "klai9949",
"subj": "독해·알파"
},
{
"name": "정예립",
"id": "jayden8478",
"email": "jayden8478@klai.kr",
"pw": "klai8478",
"subj": "독해·문법·정독"
},
{
"name": "정예은",
"id": "julia4925",
"email": "julia4925@klai.kr",
"pw": "klai4925",
"subj": "독해·알파·영어도서관·정독"
},
{
"name": "정율립",
"id": "yullip8478",
"email": "yullip8478@klai.kr",
"pw": "klai8478",
"subj": "문법"
},
{
"name": "정은휼",
"id": "lucy8478",
"email": "lucy8478@klai.kr",
"pw": "klai8478",
"subj": "엘리아G/W·영어도서관·정독"
},
{
"name": "정혜인",
"id": "bona1298",
"email": "bona1298@klai.kr",
"pw": "klai1298",
"subj": "독해·알파·영어도서관·정독"
},
{
"name": "조민서",
"id": "sunny2337",
"email": "sunny2337@klai.kr",
"pw": "klai2337",
"subj": "독해·알파·엘리아G/W·정독"
},
{
"name": "조민성",
"id": "daniel5874",
"email": "daniel5874@klai.kr",
"pw": "klai5874",
"subj": "독해·알파·엘리아G/W·정독"
},
{
"name": "조서희",
"id": "seohee7030",
"email": "seohee7030@klai.kr",
"pw": "klai7030",
"subj": "문법"
},
{
"name": "조성현",
"id": "joseph5524",
"email": "joseph5524@klai.kr",
"pw": "klai5524",
"subj": "문법·정독"
},
{
"name": "조은수",
"id": "dmstn9705",
"email": "dmstn9705@klai.kr",
"pw": "klai9705",
"subj": "독해·문법·알파"
},
{
"name": "지우림",
"id": "william1206",
"email": "william1206@klai.kr",
"pw": "klai1206",
"subj": "영어도서관·정독"
},
{
"name": "지이룸",
"id": "aiden1206",
"email": "aiden1206@klai.kr",
"pw": "klai1206",
"subj": "문법·정독"
},
{
"name": "지효준",
"id": "mateo9987",
"email": "mateo9987@klai.kr",
"pw": "klai9987",
"subj": "문법·정독"
},
{
"name": "차서연",
"id": "isabel1220",
"email": "isabel1220@klai.kr",
"pw": "klai1220",
"subj": "독해·알파·정독"
},
{
"name": "차서은",
"id": "amy1220",
"email": "amy1220@klai.kr",
"pw": "klai1220",
"subj": "독해·알파·정독"
},
{
"name": "채지훈",
"id": "jihoon4290",
"email": "jihoon4290@klai.kr",
"pw": "klai4290",
"subj": "문법"
},
{
"name": "최다솜",
"id": "cara6753",
"email": "cara6753@klai.kr",
"pw": "klai6753",
"subj": "독해·엘리아G/W·영어도서관·정독"
},
{
"name": "최윤하",
"id": "ella8375",
"email": "ella8375@klai.kr",
"pw": "klai8375",
"subj": ""
},
{
"name": "최종빈",
"id": "justin40501",
"email": "justin40501@klai.kr",
"pw": "klai6023",
"subj": "문법"
},
{
"name": "최준수",
"id": "junsoo7765",
"email": "junsoo7765@klai.kr",
"pw": "klai7765",
"subj": "엘리아G/W·영어도서관·정독"
},
{
"name": "최준호",
"id": "junho7765",
"email": "junho7765@klai.kr",
"pw": "klai7765",
"subj": "독해·문법·정독"
},
{
"name": "최지운",
"id": "aiden44040",
"email": "aiden44040@klai.kr",
"pw": "klai4404",
"subj": "독해·문법·알파·정독"
},
{
"name": "최지유",
"id": "cindy4405",
"email": "cindy4405@klai.kr",
"pw": "klai4404",
"subj": "문법·정독"
},
{
"name": "최효원",
"id": "jenny8375",
"email": "jenny8375@klai.kr",
"pw": "klai8375",
"subj": "문법·정독"
},
{
"name": "탁규민",
"id": "jason6548",
"email": "jason6548@klai.kr",
"pw": "klai6548",
"subj": "엘리아G/W·영어도서관·정독"
},
{
"name": "한정민",
"id": "daniel0426",
"email": "daniel0426@klai.kr",
"pw": "klai0426",
"subj": ""
},
{
"name": "허지원",
"id": "lily0601",
"email": "lily0601@klai.kr",
"pw": "klai0601",
"subj": "엘리아G/W·영어도서관·정독"
},
{
"name": "홍서우",
"id": "lucy2348",
"email": "lucy2348@klai.kr",
"pw": "klai2348",
"subj": "엘리아G/W·영어도서관·정독"
},
{
"name": "황수정",
"id": "crystal2546",
"email": "crystal2546@klai.kr",
"pw": "klai2546",
"subj": "문법·정독"
},
{
"name": "황승준",
"id": "david2013",
"email": "david2013@klai.kr",
"pw": "klai2013",
"subj": "문법·정독"
},
{
"name": "황지우",
"id": "1807roy",
"email": "1807roy@klai.kr",
"pw": "klai1807",
"subj": "알파·엘리아G/W·영어도서관·정독"
}
];

const adminHeaders = { apikey: SVC, Authorization: "Bearer "+SVC, "Content-Type":"application/json" };

async function verify(token){
  if(!token) return null;
  const r = await fetch(URL+"/auth/v1/user", { headers:{ apikey:ANON, Authorization:"Bearer "+token } });
  if(!r.ok) return null;
  const u = await r.json();
  const email = (u && u.email || "").toLowerCase();
  return ALLOWED.includes(email) ? u : null;
}
async function listAll(){
  let page=1, out=[];
  while(true){
    const r = await fetch(URL+"/auth/v1/admin/users?per_page=1000&page="+page, { headers:adminHeaders });
    if(!r.ok) throw new Error("list "+r.status);
    const j = await r.json();
    const us = j.users||[];
    out = out.concat(us);
    if(us.length<1000) break;
    page++;
  }
  return out;
}

export default async function handler(req, res){
  if(req.method!=="POST") return res.status(405).json({ok:false});
  if(!SVC) return res.status(503).json({ok:false,error:"SUPABASE_SERVICE_ROLE 미설정"});
  const b = req.body || {};
  const admin = await verify(b.token);
  if(!admin) return res.status(401).json({ok:false,error:"권한 없음(원장 로그인 필요)"});

  try{
    if(b.action==="list"){
      const us = await listAll();
      const rows = us.map(u=>({ id:u.id, email:u.email, name:(u.user_metadata&&u.user_metadata.name)||"", subj:(u.user_metadata&&u.user_metadata.subj)||"" }))
        .sort((a,c)=>(a.name||"").localeCompare(c.name||"","ko"));
      return res.status(200).json({ok:true, users:rows, total:rows.length});
    }
    if(b.action==="seed"){
      const off = b.offset|0;
      const existing = new Set((await listAll()).map(u=>(u.email||"").toLowerCase()));
      const slice = ACCOUNTS.slice(off, off+BATCH);
      let created=0, skipped=0, errs=[];
      await Promise.all(slice.map(async a=>{
        if(existing.has(a.email)){ skipped++; return; }
        const r = await fetch(URL+"/auth/v1/admin/users", { method:"POST", headers:adminHeaders,
          body: JSON.stringify({ email:a.email, password:a.pw, email_confirm:true, user_metadata:{ name:a.name, subj:a.subj, login_id:a.id, role:"student" } }) });
        if(r.ok) created++; else { skipped++; errs.push(a.email+":"+r.status); }
      }));
      const next = off+BATCH;
      return res.status(200).json({ok:true, processed:Math.min(next,ACCOUNTS.length), total:ACCOUNTS.length, created, skipped, errs, done: next>=ACCOUNTS.length, next: next>=ACCOUNTS.length?null:next });
    }
    if(b.action==="create"){
      const r = await fetch(URL+"/auth/v1/admin/users", { method:"POST", headers:adminHeaders,
        body: JSON.stringify({ email:String(b.email).toLowerCase(), password:b.password||"klai0000", email_confirm:true, user_metadata:{ name:b.name||"", role:"student" } }) });
      const j = await r.json();
      return res.status(r.ok?200:400).json({ok:r.ok, user:j, error:r.ok?null:(j.msg||j.error_description||"실패")});
    }
    if(b.action==="resetpw"){
      const r = await fetch(URL+"/auth/v1/admin/users/"+b.id, { method:"PUT", headers:adminHeaders, body: JSON.stringify({ password:b.password }) });
      return res.status(r.ok?200:400).json({ok:r.ok});
    }
    if(b.action==="rename"){
      const r = await fetch(URL+"/auth/v1/admin/users/"+b.id, { method:"PUT", headers:adminHeaders, body: JSON.stringify({ email:String(b.email).toLowerCase(), email_confirm:true }) });
      const j = await r.json();
      return res.status(r.ok?200:400).json({ok:r.ok, error:r.ok?null:(j.msg||"실패")});
    }
    if(b.action==="delete"){
      const r = await fetch(URL+"/auth/v1/admin/users/"+b.id, { method:"DELETE", headers:adminHeaders });
      return res.status(r.ok?200:400).json({ok:r.ok});
    }
    return res.status(400).json({ok:false,error:"unknown action"});
  }catch(e){ return res.status(500).json({ok:false,error:String(e.message||e)}); }
}
