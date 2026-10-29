/* Bundled data: keep patterns.json in sync; no fetch is needed on file://. */
window.SHAPE_DATA = {
  "labels": {
    "channel": [
      "받은 곳",
      "Channel"
    ],
    "sender": [
      "보낸 쪽",
      "Sender type"
    ],
    "ask": [
      "요구하는 것",
      "Asks you to"
    ],
    "domain": [
      "링크 주소",
      "Link domain"
    ],
    "pressure": [
      "재촉하는 말",
      "Pressure words"
    ],
    "money": [
      "돈이나 정보 요구",
      "Money or data asked"
    ],
    "customer": [
      "거래 여부",
      "Use this company"
    ],
    "usual": [
      "평소 수신 경로",
      "Usual channel"
    ]
  },
  "options": {
    "channel": {
      "email": [
        "이메일",
        "Email"
      ],
      "messenger": [
        "메신저",
        "Messenger"
      ],
      "sms-forward": [
        "전달받은 문자",
        "Forwarded text"
      ]
    },
    "sender": {
      "delivery": [
        "택배사",
        "Delivery company"
      ],
      "shop": [
        "쇼핑몰",
        "Online store"
      ],
      "family": [
        "가족을 자처한 사람",
        "Someone claiming to be family"
      ],
      "bank": [
        "은행",
        "Bank"
      ],
      "government": [
        "공공기관",
        "Government agency"
      ],
      "prize": [
        "경품 안내",
        "Prize organizer"
      ],
      "job": [
        "채용 담당자",
        "Recruiter"
      ],
      "tech": [
        "기술 지원",
        "Tech support"
      ],
      "romance": [
        "온라인에서 만난 사람",
        "Online acquaintance"
      ],
      "unknown": [
        "알 수 없음",
        "Unknown"
      ]
    },
    "ask": {
      "pay": [
        "소액 결제",
        "Pay a small fee"
      ],
      "track": [
        "배송 조회",
        "Track a package"
      ],
      "gift": [
        "상품권 구입",
        "Buy gift cards"
      ],
      "login": [
        "로그인",
        "Log in"
      ],
      "code": [
        "인증번호 전달",
        "Send a verification code"
      ],
      "call": [
        "전화",
        "Call a number"
      ],
      "invest": [
        "투자금 송금",
        "Send investment money"
      ],
      "remote": [
        "원격 접속 허용",
        "Allow remote access"
      ],
      "reply": [
        "답장",
        "Reply"
      ],
      "none": [
        "요구 없음",
        "No action requested"
      ]
    },
    "pressure": {
      "urgent": [
        "24시간 안에 처리",
        "Within 24 hours"
      ],
      "suspended": [
        "계좌 정지 경고",
        "Account suspended"
      ],
      "new-phone": [
        "휴대전화가 고장 났다고 함",
        "Claims their phone broke"
      ],
      "reward": [
        "보상 약속",
        "Promises a reward"
      ],
      "none": [
        "재촉 없음",
        "No pressure"
      ]
    },
    "money": {
      "fee": [
        "1.99달러 수수료",
        "US$1.99 fee"
      ],
      "gift": [
        "100달러 상품권 2장",
        "Two US$100 gift cards"
      ],
      "credentials": [
        "로그인 정보",
        "Login credentials"
      ],
      "code": [
        "인증번호",
        "Verification code"
      ],
      "payment": [
        "선결제",
        "Advance payment"
      ],
      "investment": [
        "투자금",
        "Investment funds"
      ],
      "none": [
        "요구 없음",
        "Nothing requested"
      ]
    },
    "customer": {
      "yes": [
        "예",
        "Yes"
      ],
      "no": [
        "아니요",
        "No"
      ],
      "unknown": [
        "모르겠어요",
        "Not sure"
      ]
    },
    "usual": {
      "yes": [
        "예",
        "Yes"
      ],
      "no": [
        "아니요",
        "No"
      ],
      "unknown": [
        "모르겠어요",
        "Not sure"
      ]
    }
  },
  "scenes": [
    {
      "id": 1,
      "title": [
        "택배 미배송 사칭",
        "Fake delivery notice"
      ],
      "headline": [
        "배송비를 내라는 메일,\n눌러도 될까요?",
        "A delivery fee.\nOr a familiar scam?"
      ],
      "story": [
        "주소를 고치고 1.99달러를 내라는 메일을 받았어요. 이름과 주소도 적혀 있어요.",
        "A delivery email asks for US$1.99. It even knows the recipient’s name and address."
      ],
      "task": [
        "보낼 내용을 보고 확인하세요",
        "Review the details, then check"
      ],
      "success": [
        "빨간 판정과 전송 내역 확인",
        "A red result and an exact receipt"
      ],
      "personal": 5,
      "types": [
        [
          "이름",
          "주소",
          "주문번호",
          "전화번호",
          "이메일"
        ],
        [
          "Name",
          "Address",
          "Order number",
          "Phone",
          "Email"
        ]
      ],
      "shape": {
        "channel": "email",
        "sender": "delivery",
        "ask": "pay",
        "domain": "usps-redelivery-help.example",
        "pressure": "urgent",
        "money": "fee",
        "customer": "unknown",
        "usual": "unknown"
      }
    },
    {
      "id": 2,
      "title": [
        "실제 배송 안내",
        "Real shipping update"
      ],
      "headline": [
        "닮은 메시지라도,\n답은 다를 수 있어요.",
        "Looks similar.\nMeans something else."
      ],
      "story": [
        "실제로 주문한 노스윈드 마켓에서 배송 안내를 받았어요. 추가 결제는 없어요.",
        "An update from Northwind Market, where you placed an order. No extra payment requested."
      ],
      "task": [
        "거래한 쇼핑몰인지 확인하세요",
        "Confirm that you use this store"
      ],
      "success": [
        "초록 판정과 앞 장면 비교",
        "A green result and a comparison"
      ],
      "personal": 3,
      "types": [
        [
          "이름",
          "주소",
          "주문번호"
        ],
        [
          "Name",
          "Address",
          "Order number"
        ]
      ],
      "shape": {
        "channel": "email",
        "sender": "shop",
        "ask": "track",
        "domain": "northwindmarket.example",
        "pressure": "none",
        "money": "none",
        "customer": "yes",
        "usual": "yes"
      }
    },
    {
      "id": 3,
      "title": [
        "새 번호로 온 가족 연락",
        "A “new number” from family"
      ],
      "headline": [
        "“엄마, 나야.”\n먼저 확인해 보세요.",
        "“Mom, it’s me.”\nPause before you help."
      ],
      "story": [
        "처음 보는 번호로 휴대전화가 고장 났다며 상품권을 사 달라는 연락이 왔어요.",
        "An unfamiliar number claims their phone broke and asks for two US$100 gift cards."
      ],
      "task": [
        "상품권 요구를 확인하세요",
        "Check the gift card request"
      ],
      "success": [
        "빨간 판정과 원래 번호로 전화 안내",
        "A red result and advice to call the old number"
      ],
      "personal": 2,
      "types": [
        [
          "전화번호",
          "이름"
        ],
        [
          "Phone",
          "Name"
        ]
      ],
      "shape": {
        "channel": "messenger",
        "sender": "family",
        "ask": "gift",
        "domain": "none",
        "pressure": "new-phone",
        "money": "gift",
        "customer": "unknown",
        "usual": "no"
      }
    },
    {
      "id": 4,
      "title": [
        "은행 계좌 정지 사칭",
        "Fake bank alert"
      ],
      "headline": [
        "내 정보를 안다고,\n진짜 은행은 아니에요.",
        "Knowing your details\ndoesn’t make it your bank."
      ],
      "story": [
        "이름과 계좌 끝자리가 맞아요. 하지만 24시간 안에 로그인하라고 재촉해요.",
        "The email knows a name and account digits. It demands a login within 24 hours."
      ],
      "task": [
        "가려진 정보와 전송 내역을 보세요",
        "Compare the hidden details with the receipt"
      ],
      "success": [
        "개인정보 5개가 기기에 남음",
        "Five personal details stay on this device"
      ],
      "personal": 5,
      "types": [
        [
          "이름",
          "계좌 끝자리",
          "주소",
          "이메일",
          "전화번호"
        ],
        [
          "Name",
          "Account digits",
          "Address",
          "Email",
          "Phone"
        ]
      ],
      "shape": {
        "channel": "email",
        "sender": "bank",
        "ask": "login",
        "domain": "account-verify.example",
        "pressure": "suspended",
        "money": "credentials",
        "customer": "unknown",
        "usual": "unknown"
      }
    },
    {
      "id": 5,
      "title": [
        "기기에서 읽을 수 없을 때",
        "When on-device AI is unavailable"
      ],
      "headline": [
        "읽을 수 없다면,\n보내지 않아요.",
        "If it can’t stay private,\nit doesn’t leave."
      ],
      "story": [
        "지금 브라우저에서는 기기 안 AI를 쓸 수 없어요. 원본을 대신 보내지 않고 멈춰요.",
        "This browser cannot read the screenshot on-device. The original is never sent as a fallback."
      ],
      "task": [
        "직접 입력하거나 브라우저 안내를 보세요",
        "Type the key parts or view browser help"
      ],
      "success": [
        "전송 0자, 원본 0장",
        "Zero characters and zero images sent"
      ],
      "personal": 0,
      "types": [
        [],
        []
      ],
      "shape": {
        "channel": "email",
        "sender": "unknown",
        "ask": "none",
        "domain": "none",
        "pressure": "none",
        "money": "none",
        "customer": "unknown",
        "usual": "unknown"
      }
    }
  ],
  "patterns": [
    {
      "id": "delivery",
      "name": [
        "택배 수수료 사칭",
        "Fake delivery fee"
      ],
      "features": [
        "delivery",
        "pay",
        "fee"
      ],
      "action": [
        "택배사 공식 앱이나 usps.com을 직접 열어 조회하세요.",
        "Open the carrier’s official app or type usps.com yourself."
      ],
      "source": "https://consumer.ftc.gov/articles/how-recognize-avoid-phishing-scams"
    },
    {
      "id": "family",
      "name": [
        "새 번호를 쓰는 가족 사칭",
        "New-phone family impersonation"
      ],
      "features": [
        "family",
        "gift",
        "new-phone"
      ],
      "action": [
        "가족의 원래 전화번호로 먼저 전화하세요.",
        "Call your family member’s old number before doing anything."
      ],
      "source": "https://consumer.ftc.gov/articles/scammers-use-fake-emergencies-steal-your-money"
    },
    {
      "id": "bank",
      "name": [
        "계좌 정지 사칭",
        "Account suspension phishing"
      ],
      "features": [
        "bank",
        "login",
        "suspended"
      ],
      "action": [
        "은행 공식 앱을 직접 열어 확인하세요.",
        "Open your bank’s official app yourself."
      ],
      "source": "https://consumer.ftc.gov/articles/how-recognize-avoid-phishing-scams"
    },
    {
      "id": "government",
      "name": [
        "공공기관 사칭",
        "Government impersonation"
      ],
      "features": [
        "government",
        "payment",
        "code"
      ],
      "action": [
        "기관의 공식 홈페이지에서 전화번호를 찾아 확인하세요.",
        "Find the agency’s number on its official website and call."
      ],
      "source": "https://consumer.ftc.gov/articles/how-avoid-government-impersonation-scam"
    },
    {
      "id": "prize",
      "name": [
        "경품 수령비 요구",
        "Prize fee scam"
      ],
      "features": [
        "prize",
        "pay",
        "payment"
      ],
      "action": [
        "경품을 받기 위한 돈은 보내지 마세요.",
        "Do not pay to claim a prize."
      ],
      "source": "https://consumer.ftc.gov/articles/fake-prize-sweepstakes-and-lottery-scams"
    },
    {
      "id": "job",
      "name": [
        "취업이나 과제 선입금 요구",
        "Job and task scam"
      ],
      "features": [
        "job",
        "payment",
        "reward"
      ],
      "action": [
        "일을 시작하기 위한 선입금은 하지 마세요.",
        "Do not pay upfront to start a job."
      ],
      "source": "https://consumer.ftc.gov/articles/job-scams"
    },
    {
      "id": "tech",
      "name": [
        "기술 지원 사칭",
        "Tech support scam"
      ],
      "features": [
        "tech",
        "remote",
        "call"
      ],
      "action": [
        "원격 접속을 허용하지 말고 공식 지원 창구를 찾으세요.",
        "Do not grant remote access. Contact official support."
      ],
      "source": "https://consumer.ftc.gov/articles/how-spot-avoid-and-report-tech-support-scams"
    },
    {
      "id": "investment",
      "name": [
        "친분을 이용한 투자 권유",
        "Relationship investment scam"
      ],
      "features": [
        "romance",
        "invest",
        "investment"
      ],
      "action": [
        "온라인에서 만난 사람이 알려 준 곳으로 돈을 보내지 마세요.",
        "Do not send money to an investment introduced by an online acquaintance."
      ],
      "source": "https://consumer.ftc.gov/articles/what-know-about-cryptocurrency-scams"
    }
  ],
  "sources": {
    "fraud": "https://consumer.ftc.gov/consumer-alerts/2025/03/top-scams-2024",
    "text": "https://www.ftc.gov/business-guidance/blog/2025/04/new-ftc-data-spotlight-highlights-text-scams-may-target-your-business"
  }
};

