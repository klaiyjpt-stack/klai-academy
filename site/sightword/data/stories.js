// 16 daily-life leveled stories. Each level-N story uses ONLY words from levels 1..N
// (controlled vocabulary) and contains every sight word taught at level N.
// No common nouns exist before L12, so L1-11 lean on pronouns/"it"/"one" and read simple by design.
window.STORIES = [
  { level:1, title:"I can find it",
    sentences:[
      "I can find it.",
      "It is big and blue.",
      "It is little and funny.",
      "I jump in it.",
      "Come here for a big jump!",
      "Go down, go away, help!"
    ],
    ko:[
      "나는 그것을 찾을 수 있어.",
      "그것은 크고 파래.",
      "그것은 작고 우스워.",
      "나는 그 안으로 뛰어들어.",
      "큰 점프를 하러 이리 와!",
      "내려가, 저리 가, 도와줘!"
    ],
    quiz:{ q:"How big is it?", choices:["big","little","funny","blue"], answer:0 } },

  { level:2, title:"Look and play",
    sentences:[
      "Look, you and me play!",
      "We see the red one, not the yellow one.",
      "I see two up here, and three down.",
      "Where is my one? Run to me!",
      "You said, 'Make it!'"
    ],
    ko:[
      "봐, 너랑 나랑 놀자!",
      "우리는 빨간 걸 봐, 노란 건 아니야.",
      "나는 위에 두 개, 아래에 세 개를 봐.",
      "내 것은 어디 있지? 나한테 뛰어와!",
      "네가 말했어, '만들어!'"
    ],
    quiz:{ q:"Which one do we NOT see?", choices:["the yellow one","the red one","the blue one","my one"], answer:0 } },

  { level:3, title:"He came to play",
    sentences:[
      "I am good, and he is good.",
      "We all like to play, but he did not come.",
      "He came here and ate all four.",
      "Get the black one and the brown one.",
      "Are you at it? Can it be good to eat?",
      "Do you have it? Look into it."
    ],
    ko:[
      "나도 착하고, 그도 착해.",
      "우리 모두 놀고 싶어, 그런데 그는 안 왔어.",
      "그가 여기 와서 네 개를 다 먹었어.",
      "검은 것과 갈색 것을 가져와.",
      "그거 하고 있어? 그거 먹어도 맛있을까?",
      "너 그거 가지고 있어? 안을 들여다봐."
    ],
    quiz:{ q:"How many did he eat?", choices:["four","two","three","all"], answer:0 } },

  { level:4, title:"The new ride",
    sentences:[
      "She saw this new one, and it is so pretty!",
      "They ran out now, but we must go there soon.",
      "Please get on and ride!",
      "Say no to that one.",
      "Our new one is here."
    ],
    ko:[
      "그녀가 이 새것을 봤는데, 정말 예뻐!",
      "그들은 지금 뛰어나갔지만, 우리는 곧 저기로 가야 해.",
      "어서 올라타서 타 봐!",
      "저건 싫다고 말해.",
      "우리 새것이 여기 있어."
    ],
    quiz:{ q:"How does the new one look?", choices:["pretty","funny","little","black"], answer:0 } },

  { level:5, title:"What was it?",
    sentences:[
      "What was it?",
      "It was white, too.",
      "I want to play again with you.",
      "Who will come? Ask me.",
      "Yes, we could go after she went away.",
      "It is under here, by me.",
      "Do you want any? I do, as well.",
      "It could be an all-white one."
    ],
    ko:[
      "그건 뭐였지?",
      "그것도 하얬어.",
      "너랑 또 놀고 싶어.",
      "누가 올까? 나한테 물어봐.",
      "응, 그녀가 간 다음에 우리 갈 수 있었어.",
      "그건 여기 아래, 내 옆에 있어.",
      "너 좀 갖고 싶어? 나도 갖고 싶어.",
      "온통 하얀 것일 수도 있어."
    ],
    quiz:{ q:"What color was it?", choices:["white","black","red","blue"], answer:0 } },

  { level:6, title:"How are you?",
    sentences:[
      "How are you? I know her, and I know him.",
      "His old one is just here.",
      "Let me give one of two to him.",
      "She had it once, and now he has it.",
      "Every one may open it.",
      "It can fly away, going up.",
      "This is from her, and I will live here."
    ],
    ko:[
      "잘 지내? 나는 그녀도 알고, 그도 알아.",
      "그의 낡은 것이 바로 여기 있어.",
      "둘 중 하나를 그에게 줄게.",
      "그녀가 한때 가졌고, 이제는 그가 가지고 있어.",
      "누구나 그걸 열 수 있어.",
      "그것은 위로 날아갈 수 있어.",
      "이건 그녀가 준 거야, 나는 여기서 살 거야."
    ],
    quiz:{ q:"What can it do?", choices:["fly away","sleep","eat","run"], answer:0 } },

  { level:7, title:"Stop and think",
    sentences:[
      "When you walk, always look around.",
      "Put some over here, then take some.",
      "Stop! Think before you go.",
      "Thank you, you are the best.",
      "I like both of them.",
      "They were here because they had been good.",
      "It is round."
    ],
    ko:[
      "걸을 때는 항상 주위를 둘러봐.",
      "여기에 좀 놓고, 그다음에 좀 가져가.",
      "멈춰! 가기 전에 생각해.",
      "고마워, 너는 최고야.",
      "나는 그 둘 다 좋아.",
      "그들은 착했기 때문에 여기 있었어.",
      "그것은 동그래."
    ],
    quiz:{ q:"What should you do before you go?", choices:["think","run","eat","sleep"], answer:0 } },

  { level:8, title:"Cold and fast",
    sentences:[
      "It is so cold, but I don't call off the play.",
      "I found five green ones.",
      "She gave me many, or made many.",
      "Does he read fast? Yes, he goes first.",
      "Buy it, then pull it right.",
      "She made it, and its five are green."
    ],
    ko:[
      "너무 춥지만, 나는 놀이를 취소하지 않아.",
      "나는 초록색 다섯 개를 찾았어.",
      "그녀가 나에게 많이 주거나 많이 만들었어.",
      "그는 빨리 읽어? 응, 그가 제일 먼저야.",
      "그걸 사고, 오른쪽으로 당겨.",
      "그녀가 만들었고, 그 다섯 개는 초록색이야."
    ],
    quiz:{ q:"How does he read?", choices:["fast","cold","green","first"], answer:0 } },

  { level:9, title:"Sit and sing",
    sentences:[
      "Sit down and sing with us.",
      "Tell us about your one.",
      "These are their ones, and those are ours.",
      "Why do you wish to sleep now?",
      "Wash up, then work very well.",
      "I would write to you.",
      "Which one do you use? Use this one.",
      "It is upon us now."
    ],
    ko:[
      "앉아서 우리와 함께 노래하자.",
      "네 것에 대해 우리에게 말해 줘.",
      "이것들은 그들의 것이고, 저것들은 우리 거야.",
      "왜 지금 자고 싶어?",
      "씻고 나서 아주 열심히 일해.",
      "나는 너에게 편지를 쓸 거야.",
      "어떤 걸 쓸래? 이걸 써.",
      "이제 우리 차례야."
    ],
    quiz:{ q:"What do we do together first?", choices:["sit and sing","sleep","wash","write"], answer:0 } },

  { level:10, title:"Keep it clean",
    sentences:[
      "Bring it here, and carry it far.",
      "I got eight, and it is full.",
      "Drink if it is not too hot.",
      "Do not fall and hurt.",
      "Keep it clean, and hold it well.",
      "Draw a better one, and it will grow.",
      "She is very kind, and the work is done.",
      "Cut it, if you can."
    ],
    ko:[
      "이걸 여기로 가져오고, 멀리까지 옮겨.",
      "나는 여덟 개를 얻었고, 가득 찼어.",
      "너무 뜨겁지 않으면 마셔.",
      "넘어져서 다치지 마.",
      "깨끗하게 두고, 잘 잡아.",
      "더 좋은 걸 그려, 그러면 자랄 거야.",
      "그녀는 아주 친절해, 그리고 일은 끝났어.",
      "할 수 있으면 그걸 잘라."
    ],
    quiz:{ q:"When should you drink it?", choices:["if it is not too hot","if it is far","if it is done","never"], answer:0 } },

  { level:11, title:"Start together",
    sentences:[
      "Today we start together.",
      "I laugh so much, and I try to sing.",
      "Show me your own small one.",
      "I can do it by myself.",
      "It is long, light, and warm.",
      "Shall I pick six, seven, or ten?",
      "I never do only one."
    ],
    ko:[
      "오늘 우리는 함께 시작해.",
      "나는 많이 웃고, 노래하려고 해.",
      "너의 작은 것을 보여 줘.",
      "나 혼자서도 할 수 있어.",
      "그것은 길고, 가볍고, 따뜻해.",
      "여섯 개, 일곱 개, 아니면 열 개를 고를까?",
      "나는 절대 하나만 하지 않아."
    ],
    quiz:{ q:"How many can I pick?", choices:["six, seven, or ten","only one","eight","none"], answer:0 } },

  { level:12, title:"Brother's Birthday",
    sentences:[
      "Today is my brother's birthday.",
      "The boy sits on a chair by the box.",
      "A cat and a bird are on his bed.",
      "I see a cake, some bread, and one apple.",
      "The baby has a ball and a bell.",
      "A brown bear and a little chicken are here, too.",
      "We put the car and the boat in the box.",
      "Come back and eat cake!"
    ],
    ko:[
      "오늘은 우리 형(오빠) 생일이야.",
      "남자아이가 상자 옆 의자에 앉아 있어.",
      "고양이와 새가 그의 침대 위에 있어.",
      "나는 케이크, 빵, 사과 하나를 봐.",
      "아기가 공과 종을 가지고 있어.",
      "갈색 곰과 작은 병아리도 여기 있어.",
      "우리는 자동차와 배를 상자에 넣어.",
      "다시 와서 케이크 먹어!"
    ],
    quiz:{ q:"Whose birthday is it?", choices:["my brother's","the baby's","the boy's","the cat's"], answer:0 } },

  { level:13, title:"A Day on the Farm",
    sentences:[
      "One cold day, the children went to the farm.",
      "The farmer and my father open the door.",
      "A cow, a duck, and a dog are by the corn.",
      "The dog runs on the floor.",
      "I see a fish and one egg.",
      "Put on your warm coat; it is like Christmas.",
      "The baby holds a doll.",
      "The fire is very hot, so keep your feet back.",
      "My eye can see it all."
    ],
    ko:[
      "추운 어느 날, 아이들이 농장에 갔어.",
      "농부 아저씨와 우리 아빠가 문을 열어.",
      "소, 오리, 개가 옥수수 옆에 있어.",
      "개가 바닥 위를 뛰어.",
      "나는 물고기와 달걀 하나를 봐.",
      "따뜻한 코트를 입어; 크리스마스 같아.",
      "아기가 인형을 안고 있어.",
      "불이 아주 뜨거우니, 발을 뒤로 해.",
      "내 눈은 그걸 다 볼 수 있어."
    ],
    quiz:{ q:"Where did the children go?", choices:["the farm","school","home","the party"], answer:0 } },

  { level:14, title:"Up the Hill",
    sentences:[
      "The girl and a man walk up the hill.",
      "They see a big house and a green garden.",
      "A horse eats grass on the ground.",
      "Two men play a game together.",
      "Hold my hand and put it on your head.",
      "My leg does hurt.",
      "The little kitty drinks milk at home.",
      "I write a letter and pick a flower.",
      "Say goodbye now."
    ],
    ko:[
      "여자아이와 한 남자가 언덕을 올라가.",
      "그들은 큰 집과 초록 정원을 봐.",
      "말이 땅 위에서 풀을 먹어.",
      "남자 두 명이 함께 놀이를 해.",
      "내 손을 잡고 네 머리 위에 올려.",
      "내 다리가 아파.",
      "작은 아기 고양이가 집에서 우유를 마셔.",
      "나는 편지를 쓰고 꽃을 한 송이 꺾어.",
      "이제 안녕이라고 말해."
    ],
    quiz:{ q:"What does the kitty drink?", choices:["milk","water","grass","corn"], answer:0 } },

  { level:15, title:"Morning to Night",
    sentences:[
      "In the morning, my mother goes to school with me.",
      "A pig, a sheep, and a rabbit are on the farm.",
      "A robin sits in its nest.",
      "I draw a picture on paper and write my name.",
      "We have a party, and I get some money.",
      "Santa Claus has a red ring.",
      "The rain comes at night.",
      "Put on your new shoe.",
      "Grow a seed in the garden."
    ],
    ko:[
      "아침에 우리 엄마가 나와 함께 학교에 가.",
      "돼지, 양, 토끼가 농장에 있어.",
      "울새가 자기 둥지에 앉아 있어.",
      "나는 종이에 그림을 그리고 내 이름을 써.",
      "우리는 파티를 하고, 나는 돈을 좀 받아.",
      "산타 할아버지는 빨간 반지를 가지고 있어.",
      "밤에 비가 와.",
      "새 신발을 신어.",
      "정원에 씨앗을 심어 키워."
    ],
    quiz:{ q:"When does the rain come?", choices:["at night","in the morning","at school","at the party"], answer:0 } },

  { level:16, title:"A Winter Day",
    sentences:[
      "My sister and I sit at the table.",
      "We look out the window at the snow.",
      "The cold wind comes down the street.",
      "A squirrel runs up the tree with a stick.",
      "The sun is on top of the hill.",
      "We sing a song and play with a toy.",
      "It is time to drink some water.",
      "My watch is small and new.",
      "Show me the way to the wood.",
      "What is that thing by the window?"
    ],
    ko:[
      "언니(누나)와 내가 식탁에 앉아 있어.",
      "우리는 창밖의 눈을 봐.",
      "차가운 바람이 길을 따라 내려와.",
      "다람쥐가 막대기를 물고 나무 위로 올라가.",
      "해가 언덕 꼭대기에 있어.",
      "우리는 노래를 부르고 장난감을 가지고 놀아.",
      "이제 물을 좀 마실 시간이야.",
      "내 시계는 작고 새것이야.",
      "숲으로 가는 길을 알려 줘.",
      "창문 옆에 있는 저건 뭐지?"
    ],
    quiz:{ q:"What do they see out the window?", choices:["snow","rain","the sun","a squirrel"], answer:0 } }
];
