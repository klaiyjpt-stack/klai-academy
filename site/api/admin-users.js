// 학생 계정 관리 (원장페이지 전용). service_role 은 이 서버 파일에만.
// 인증: 호출자 Supabase 세션 토큰(Authorization 헤더) 검증 → ADMINS 만 통과. (consult.js 동일 패턴)
// ponytail: seed/backfill 은 offset 25건씩 나눠 처리(서버리스 타임아웃 회피).
const URL  = "https://hxlzccwqxamtsjrrtcdq.supabase.co";
const ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4bHpjY3dxeGFtdHNqcnJ0Y2RxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYyODA2NzgsImV4cCI6MjEwMTg1NjY3OH0.V19Jbcb7fS1lW6SwsZrn-dCTkUPaNN1KmBbdslDxfr4";
const SVC  = process.env.SUPABASE_SERVICE_ROLE || "";
const ADMINS = ["klai.yj.pt@gmail.com", "klai.yj.pt.1@gmail.com"];
const BATCH = 25;

// 등록/백필 대상 108명 (비번·전화는 서버에만)
const ACCOUNTS = [
{
"name": "고태이",
"id": "taei4885",
"email": "taei4885@klai.kr",
"phone": "01058984885",
"pw": "klai4885",
"subj": "엘리아G/W·영어도서관·정독"
},
{
"name": "곽도윤",
"id": "steven0412",
"email": "steven0412@klai.kr",
"phone": "01087677444",
"pw": "klai7444",
"subj": "엘리아G/W·영어도서관·정독"
},
{
"name": "곽설아",
"id": "leah0412",
"email": "leah0412@klai.kr",
"phone": "01087677444",
"pw": "klai7444",
"subj": "단어&Extra·독해·문법·정독"
},
{
"name": "김나연",
"id": "sophia4003",
"email": "sophia4003@klai.kr",
"phone": "01056254003",
"pw": "klai4003",
"subj": "문법·정독"
},
{
"name": "김다솜",
"id": "sally0143",
"email": "sally0143@klai.kr",
"phone": "",
"pw": "klai0143",
"subj": ""
},
{
"name": "김동현",
"id": "mason1690",
"email": "mason1690@klai.kr",
"phone": "01040561690",
"pw": "klai1690",
"subj": "단어&Extra·독해·문법·알파"
},
{
"name": "김라율",
"id": "jane6141",
"email": "jane6141@klai.kr",
"phone": "01095596141",
"pw": "klai6141",
"subj": "독해·알파·영어도서관·정독"
},
{
"name": "김륜형",
"id": "ryun2778",
"email": "ryun2778@klai.kr",
"phone": "01091412778",
"pw": "klai2778",
"subj": "문법"
},
{
"name": "김민성",
"id": "ethan3633",
"email": "ethan3633@klai.kr",
"phone": "01032003633",
"pw": "klai3633",
"subj": "독해·엘리아G/W·영어도서관·정독"
},
{
"name": "김서우",
"id": "seowoo5431",
"email": "seowoo5431@klai.kr",
"phone": "01038485431",
"pw": "klai5431",
"subj": "엘리아G/W·영어도서관·정독"
},
{
"name": "김승유",
"id": "billy4574",
"email": "billy4574@klai.kr",
"phone": "01050644574",
"pw": "klai4574",
"subj": "단어&Extra·문법·알파·정독"
},
{
"name": "김아인",
"id": "1657ain",
"email": "1657ain@klai.kr",
"phone": "01033131657",
"pw": "klai1657",
"subj": "엘리아G/W·영어도서관·정독"
},
{
"name": "김예린",
"id": "elin1136",
"email": "elin1136@klai.kr",
"phone": "01086311136",
"pw": "klai1136",
"subj": "독해·엘리아G/W·정독"
},
{
"name": "김유솔",
"id": "selena8479",
"email": "selena8479@klai.kr",
"phone": "01047888479",
"pw": "klai8479",
"subj": "독해·알파"
},
{
"name": "김윤서",
"id": "ivy3760",
"email": "ivy3760@klai.kr",
"phone": "01023183760",
"pw": "klai3760",
"subj": "단어&Extra·독해·문법·정독"
},
{
"name": "김윤슬",
"id": "yunseul9328",
"email": "yunseul9328@klai.kr",
"phone": "01023209328",
"pw": "klai9328",
"subj": "문법"
},
{
"name": "김윤우",
"id": "dbsdn1260",
"email": "dbsdn1260@klai.kr",
"phone": "01086381260",
"pw": "klai1260",
"subj": "문법·알파"
},
{
"name": "김윤중",
"id": "yunjung3760",
"email": "yunjung3760@klai.kr",
"phone": "01023183760",
"pw": "klai3760",
"subj": "문법"
},
{
"name": "김재원",
"id": "leo4220",
"email": "leo4220@klai.kr",
"phone": "01052794220",
"pw": "klai4220",
"subj": "엘리아G/W·영어도서관·정독"
},
{
"name": "김지안",
"id": "jian9328",
"email": "jian9328@klai.kr",
"phone": "01023209328",
"pw": "klai9328",
"subj": "문법"
},
{
"name": "김태은",
"id": "elena5695",
"email": "elena5695@klai.kr",
"phone": "01022175695",
"pw": "klai5695",
"subj": "독해·알파·영어도서관·정독"
},
{
"name": "김하엘",
"id": "hl6378",
"email": "hl6378@klai.kr",
"phone": "01057367791",
"pw": "klai7791",
"subj": "문법"
},
{
"name": "김하율",
"id": "jessi6141",
"email": "jessi6141@klai.kr",
"phone": "01095596141",
"pw": "klai6141",
"subj": "문법"
},
{
"name": "나이림",
"id": "ellie0804",
"email": "ellie0804@klai.kr",
"phone": "",
"pw": "klai0804",
"subj": ""
},
{
"name": "남소은",
"id": "soeun6798",
"email": "soeun6798@klai.kr",
"phone": "01025446798",
"pw": "klai6798",
"subj": "문법"
},
{
"name": "노범준",
"id": "rickey7794",
"email": "rickey7794@klai.kr",
"phone": "01035887794",
"pw": "klai7794",
"subj": "알파·정독"
},
{
"name": "문서준",
"id": "seojun4571",
"email": "seojun4571@klai.kr",
"phone": "01045718315",
"pw": "klai8315",
"subj": "문법·알파"
},
{
"name": "박도준",
"id": "jun2503",
"email": "jun2503@klai.kr",
"phone": "01036862503",
"pw": "klai2503",
"subj": "문법·알파·정독"
},
{
"name": "박서윤",
"id": "rosa1431",
"email": "rosa1431@klai.kr",
"phone": "01027801431",
"pw": "klai1431",
"subj": "영어도서관·정독"
},
{
"name": "박성하",
"id": "kenneth3440",
"email": "kenneth3440@klai.kr",
"phone": "01099883440",
"pw": "klai3440",
"subj": "엘리아G/W·영어도서관·정독"
},
{
"name": "박소율",
"id": "joy9087",
"email": "joy9087@klai.kr",
"phone": "01071009087",
"pw": "klai9087",
"subj": "독해·알파"
},
{
"name": "박시윤",
"id": "lucas9257",
"email": "lucas9257@klai.kr",
"phone": "01063089257",
"pw": "klai9257",
"subj": "독해·엘리아G/W·정독"
},
{
"name": "박정음",
"id": "daisy4270",
"email": "daisy4270@klai.kr",
"phone": "01054524270",
"pw": "klai4270",
"subj": "단어&Extra·독해·문법·정독"
},
{
"name": "박채연",
"id": "celina0091",
"email": "celina0091@klai.kr",
"phone": "01029470091",
"pw": "klai0091",
"subj": "알파·영어도서관·정독"
},
{
"name": "박하율",
"id": "hayul2982",
"email": "hayul2982@klai.kr",
"phone": "01046612982",
"pw": "klai2982",
"subj": "문법"
},
{
"name": "반시후",
"id": "ben0618",
"email": "ben0618@klai.kr",
"phone": "01030570618",
"pw": "klai0618",
"subj": "독해·엘리아G/W·영어도서관·정독"
},
{
"name": "방서현",
"id": "ellie9572",
"email": "ellie9572@klai.kr",
"phone": "01049299572",
"pw": "klai9572",
"subj": "독해·알파·영어도서관·정독"
},
{
"name": "서승우",
"id": "ethan5978",
"email": "ethan5978@klai.kr",
"phone": "01082385978",
"pw": "klai5978",
"subj": "문법·정독"
},
{
"name": "서예인",
"id": "amber6691",
"email": "amber6691@klai.kr",
"phone": "01035026691",
"pw": "klai6691",
"subj": "엘리아G/W·영어도서관·정독"
},
{
"name": "서지율",
"id": "jiyul7859",
"email": "jiyul7859@klai.kr",
"phone": "01079137859",
"pw": "klai7859",
"subj": "독해·알파·정독"
},
{
"name": "송주환",
"id": "henry3309",
"email": "henry3309@klai.kr",
"phone": "01044093309",
"pw": "klai3309",
"subj": "문법·알파·정독"
},
{
"name": "송지윤",
"id": "olivia5818",
"email": "olivia5818@klai.kr",
"phone": "01072025818",
"pw": "klai5818",
"subj": "문법·정독"
},
{
"name": "송채윤C",
"id": "audrey4404",
"email": "audrey4404@klai.kr",
"phone": "01072025818",
"pw": "klai5818",
"subj": "독해·알파"
},
{
"name": "송태환",
"id": "andy3309",
"email": "andy3309@klai.kr",
"phone": "01044093309",
"pw": "klai3309",
"subj": "알파·영어도서관·정독"
},
{
"name": "신승현",
"id": "evan6812",
"email": "evan6812@klai.kr",
"phone": "01041806812",
"pw": "klai6812",
"subj": "독해·알파·영어도서관·정독"
},
{
"name": "심근호",
"id": "greg3862",
"email": "greg3862@klai.kr",
"phone": "01066443862",
"pw": "klai3862",
"subj": "독해·알파·영어도서관·정독"
},
{
"name": "심수연",
"id": "jenny3862",
"email": "jenny3862@klai.kr",
"phone": "01066443862",
"pw": "klai3862",
"subj": "문법"
},
{
"name": "연진서",
"id": "jennie4176",
"email": "jennie4176@klai.kr",
"phone": "01091384176",
"pw": "klai4176",
"subj": "독해·알파·정독"
},
{
"name": "오예준",
"id": "jude0911",
"email": "jude0911@klai.kr",
"phone": "01033300911",
"pw": "klai0911",
"subj": "독해·알파·정독"
},
{
"name": "우소율",
"id": "sophia4520",
"email": "sophia4520@klai.kr",
"phone": "01094114520",
"pw": "klai4520",
"subj": "독해·알파·영어도서관·정독"
},
{
"name": "우하율",
"id": "andy4520",
"email": "andy4520@klai.kr",
"phone": "01094114520",
"pw": "klai4520",
"subj": "엘리아G/W·영어도서관·정독"
},
{
"name": "유길태",
"id": "john8607",
"email": "john8607@klai.kr",
"phone": "01071778607",
"pw": "klai8607",
"subj": "독해·문법·정독"
},
{
"name": "유서윤",
"id": "seoyoon9695",
"email": "seoyoon9695@klai.kr",
"phone": "01094329695",
"pw": "klai9695",
"subj": "문법·알파"
},
{
"name": "유정현",
"id": "alex8607",
"email": "alex8607@klai.kr",
"phone": "01071778607",
"pw": "klai8607",
"subj": "독해·알파·영어도서관·정독"
},
{
"name": "윤채원",
"id": "yuncw4359",
"email": "yuncw4359@klai.kr",
"phone": "01055034359",
"pw": "klai4359",
"subj": "독해·알파·엘리아G/W·정독"
},
{
"name": "이가은",
"id": "gaeun6457",
"email": "gaeun6457@klai.kr",
"phone": "01093476457",
"pw": "klai6457",
"subj": "문법"
},
{
"name": "이규은",
"id": "ellie4004",
"email": "ellie4004@klai.kr",
"phone": "01044604004",
"pw": "klai4004",
"subj": "단어&Extra·문법·알파·정독"
},
{
"name": "이기원",
"id": "giwon0814",
"email": "giwon0814@klai.kr",
"phone": "01063800814",
"pw": "klai0814",
"subj": "문법·정독"
},
{
"name": "이로운",
"id": "evan1891",
"email": "evan1891@klai.kr",
"phone": "01033061891",
"pw": "klai1891",
"subj": "독해·알파·정독"
},
{
"name": "이상준",
"id": "delbert",
"email": "delbert@klai.kr",
"phone": "01039748923",
"pw": "klai8923",
"subj": "영어도서관·정독"
},
{
"name": "이서안",
"id": "luna7204",
"email": "luna7204@klai.kr",
"phone": "01026417204",
"pw": "klai7204",
"subj": "독해·엘리아G/W·정독"
},
{
"name": "이세아",
"id": "8294sarah",
"email": "8294sarah@klai.kr",
"phone": "01046558294",
"pw": "klai8294",
"subj": "엘리아G/W·영어도서관·정독"
},
{
"name": "이수호",
"id": "owen7493",
"email": "owen7493@klai.kr",
"phone": "01047397493",
"pw": "klai7493",
"subj": "엘리아G/W·영어도서관·정독"
},
{
"name": "이연서",
"id": "leanna4217",
"email": "leanna4217@klai.kr",
"phone": "01048564217",
"pw": "klai4217",
"subj": "엘리아G/W·영어도서관·정독"
},
{
"name": "이준규",
"id": "harry4004",
"email": "harry4004@klai.kr",
"phone": "01044604004",
"pw": "klai4004",
"subj": "엘리아G/W·영어도서관·정독"
},
{
"name": "이준석",
"id": "june6155",
"email": "june6155@klai.kr",
"phone": "01034696155",
"pw": "klai6155",
"subj": "단어&Extra·독해·문법·정독"
},
{
"name": "이진명",
"id": "lucas7363",
"email": "lucas7363@klai.kr",
"phone": "01087017363",
"pw": "klai7363",
"subj": ""
},
{
"name": "이채연",
"id": "ella6155",
"email": "ella6155@klai.kr",
"phone": "01034696155",
"pw": "klai6155",
"subj": "알파·영어도서관·정독"
},
{
"name": "이하준",
"id": "hajun7204",
"email": "hajun7204@klai.kr",
"phone": "01026417204",
"pw": "klai7204",
"subj": "단어&Extra·알파"
},
{
"name": "이해인",
"id": "stella8514",
"email": "stella8514@klai.kr",
"phone": "01025008514",
"pw": "klai8514",
"subj": "알파·엘리아G/W·영어도서관·정독"
},
{
"name": "임재윤",
"id": "jake8927",
"email": "jake8927@klai.kr",
"phone": "01053558927",
"pw": "klai8927",
"subj": "엘리아G/W·영어도서관·정독"
},
{
"name": "임채아",
"id": "liz8017",
"email": "liz8017@klai.kr",
"phone": "01050158017",
"pw": "klai8017",
"subj": "문법·알파·정독"
},
{
"name": "임채우",
"id": "hero8017",
"email": "hero8017@klai.kr",
"phone": "01050158017",
"pw": "klai8017",
"subj": "문법·정독"
},
{
"name": "장범준",
"id": "jayden3518",
"email": "jayden3518@klai.kr",
"phone": "01091043518",
"pw": "klai3518",
"subj": "단어&Extra·문법·알파·정독"
},
{
"name": "장시완",
"id": "5322david",
"email": "5322david@klai.kr",
"phone": "01055425322",
"pw": "klai5322",
"subj": "엘리아G/W·영어도서관·정독"
},
{
"name": "전다은",
"id": "9949elly",
"email": "9949elly@klai.kr",
"phone": "01021679949",
"pw": "klai9949",
"subj": "영어도서관·정독"
},
{
"name": "전호영",
"id": "kevin9949",
"email": "kevin9949@klai.kr",
"phone": "01021679949",
"pw": "klai9949",
"subj": "독해·알파"
},
{
"name": "정예립",
"id": "jayden8478",
"email": "jayden8478@klai.kr",
"phone": "01073568478",
"pw": "klai8478",
"subj": "독해·문법·정독"
},
{
"name": "정예은",
"id": "julia4925",
"email": "julia4925@klai.kr",
"phone": "01089914925",
"pw": "klai4925",
"subj": "독해·알파·영어도서관·정독"
},
{
"name": "정율립",
"id": "yullip8478",
"email": "yullip8478@klai.kr",
"phone": "01073568478",
"pw": "klai8478",
"subj": "문법"
},
{
"name": "정은휼",
"id": "lucy8478",
"email": "lucy8478@klai.kr",
"phone": "01073568478",
"pw": "klai8478",
"subj": "엘리아G/W·영어도서관·정독"
},
{
"name": "정혜인",
"id": "bona1298",
"email": "bona1298@klai.kr",
"phone": "01071301298",
"pw": "klai1298",
"subj": "독해·알파·영어도서관·정독"
},
{
"name": "조민서",
"id": "sunny2337",
"email": "sunny2337@klai.kr",
"phone": "01027272337",
"pw": "klai2337",
"subj": "독해·알파·엘리아G/W·정독"
},
{
"name": "조민성",
"id": "daniel5874",
"email": "daniel5874@klai.kr",
"phone": "01089865874",
"pw": "klai5874",
"subj": "독해·알파·엘리아G/W·정독"
},
{
"name": "조서희",
"id": "seohee7030",
"email": "seohee7030@klai.kr",
"phone": "01040037030",
"pw": "klai7030",
"subj": "문법"
},
{
"name": "조성현",
"id": "joseph5524",
"email": "joseph5524@klai.kr",
"phone": "01062815524",
"pw": "klai5524",
"subj": "문법·정독"
},
{
"name": "조은수",
"id": "dmstn9705",
"email": "dmstn9705@klai.kr",
"phone": "01092409705",
"pw": "klai9705",
"subj": "독해·문법·알파"
},
{
"name": "지우림",
"id": "william1206",
"email": "william1206@klai.kr",
"phone": "01020511206",
"pw": "klai1206",
"subj": "영어도서관·정독"
},
{
"name": "지이룸",
"id": "aiden1206",
"email": "aiden1206@klai.kr",
"phone": "01020511206",
"pw": "klai1206",
"subj": "문법·정독"
},
{
"name": "지효준",
"id": "mateo9987",
"email": "mateo9987@klai.kr",
"phone": "01030019987",
"pw": "klai9987",
"subj": "문법·정독"
},
{
"name": "차서연",
"id": "isabel1220",
"email": "isabel1220@klai.kr",
"phone": "01071401220",
"pw": "klai1220",
"subj": "독해·알파·정독"
},
{
"name": "차서은",
"id": "amy1220",
"email": "amy1220@klai.kr",
"phone": "01071401220",
"pw": "klai1220",
"subj": "독해·알파·정독"
},
{
"name": "채지훈",
"id": "jihoon4290",
"email": "jihoon4290@klai.kr",
"phone": "01087404290",
"pw": "klai4290",
"subj": "문법"
},
{
"name": "최다솜",
"id": "cara6753",
"email": "cara6753@klai.kr",
"phone": "01092616753",
"pw": "klai6753",
"subj": "독해·엘리아G/W·영어도서관·정독"
},
{
"name": "최윤하",
"id": "ella8375",
"email": "ella8375@klai.kr",
"phone": "01025418375",
"pw": "klai8375",
"subj": ""
},
{
"name": "최종빈",
"id": "justin40501",
"email": "justin40501@klai.kr",
"phone": "01047156023",
"pw": "klai6023",
"subj": "문법"
},
{
"name": "최준수",
"id": "junsoo7765",
"email": "junsoo7765@klai.kr",
"phone": "01062477765",
"pw": "klai7765",
"subj": "엘리아G/W·영어도서관·정독"
},
{
"name": "최준호",
"id": "junho7765",
"email": "junho7765@klai.kr",
"phone": "01062477765",
"pw": "klai7765",
"subj": "독해·문법·정독"
},
{
"name": "최지운",
"id": "aiden44040",
"email": "aiden44040@klai.kr",
"phone": "01098204404",
"pw": "klai4404",
"subj": "독해·문법·알파·정독"
},
{
"name": "최지유",
"id": "cindy4405",
"email": "cindy4405@klai.kr",
"phone": "01098204404",
"pw": "klai4404",
"subj": "문법·정독"
},
{
"name": "최효원",
"id": "jenny8375",
"email": "jenny8375@klai.kr",
"phone": "01025418375",
"pw": "klai8375",
"subj": "문법·정독"
},
{
"name": "탁규민",
"id": "jason6548",
"email": "jason6548@klai.kr",
"phone": "01048566548",
"pw": "klai6548",
"subj": "엘리아G/W·영어도서관·정독"
},
{
"name": "한정민",
"id": "daniel0426",
"email": "daniel0426@klai.kr",
"phone": "",
"pw": "klai0426",
"subj": ""
},
{
"name": "허지원",
"id": "lily0601",
"email": "lily0601@klai.kr",
"phone": "01037320601",
"pw": "klai0601",
"subj": "엘리아G/W·영어도서관·정독"
},
{
"name": "홍서우",
"id": "lucy2348",
"email": "lucy2348@klai.kr",
"phone": "01028862348",
"pw": "klai2348",
"subj": "엘리아G/W·영어도서관·정독"
},
{
"name": "황수정",
"id": "crystal2546",
"email": "crystal2546@klai.kr",
"phone": "01033672546",
"pw": "klai2546",
"subj": "문법·정독"
},
{
"name": "황승준",
"id": "david2013",
"email": "david2013@klai.kr",
"phone": "01082512013",
"pw": "klai2013",
"subj": "문법·정독"
},
{
"name": "황지우",
"id": "1807roy",
"email": "1807roy@klai.kr",
"phone": "01040461807",
"pw": "klai1807",
"subj": "알파·엘리아G/W·영어도서관·정독"
}
];