window.SHAPE_SAMPLES = [
  {
    "scene": 1,
    "file": "samples/message-1.png",
    "width": 760,
    "height": 520,
    "personalDetails": [
      {
        "type": "email",
        "x": 234,
        "y": 158,
        "width": 166,
        "height": 18
      },
      {
        "type": "name",
        "x": 262,
        "y": 207,
        "width": 109,
        "height": 25
      },
      {
        "type": "address",
        "x": 217,
        "y": 273,
        "width": 241,
        "height": 24
      },
      {
        "type": "order",
        "x": 256,
        "y": 379,
        "width": 62,
        "height": 19
      },
      {
        "type": "phone",
        "x": 379,
        "y": 379,
        "width": 95,
        "height": 19
      }
    ],
    "fictional": true
  },
  {
    "scene": 2,
    "file": "samples/message-2.png",
    "width": 760,
    "height": 520,
    "personalDetails": [
      {
        "type": "name",
        "x": 262,
        "y": 207,
        "width": 109,
        "height": 25
      },
      {
        "type": "order",
        "x": 305,
        "y": 244,
        "width": 167,
        "height": 25
      },
      {
        "type": "address",
        "x": 322,
        "y": 281,
        "width": 241,
        "height": 24
      }
    ],
    "fictional": true
  },
  {
    "scene": 3,
    "file": "samples/message-3.png",
    "width": 760,
    "height": 520,
    "personalDetails": [
      {
        "type": "phone",
        "x": 249,
        "y": 158,
        "width": 88,
        "height": 18
      },
      {
        "type": "name",
        "x": 343,
        "y": 219,
        "width": 100,
        "height": 25
      }
    ],
    "fictional": true
  },
  {
    "scene": 4,
    "file": "samples/message-4.png",
    "width": 760,
    "height": 520,
    "personalDetails": [
      {
        "type": "email",
        "x": 234,
        "y": 158,
        "width": 166,
        "height": 18
      },
      {
        "type": "name",
        "x": 259,
        "y": 207,
        "width": 109,
        "height": 25
      },
      {
        "type": "account",
        "x": 387,
        "y": 244,
        "width": 41,
        "height": 25
      },
      {
        "type": "address",
        "x": 275,
        "y": 350,
        "width": 189,
        "height": 19
      },
      {
        "type": "phone",
        "x": 263,
        "y": 372,
        "width": 95,
        "height": 19
      }
    ],
    "fictional": true
  }
];
