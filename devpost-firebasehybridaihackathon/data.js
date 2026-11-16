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
    "linkMatch": [
      "링크가 보낸 쪽 이름과 맞음",
      "Link matches the sender's name"
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
      "이 회사나 서비스를 실제로 쓰나요?",
      "Do you actually use this company / service?"
    ],
    "usual": [
      "보통 이 방식으로 연락하나요?",
      "Do they usually contact you this way?"
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
    "linkMatch": {
      "match": [
        "맞음",
        "Matches"
      ],
      "mismatch": [
        "다름",
        "Does not match"
      ],
      "nolink": [
        "링크 없음",
        "No link"
      ],
      "unclear": [
        "알 수 없음",
        "Unclear"
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
        "linkMatch": "mismatch",
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
        "linkMatch": "match",
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
        "linkMatch": "nolink",
        "pressure": "new-phone",
        "money": "gift",
        "customer": "unknown",
        "usual": "unknown"
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
        "linkMatch": "mismatch",
        "pressure": "suspended",
        "money": "credentials",
        "customer": "unknown",
        "usual": "unknown"
      }
    },
    {
      "id": 5,
      "title": [
        "새로 나온 수법",
        "A brand-new scam shape"
      ],
      "headline": [
        "목록에 없는 수법은\n모른다고 말해요.",
        "Not on the list yet.\nSo it says so."
      ],
      "story": [
        "통행료 미납을 알리는 문자가 왔어요. 수법 카드에 아직 없는 모양이라 처음엔 판단하지 못해요. 클라우드 목록이 갱신되면 같은 캡처가 빨강으로 바뀌어요.",
        "A text claims an unpaid toll fee. The pattern list does not know this shape yet, so the first check is yellow. After the cloud list updates, the same capture turns red."
      ],
      "task": [
        "확인 → 목록 갱신 → 다시 확인",
        "Check, update the list, then check again"
      ],
      "success": [
        "노랑이 빨강으로 바뀜, 앱 업데이트 없음",
        "Yellow turns red with no app update"
      ],
      "personal": 3,
      "types": [
        [
          "이름",
          "전화번호",
          "차량번호"
        ],
        [
          "Name",
          "Phone",
          "Plate"
        ]
      ],
      "shape": {
        "channel": "sms-forward",
        "sender": "government",
        "ask": "pay",
        "domain": "tollbalance-pay.example",
        "linkMatch": "mismatch",
        "pressure": "urgent",
        "money": "fee",
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
        "linkMatch": "unclear",
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
      "source": "https://consumer.ftc.gov/consumer-alerts/2020/09/heard-about-waiting-package-phishing-scam",
      "shape": "A text or email claims to be a delivery service holding a package and asks you to click a link to reschedule or pay a small fee.",
      "channel": [
        "text",
        "email"
      ]
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
      "source": "https://consumer.ftc.gov/articles/scammers-use-fake-emergencies-steal-your-money",
      "shape": "A caller or message claims to be a relative or friend in an emergency, possibly with a cloned voice, and urgently asks for money while asking for secrecy.",
      "channel": [
        "phone",
        "text",
        "messenger"
      ]
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
      "source": "https://consumer.ftc.gov/articles/how-recognize-avoid-phishing-scams",
      "shape": "A message posing as a bank or known company says your account is on hold or has a problem and asks you to log in or confirm details through a link.",
      "channel": [
        "email",
        "text"
      ]
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
      "source": "https://consumer.ftc.gov/articles/how-avoid-government-impersonation-scam",
      "shape": "A caller or message posing as a government agency threatens arrest or lost benefits and demands immediate payment or sensitive numbers.",
      "channel": [
        "phone",
        "email",
        "text"
      ]
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
      "source": "https://consumer.ftc.gov/articles/fake-prize-sweepstakes-and-lottery-scams",
      "shape": "An unexpected message says you won a prize or lottery and asks you to pay taxes, shipping or fees first.",
      "channel": [
        "email",
        "text",
        "phone",
        "messenger"
      ]
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
      "source": "https://consumer.ftc.gov/articles/job-scams",
      "shape": "A recruiter or employer offers easy high-paid work and asks you to pay for kits, training or certification before starting.",
      "channel": [
        "email",
        "text",
        "messenger"
      ]
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
      "source": "https://consumer.ftc.gov/articles/how-spot-avoid-and-report-tech-support-scams",
      "shape": "A pop-up, call or text claims your computer has a problem or a renewal was charged, and asks for remote access or a call to a number.",
      "channel": [
        "email",
        "text",
        "phone"
      ]
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
      "source": "https://consumer.ftc.gov/articles/what-know-about-cryptocurrency-scams",
      "shape": "A person met online steers the chat toward a guaranteed-return crypto investment on a fake platform and asks you to send money.",
      "channel": [
        "messenger",
        "text"
      ]
    },
    {
      "id": "toll",
      "name": [
        "통행료 미납 사칭",
        "Unpaid toll text"
      ],
      "features": [
        "toll",
        "pay",
        "link"
      ],
      "action": [
        "통행료 기관의 공식 사이트나 알고 있는 번호로 직접 확인하세요.",
        "Check with the toll agency using its official website or number."
      ],
      "source": "https://consumer.ftc.gov/consumer-alerts/2024/05/text-about-overdue-toll-charges-probably-scam",
      "shape": "A text claiming to be a toll agency says you owe a small overdue toll and urges you to pay through a link to avoid late fees.",
      "channel": [
        "text"
      ],
      "since": 2
    },
    {
      "id": "safe-account",
      "name": [
        "돈을 안전계좌로 옮기라는 요구",
        "Move-your-money-to-protect-it"
      ],
      "features": [
        "transfer",
        "safe-account",
        "secret"
      ],
      "action": [
        "안전을 위해 돈을 옮기라는 요구에는 응하지 말고 전화를 끊으세요.",
        "Hang up. Never move money to protect it."
      ],
      "source": "https://consumer.ftc.gov/consumer-alerts/2024/01/did-someone-tell-you-move-or-transfer-your-money-it-could-be-scam",
      "shape": "A caller posing as an agency or company says your identity is being misused and tells you to move your savings to a safe account and keep it secret.",
      "channel": [
        "phone",
        "text"
      ]
    },
    {
      "id": "romance",
      "name": [
        "온라인 연인의 송금 요구",
        "Romance scam"
      ],
      "features": [
        "romance",
        "money",
        "overseas"
      ],
      "action": [
        "직접 만난 적 없는 사람에게 돈이나 선물을 보내지 마세요.",
        "Never send money to someone you have not met in person."
      ],
      "source": "https://consumer.ftc.gov/articles/what-know-about-romance-scams",
      "shape": "Someone you only met online builds a close bond, cannot meet in person, and invents urgent needs that require you to send money or gift cards.",
      "channel": [
        "messenger",
        "text"
      ]
    },
    {
      "id": "utility",
      "name": [
        "공과금 정지 협박 사칭",
        "Utility shut-off threat"
      ],
      "features": [
        "utility",
        "shutoff",
        "pay"
      ],
      "action": [
        "고지서에 적힌 번호로 직접 업체에 전화해 확인하세요.",
        "Call the utility using the number on your bill."
      ],
      "source": "https://consumer.ftc.gov/articles/scammers-pretend-be-your-utility-company",
      "shape": "A caller or text posing as your gas, electric or water company threatens an immediate shut-off unless you pay by gift card, crypto or wire.",
      "channel": [
        "phone",
        "text",
        "email"
      ]
    },
    {
      "id": "rental",
      "name": [
        "허위 임대 매물",
        "Fake rental listing"
      ],
      "features": [
        "rental",
        "deposit",
        "listing"
      ],
      "action": [
        "집을 보기 전에는 보증금이나 월세를 보내지 마세요.",
        "Do not send a deposit before seeing the home."
      ],
      "source": "https://consumer.ftc.gov/articles/rental-listing-scams",
      "shape": "A too-cheap rental listing, often copied from a real one, has an unavailable owner who pressures you to pay a deposit or first month before viewing.",
      "channel": [
        "messenger",
        "email"
      ]
    },
    {
      "id": "student-loan",
      "name": [
        "학자금 대출 탕감 사칭",
        "Student loan relief scam"
      ],
      "features": [
        "student-loan",
        "fee",
        "login-id"
      ],
      "action": [
        "학자금 도움을 받는다며 선불 수수료를 내지 마세요.",
        "Do not pay upfront fees for student loan help."
      ],
      "source": "https://consumer.ftc.gov/consumer-alerts/2025/06/student-loan-scammers-wont-offer-relief",
      "shape": "A caller or message offers to erase your student loans fast for an upfront fee and may ask for your federal student aid login ID.",
      "channel": [
        "phone",
        "text",
        "email"
      ]
    },
    {
      "id": "fake-check",
      "name": [
        "가짜 수표 초과분 환불 요구",
        "Fake check overpayment"
      ],
      "features": [
        "check",
        "overpay",
        "refund"
      ],
      "action": [
        "수표를 받았다면 차액을 돌려보내거나 다른 곳에 송금하지 마세요.",
        "Never send money back to someone who sent you a check."
      ],
      "source": "https://consumer.ftc.gov/fakechecks",
      "shape": "A stranger sends a check for more than owed and asks you to send part of the money back or forward it, before the bank discovers the check is fake.",
      "channel": [
        "email",
        "messenger"
      ]
    },
    {
      "id": "charity",
      "name": [
        "가짜 자선단체 모금",
        "Fake charity appeal"
      ],
      "features": [
        "charity",
        "donation",
        "pressure"
      ],
      "action": [
        "후원하기 전에 단체를 직접 검색해 확인하고 카드로 내세요.",
        "Research the charity first and pay by credit card."
      ],
      "source": "https://consumer.ftc.gov/consumer-alerts/2024/11/give-charity-not-scam",
      "shape": "A caller or social post using a charity-like name pressures you to donate quickly, stays vague about its work, and wants crypto, wire or gift cards.",
      "channel": [
        "phone",
        "messenger"
      ]
    },
    {
      "id": "phantom-hacker",
      "name": [
        "해킹당했다며 단계별로 접근",
        "Phantom hacker"
      ],
      "features": [
        "tech",
        "bank",
        "safe-account"
      ],
      "action": [
        "컴퓨터 원격 접속을 허용하지 말고 은행에 직접 전화하세요.",
        "Do not allow remote access. Call your bank directly."
      ],
      "source": "https://www.ic3.gov/PSA/2023/PSA230929",
      "shape": "A fake tech-support agent, then a fake bank agent, then a fake government official say hackers hit your accounts and tell you to move money to a safe account.",
      "channel": [
        "phone",
        "email"
      ]
    },
    {
      "id": "virtual-kidnapping",
      "name": [
        "가짜 납치 협박",
        "Virtual kidnapping"
      ],
      "features": [
        "family",
        "ransom",
        "photo"
      ],
      "action": [
        "가족에게 직접 연락해 안전을 확인하기 전에는 송금하지 마세요.",
        "Contact your loved one directly before paying anything."
      ],
      "source": "https://www.ic3.gov/PSA/2025/PSA251205",
      "shape": "A text claims a loved one is kidnapped, sends an altered photo as proof, and demands an immediate ransom payment under threat.",
      "channel": [
        "text",
        "phone"
      ]
    },
    {
      "id": "amazon-purchase",
      "name": [
        "쇼핑몰 의심 결제 사칭",
        "Fake store purchase alert"
      ],
      "features": [
        "store",
        "purchase",
        "fraud"
      ],
      "action": [
        "링크를 누르지 말고 쇼핑몰 앱에 직접 로그인해 확인하세요.",
        "Log in to the store’s app yourself instead of using the link."
      ],
      "source": "https://consumer.ftc.gov/consumer-alerts/2024/03/did-you-get-call-or-text-about-suspicious-purchase-amazon-its-scam",
      "shape": "A call or text from a fake online retailer reports a suspicious charge or recalled item and offers a refund via a link or asks you to move money.",
      "channel": [
        "phone",
        "text"
      ]
    },
    {
      "id": "package-qr",
      "name": [
        "주문하지 않은 소포의 QR 코드",
        "Unexpected package QR code"
      ],
      "features": [
        "package",
        "qr",
        "unordered"
      ],
      "action": [
        "주문하지 않은 소포의 QR 코드는 스캔하지 마세요.",
        "Do not scan a QR code from an unexpected package."
      ],
      "source": "https://consumer.ftc.gov/consumer-alerts/2025/01/scam-alert-qr-code-unexpected-package",
      "shape": "An unordered package arrives with a note urging you to scan a QR code to find the sender, leading to a phishing site.",
      "channel": [
        "text"
      ]
    },
    {
      "id": "crypto-atm",
      "name": [
        "암호화폐 ATM 입금 요구",
        "Crypto ATM payment demand"
      ],
      "features": [
        "crypto",
        "atm",
        "qr"
      ],
      "action": [
        "누가 암호화폐로 내라고 하면 바로 멈추고 끊으세요.",
        "Stop and hang up if anyone asks for payment in crypto."
      ],
      "source": "https://consumer.ftc.gov/new-crypto-payment-scam-alert",
      "shape": "A caller posing as an official or utility keeps you on the phone and sends you to a crypto ATM to deposit cash and scan their QR code.",
      "channel": [
        "phone"
      ]
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
  },
  {
    "scene": 5,
    "file": "samples/message-5.png",
    "width": 760,
    "height": 520,
    "personalDetails": [
      {
        "type": "phone",
        "x": 249,
        "y": 158,
        "width": 85,
        "height": 18
      },
      {
        "type": "name",
        "x": 395,
        "y": 219,
        "width": 121,
        "height": 25
      },
      {
        "type": "plate",
        "x": 233,
        "y": 248,
        "width": 89,
        "height": 25
      }
    ],
    "fictional": true
  }
];