const H = { apikey: SVC, Authorization: "Bearer "+SVC, "Content-Type":"application/json" };

async function caller(req){
  const token = (req.headers.authorization || "").replace(/^Bearer /, "");
  if(!token) return null;
  const r = await fetch(URL+"/auth/v1/user", { headers:{ apikey:ANON, Authorization:"Bearer "+token } });
  if(!r.ok) return null;
  return r.json();
}
async function listAll(){
  let page=1, out=[];
  while(true){
    const r = await fetch(URL+"/auth/v1/admin/users?per_page=1000&page="+page, { headers:H });
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
  const u = await caller(req);
  if(!u || !ADMINS.includes(String(u.email||"").toLowerCase())) return res.status(403).json({ok:false,error:"원장 전용"});
  const b = req.body || {};
  try{
    if(b.action==="list"){
      const rows = (await listAll()).map(x=>({ id:x.id, email:x.email, name:(x.user_metadata&&x.user_metadata.name)||"", subj:(x.user_metadata&&x.user_metadata.subj)||"", phone:(x.user_metadata&&x.user_metadata.phone)||"" }))
        .sort((a,c)=>(a.name||"").localeCompare(c.name||"","ko"));
      return res.status(200).json({ok:true, users:rows, total:rows.length});
    }
    if(b.action==="seed"){
      const off = b.offset|0;
      const existing = new Set((await listAll()).map(x=>(x.email||"").toLowerCase()));
      let created=0, skipped=0, errs=[];
      await Promise.all(ACCOUNTS.slice(off, off+BATCH).map(async a=>{
        if(existing.has(a.email)){ skipped++; return; }
        const r = await fetch(URL+"/auth/v1/admin/users", { method:"POST", headers:H,
          body: JSON.stringify({ email:a.email, password:a.pw, email_confirm:true, user_metadata:{ name:a.name, subj:a.subj, phone:a.phone||"", login_id:a.id, role:"student" } }) });
        if(r.ok) created++; else { skipped++; errs.push(a.email+":"+r.status); }
      }));
      const next = off+BATCH;
      return res.status(200).json({ok:true, processed:Math.min(next,ACCOUNTS.length), total:ACCOUNTS.length, created, skipped, errs, done: next>=ACCOUNTS.length, next: next>=ACCOUNTS.length?null:next });
    }
    if(b.action==="backfill"){   // 기존 계정 metadata.phone 채우기(이름 이메일 매칭)
      const off = b.offset|0;
      const byEmail = {}; (await listAll()).forEach(x=>{ byEmail[(x.email||"").toLowerCase()]=x; });
      let updated=0, skipped=0, errs=[];
      await Promise.all(ACCOUNTS.slice(off, off+BATCH).map(async a=>{
        const x = byEmail[a.email];
        if(!x || !a.phone){ skipped++; return; }
        const meta = Object.assign({}, x.user_metadata||{}, { phone:a.phone });
        const r = await fetch(URL+"/auth/v1/admin/users/"+x.id, { method:"PUT", headers:H, body: JSON.stringify({ user_metadata:meta }) });
        if(r.ok) updated++; else { skipped++; errs.push(a.email+":"+r.status); }
      }));
      const next = off+BATCH;
      return res.status(200).json({ok:true, processed:Math.min(next,ACCOUNTS.length), total:ACCOUNTS.length, updated, skipped, errs, done: next>=ACCOUNTS.length, next: next>=ACCOUNTS.length?null:next });
    }
    if(b.action==="resetall"){   // 학생 전원 비번 = 아이디(이메일 로컬파트)로 통일
      const off = b.offset|0;
      const students = (await listAll())
        .filter(x=>(x.email||"").toLowerCase().endsWith("@klai.kr") && !ADMINS.includes((x.email||"").toLowerCase()));
      let updated=0, skipped=0, errs=[];
      await Promise.all(students.slice(off, off+BATCH).map(async x=>{
        const pw = (x.email||"").split("@")[0];   // = 로그인 아이디
        if(pw.length<6){ skipped++; errs.push(x.email+":short"); return; }
        const r = await fetch(URL+"/auth/v1/admin/users/"+x.id, { method:"PUT", headers:H, body: JSON.stringify({ password:pw }) });
        if(r.ok) updated++; else { skipped++; errs.push((x.email||"")+":"+r.status); }
      }));
      const next = off+BATCH;
      return res.status(200).json({ok:true, processed:Math.min(next,students.length), total:students.length, updated, skipped, errs, done: next>=students.length, next: next>=students.length?null:next });
    }
    if(b.action==="update"){   // 한 행 저장: 이메일(아이디)·비번·이름·연락처
      const cur = await fetch(URL+"/auth/v1/admin/users/"+b.id, { headers:H }).then(r=>r.json()).catch(()=>({}));
      const meta = Object.assign({}, cur.user_metadata||{});
      if(b.name!==undefined)  meta.name  = b.name;
      if(b.phone!==undefined) meta.phone = b.phone;
      const body = { user_metadata: meta };
      if(b.email){ body.email = String(b.email).toLowerCase(); body.email_confirm = true; meta.login_id = body.email.split("@")[0]; }
      if(b.password) body.password = b.password;
      const r = await fetch(URL+"/auth/v1/admin/users/"+b.id, { method:"PUT", headers:H, body: JSON.stringify(body) });
      const j = await r.json().catch(()=>({}));
      return res.status(r.ok?200:400).json({ok:r.ok, error:r.ok?null:(j.msg||j.error_description||j.error||("HTTP "+r.status))});
    }
    if(b.action==="create"){
      const r = await fetch(URL+"/auth/v1/admin/users", { method:"POST", headers:H,
        body: JSON.stringify({ email:String(b.email).toLowerCase(), password:b.password||"klai0000", email_confirm:true, user_metadata:{ name:b.name||"", phone:b.phone||"", role:"student" } }) });
      const j = await r.json();
      return res.status(r.ok?200:400).json({ok:r.ok, error:r.ok?null:(j.msg||j.error_description||"실패")});
    }
    if(b.action==="resetpw"){
      const r = await fetch(URL+"/auth/v1/admin/users/"+b.id, { method:"PUT", headers:H, body: JSON.stringify({ password:b.password }) });
      const j = await r.json().catch(()=>({}));
      return res.status(r.ok?200:400).json({ok:r.ok, error:r.ok?null:(j.msg||j.error_description||j.error||("HTTP "+r.status))});
    }
    if(b.action==="rename"){
      const r = await fetch(URL+"/auth/v1/admin/users/"+b.id, { method:"PUT", headers:H, body: JSON.stringify({ email:String(b.email).toLowerCase(), email_confirm:true }) });
      const j = await r.json();
      return res.status(r.ok?200:400).json({ok:r.ok, error:r.ok?null:(j.msg||"실패")});
    }
    if(b.action==="delete"){
      const r = await fetch(URL+"/auth/v1/admin/users/"+b.id, { method:"DELETE", headers:H });
      return res.status(r.ok?200:400).json({ok:r.ok});
    }
    return res.status(400).json({ok:false,error:"unknown action"});
  }catch(e){ return res.status(500).json({ok:false,error:String(e.message||e)}); }
}
