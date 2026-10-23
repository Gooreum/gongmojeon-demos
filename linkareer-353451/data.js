/* 제공된 조건표와 사전 계산 결과. 출처 본문은 화면에 쓰는 짧은 발췌만 포함합니다. 실험 원본은 docs/experiments에 보관합니다. */
window.DEMO_DATA = {
  "benefits": {
    "_설명": "먼저살기 달력 조건표. AI 추출(extract-out/) 결과를 사람이 원문과 대조해 확정한 값만 넣었다. status: 확인됨=공식 원문 2곳 이상 같음 / 한 곳 확인=공식 원문 1곳 또는 보도 / 확인 필요=원문에 없음. 데모와 engine.py 가 이 파일을 그대로 읽는다.",
    "asOf": "2026-10-23",
    "benefits": [
      {
        "id": "allowance",
        "name": "자립수당",
        "payer": "국가(주소지 시·군·구가 지급)",
        "amount_won": 500000,
        "unit": "월",
        "pay_day": "매월 20일(주말·공휴일이면 그 전날)",
        "max_count": 60,
        "rules": {
          "care_min_months": 24,
          "care_rule": "보호종료가 A년 B월이면 (A-2)년 B월까지 보호가 시작됐어야 함(보호종료 달 기준 24개월 이상 연속)",
          "within_years_after_end": 5,
          "end_after": "2018-08",
          "early_end_18th_after": "2024-02-09",
          "excluded": [
            "보호 조기종료 뒤 원가정 복귀",
            "다른 법령으로 자립수당 등을 받는 중"
          ],
          "pre_apply_days": 30,
          "retro_days": 60
        },
        "apply_where": "주소지 읍·면·동 행정복지센터 방문, 또는 본인이 복지로 온라인(대리 신청은 방문만)",
        "documents": [
          "신청서",
          "신분증",
          "통장 사본",
          "자립교육 이수증(서민금융진흥원 금융교육포털 또는 아동권리보장원) 또는 국민연금공단 재무상담 확인서"
        ],
        "status": {
          "amount_won": "확인됨",
          "max_count": "한 곳 확인",
          "care_min_months": "확인됨",
          "within_years_after_end": "확인됨",
          "pre_apply_days": "확인됨",
          "retro_days": "한 곳 확인"
        },
        "sources": [
          {
            "file": "easylaw-allowance.txt",
            "url": "https://easylaw.go.kr/CSP/CnpClsMain.laf?popMenu=ov&csmSeq=2619&ccfNo=2&cciNo=1&cnpClsNo=1",
            "quote": "자립준비청년 본인 명의 계좌로 매월 50만원의 자립수당이 지급되며, 지급일은 매월 20일(주말 및 공휴일의 경우 그 전일 지급)로 합니다"
          },
          {
            "file": "easylaw-allowance.txt",
            "url": "https://easylaw.go.kr/CSP/CnpClsMain.laf?popMenu=ov&csmSeq=2619&ccfNo=2&cciNo=1&cnpClsNo=1",
            "quote": "단, 보호종료 예정 아동의 경우, 보호종료 전 30일 이내 신청 가능"
          },
          {
            "file": "gov24-allowance.txt",
            "url": "https://www.gov.kr/portal/service/serviceInfo/508000000565",
            "quote": "만 18세 이후 만기 또는 연장 보호종료된 자로서 보호종료 5년 이내인 자(단, '18.8월 이후 보호종료된 자)"
          },
          {
            "file": "ncrc-faq.txt",
            "url": "https://www.ncrc.or.kr/ncrc/cm/cntnts/cntntsView.do?mi=1062&cntntsId=1159",
            "quote": "만18세 이후 A년 B월에 보호종료된 아동이 자립수당을 받으려면 (A-2)년 (B+1)월 이전에 보호가 시작된 아동이어야 합니다."
          },
          {
            "file": "seoul-welfare-allowance.txt",
            "url": "https://news.seoul.go.kr/welfare/?p=511982",
            "quote": "지원기간 : 보호종료일이 속한 달부터 최대 60회차 까지 가능 ('25.1월부터, 개월에서 회차로 개정)"
          },
          {
            "file": "vegannews-60days.txt",
            "url": "https://www.vegannews.co.kr/news/article.html?no=390893",
            "quote": "보호종료일을 포함해 60일 이내에 신청하면 보호종료일이 속한 달부터 소급해 지급한다. 이 기간이 지난 뒤 신청하면 신청한 달부터 지급되므로"
          }
        ],
        "open_questions": [
          "조기 보호종료 뒤 만 18세가 되어 받는 경우, 60일 소급 기간을 보호종료일과 만 18세가 된 날 중 어느 날부터 세나요?"
        ]
      },
      {
        "id": "settle",
        "name": "자립정착금",
        "payer": "시·도(시·군·구청에 신청)",
        "unit": "1회",
        "by_region": {
          "서울": {
            "amount_won": 20000000,
            "split": null,
            "status": "한 곳 확인",
            "note": "서울시 2024-02 발표(1,500만원→2,000만원). 2026년 금액은 시 공고로 다시 확인",
            "source": {
              "file": "seoul-mediahub.txt",
              "url": "https://mediahub.seoul.go.kr/archives/2010251",
              "quote": "‘자립정착금’은 1,500만원에서 2,000만원으로 각각 인상하고"
            }
          },
          "경기 구리": {
            "amount_won": 15000000,
            "split": [
              {
                "when": "퇴소한 해",
                "amount_won": 10000000
              },
              {
                "when": "퇴소한 다음 해",
                "amount_won": 5000000
              }
            ],
            "status": "한 곳 확인",
            "source": {
              "file": "guri-settle.txt",
              "url": "https://www.guri.go.kr/youth/contents.do?key=5427",
              "quote": "만18세 이후 보호종료된 아동 15,000,000원 / 1인 / 1회 (퇴소한 해 : 10,000,000원 / 퇴소한 다음 해 : 5,000,000원)"
            }
          },
          "충남": {
            "amount_won": 10000000,
            "split": "2회 분할(나누는 시기는 원문에 없음)",
            "pre_apply_days": 30,
            "status": "한 곳 확인",
            "source": {
              "file": "gov24-chungnam-settle.txt",
              "url": "https://www.gov.kr/portal/rcvfvrSvc/dtlEx/644000000843",
              "quote": "자립 초기에 필요한 자립정착금 1인 1,000만원 지원(2회 분할 지급)"
            }
          }
        },
        "other_region": {
          "amount_range_won": [
            10000000,
            20000000
          ],
          "status": "확인 필요",
          "source": {
            "file": "easylaw-allowance.txt",
            "url": "https://easylaw.go.kr/CSP/CnpClsMain.laf?popMenu=ov&csmSeq=2619&ccfNo=2&cciNo=1&cnpClsNo=1",
            "quote": "자립정착금은 각 지방자치단체에서 지원하며, 거주지에 따라 1,000만원부터 2,000만원 사이로 금액이 다를 수 있습니다"
          }
        },
        "rules": {
          "eligible": "15세 이후 조기 보호종료 또는 18세 이후 보호종료",
          "excluded": [
            "조기 보호종료 뒤 원가정 복귀(지자체 판단으로 지급 가능)",
            "이미 받은 사람(재보호 뒤 재지급 없음)"
          ],
          "late_rule": "부득이한 사유로 그 해에 못 받으면 보호종료일부터 5년 안에 보호종료 해 기준금액으로 지급 가능"
        },
        "apply_where": "시설 또는 가정위탁지원센터에 문의 → 사용계획서 작성 → 센터·시설을 통해 시·군·구청에 신청",
        "sources": [
          {
            "file": "easylaw-allowance.txt",
            "url": "https://easylaw.go.kr/CSP/CnpClsMain.laf?popMenu=ov&csmSeq=2619&ccfNo=2&cciNo=1&cnpClsNo=1",
            "quote": "자립정착금의 신청 방법은 아동복지시설 또는 가정위탁지원센터에 신청문의 후 자립정착금 사용계획서를 작성하여 가정위탁지원센터 또는 시설을 통해 관할 행정복지센터(시·군·구청)에 신청합니다"
          }
        ],
        "open_questions": [
          "서울시 자립정착금 2026년 금액이 2,000만원 그대로인가요, 나눠서 주나요?",
          "충청남도 자립정착금 2회 분할은 언제 얼마씩 들어오나요?"
        ]
      },
      {
        "id": "jeonse",
        "name": "자립준비청년 전세임대(LH)",
        "payer": "한국토지주택공사(LH)",
        "unit": "한도",
        "by_area": {
          "수도권": {
            "limit_won": 120000000
          },
          "광역시": {
            "limit_won": 95000000
          },
          "기타지역": {
            "limit_won": 85000000
          }
        },
        "rules": {
          "eligible": "혼인 중이 아닌 무주택자, 가정위탁 보호종료 또는 아동복지시설 퇴소 5년 이내",
          "within_years_after_end": 5,
          "self_deposit_won": 1000000,
          "rent_rate_range": [
            0.01,
            0.02
          ],
          "age_22_or_under": "월 임대료 무이자",
          "first_5_years": "월 임대료 50% 감면"
        },
        "apply_where": "LH청약플러스(apply.lh.or.kr), 전세임대 콜센터 1670-0002",
        "status": {
          "limit_won": "한 곳 확인",
          "self_deposit_won": "한 곳 확인",
          "rent_rate_range": "한 곳 확인"
        },
        "note": "2024-01 보도 기준. 2026년 한도·금리는 LH청약플러스 공고문으로 다시 확인",
        "sources": [
          {
            "file": "munhwa-jeonse.txt",
            "url": "https://www.munhwa.com/article/11404686",
            "quote": "수도권 1억2000만 원, 광역시 9500만 원, 기타지역 8500만 원 한도로 전세보증금을 지원하며, 입주자는 100만 원의 입주자 부담 보증금과 지원금액(전세금에서 입주자 부담 보증금을 제외한 금액)에 대한 금리(연 1∼2%)를 월 임대료로 부담하게 된다."
          },
          {
            "file": "munhwa-jeonse.txt",
            "url": "https://www.munhwa.com/article/11404686",
            "quote": "전세보증금과 월 임대료는 청년 1순위와 동일하나 월 임대료의 경우 22세 이하인 경우는 무이자, 전세임대주택 거주 5년 이내는 50% 감면 적용된다."
          }
        ],
        "open_questions": [
          "2026년 자립준비청년 전세임대 지원 한도와 월 임대료 금리는 얼마인가요?"
        ]
      },
      {
        "id": "seoul_transit",
        "name": "서울 자립준비청년 대중교통비",
        "payer": "서울시",
        "amount_won": 60000,
        "unit": null,
        "regions": [
          "서울"
        ],
        "status": {
          "amount_won": "한 곳 확인",
          "unit": "확인 필요"
        },
        "note": "원문에 '6만원'만 있고 매달인지, 얼마 동안인지 없음 → 달력·잔액 계산에 넣지 않고 '확인 필요'로만 보여 줌",
        "sources": [
          {
            "file": "seoul-mediahub.txt",
            "url": "https://mediahub.seoul.go.kr/archives/2010251",
            "quote": "‘대중교통비’ 6만원도 지원 한다."
          }
        ],
        "open_questions": [
          "서울시 자립준비청년 대중교통비 6만원은 매달 받나요? 몇 달 동안인가요?"
        ]
      }
    ],
    "regions_area": {
      "서울": "수도권",
      "경기 구리": "수도권",
      "인천": "수도권",
      "부산": "광역시",
      "대구": "광역시",
      "광주": "광역시",
      "대전": "광역시",
      "울산": "광역시",
      "충남": "기타지역"
    },
    "living_cost_default_won": 1080000,
    "living_cost_source": {
      "url": "https://www.nabo.go.kr/board/file/down.do?fid=33318728",
      "quote": "자립준비청년 월평균 생활비 약 108만원(국회예산정책처가 복지부·보건사회연구원 2023 조사를 재인용, p.69)",
      "status": "한 곳 확인"
    }
  },
  "people": {
    "_설명": "가상 청년 10명(실제 인물 아님). expect 는 사람이 benefits.json 의 원문 조건과 달력을 보고 손으로 계산한 정답이다(2026-10-23). 엔진 결과와 칸마다 비교한다. 날짜 계산: 사전 신청 = 보호종료일 30일 전, 소급 마감 = 보호종료일 포함 60일째(보호종료일 + 59일).",
    "today": "2026-10-23",
    "personas": [
      {
        "name": "민지(서울·늦게 신청할 뻔)",
        "region": "서울",
        "birth": "2008-03-02",
        "care_start": "2016-04",
        "end_date": "2026-11-15",
        "end_type": "만기",
        "apply_date": "2027-02-03",
        "expect": {
          "allowance.status": "대상",
          "allowance.open": "2026-10-16",
          "allowance.deadline": "2027-01-13",
          "allowance.lost_won": 1500000,
          "settle.amount_won": 20000000,
          "jeonse.status": "대상",
          "jeonse.limit_won": 120000000
        }
      },
      {
        "name": "준호(구리·미리 신청)",
        "region": "경기 구리",
        "birth": "2008-07-10",
        "care_start": "2019-01",
        "end_date": "2026-12-31",
        "end_type": "만기",
        "apply_date": "2026-12-10",
        "expect": {
          "allowance.status": "대상",
          "allowance.open": "2026-12-01",
          "allowance.deadline": "2027-02-28",
          "allowance.lost_won": 0,
          "settle.amount_won": 15000000,
          "jeonse.limit_won": 120000000
        }
      },
      {
        "name": "서연(충남·마감 12일 넘김)",
        "region": "충남",
        "birth": "2007-05-20",
        "care_start": "2015-03",
        "end_date": "2026-08-20",
        "end_type": "연장",
        "apply_date": "2026-10-30",
        "expect": {
          "allowance.status": "대상",
          "allowance.open": "2026-07-21",
          "allowance.deadline": "2026-10-18",
          "allowance.lost_won": 1000000,
          "allowance.pay_from": "2026-10",
          "settle.amount_won": 10000000,
          "jeonse.limit_won": 85000000
        }
      },
      {
        "name": "하늘(대전·보호 1년 5개월)",
        "region": "대전",
        "birth": "2008-09-01",
        "care_start": "2025-06",
        "end_date": "2026-11-30",
        "end_type": "만기",
        "apply_date": "2026-11-20",
        "expect": {
          "allowance.status": "대상 아님",
          "settle.status": "대상",
          "settle.amount_won": null,
          "jeonse.limit_won": 95000000
        }
      },
      {
        "name": "도윤(구리·1년 2개월 지남)",
        "region": "경기 구리",
        "birth": "2007-02-14",
        "care_start": "2014-06",
        "end_date": "2025-08-31",
        "end_type": "만기",
        "apply_date": "2026-10-23",
        "settle_received": true,
        "expect": {
          "allowance.status": "대상",
          "allowance.deadline": "2025-10-29",
          "allowance.lost_won": 7000000,
          "allowance.pay_from": "2026-10",
          "settle.status": "이미 받음",
          "jeonse.status": "대상"
        }
      },
      {
        "name": "유나(서울·16세 조기종료, 올해 18세)",
        "region": "서울",
        "birth": "2008-03-10",
        "care_start": "2021-01",
        "end_date": "2024-09-30",
        "end_type": "조기",
        "expect": {
          "allowance.status": "대상",
          "allowance.open": "2026-03-10",
          "allowance.deadline": null,
          "allowance.lost_won": null,
          "settle.amount_won": 20000000,
          "jeonse.status": "대상"
        }
      },
      {
        "name": "민수(부산·조기종료 뒤 원가정 복귀)",
        "region": "부산",
        "birth": "2009-01-05",
        "care_start": "2020-02",
        "end_date": "2025-06-30",
        "end_type": "조기",
        "returned_home": true,
        "expect": {
          "allowance.status": "대상 아님",
          "settle.status": "확인 필요",
          "jeonse.status": "확인 필요"
        }
      },
      {
        "name": "지훈(서울·보호종료 6년 지남)",
        "region": "서울",
        "birth": "2002-01-01",
        "care_start": "2010-01",
        "end_date": "2020-05-31",
        "end_type": "만기",
        "expect": {
          "allowance.status": "대상 아님",
          "settle.status": "대상 아님",
          "jeonse.status": "대상 아님"
        }
      },
      {
        "name": "예린(충남·석 달 뒤 보호종료)",
        "region": "충남",
        "birth": "2009-01-20",
        "care_start": "2018-05",
        "end_date": "2027-01-20",
        "end_type": "만기",
        "apply_date": "2026-12-21",
        "expect": {
          "allowance.status": "대상",
          "allowance.open": "2026-12-21",
          "allowance.deadline": "2027-03-20",
          "allowance.lost_won": 0,
          "settle.amount_won": 10000000,
          "jeonse.limit_won": 85000000
        }
      },
      {
        "name": "태오(서울·연장 보호 중 시설 옮김)",
        "region": "서울",
        "birth": "2007-06-01",
        "care_start": "2013-03",
        "end_date": "2026-10-31",
        "end_type": "연장",
        "still_in_care": true,
        "expect": {
          "allowance.status": "아직 보호 중",
          "settle.status": "아직 보호 중",
          "jeonse.status": "아직 보호 중"
        }
      }
    ],
    "scene3": {
      "_설명": "장면 3 민지의 집 고르기 입력값. 금액은 민지가 화면에 넣는 가정값(시연용)이고, 지원 금액만 조건표에서 온다. 생활비 108만원은 국회예산정책처 재인용 평균(집세 포함 여부는 원문에 없음 → 화면에서 '집세 빼고 쓰는 돈'으로 따로 받음).",
      "name": "민지",
      "age": 18,
      "start_balance": 3000000,
      "wage": 1200000,
      "living": 800000,
      "a_deposit": 5000000,
      "a_rent": 450000,
      "b_jeonse": 90000000,
      "b_wait_months": 2,
      "b_wait_cost": 200000,
      "b_upkeep": 80000,
      "allowance_back_months": 1,
      "settle": [
        [
          1,
          20000000
        ]
      ]
    }
  },
  "housing": {
    "input": {
      "_설명": "장면 3 민지의 집 고르기 입력값. 금액은 민지가 화면에 넣는 가정값(시연용)이고, 지원 금액만 조건표에서 온다. 생활비 108만원은 국회예산정책처 재인용 평균(집세 포함 여부는 원문에 없음 → 화면에서 '집세 빼고 쓰는 돈'으로 따로 받음).",
      "name": "민지",
      "age": 18,
      "start_balance": 3000000,
      "wage": 1200000,
      "living": 800000,
      "a_deposit": 5000000,
      "a_rent": 450000,
      "b_jeonse": 90000000,
      "b_wait_months": 2,
      "b_wait_cost": 200000,
      "b_upkeep": 80000,
      "allowance_back_months": 1,
      "settle": [
        [
          1,
          20000000
        ]
      ]
    },
    "result": {
      "민간 월세·제때": {
        "min": -1050000,
        "end": 23900000,
        "flow": [
          {
            "month": "2026-12",
            "in": 1000000,
            "housing": 5450000,
            "balance": -1050000
          },
          {
            "month": "2027-01",
            "in": 20500000,
            "housing": 450000,
            "balance": 19400000
          },
          {
            "month": "2027-02",
            "in": 500000,
            "housing": 450000,
            "balance": 19850000
          },
          {
            "month": "2027-03",
            "in": 500000,
            "housing": 450000,
            "balance": 20300000
          },
          {
            "month": "2027-04",
            "in": 500000,
            "housing": 450000,
            "balance": 20750000
          },
          {
            "month": "2027-05",
            "in": 500000,
            "housing": 450000,
            "balance": 21200000
          },
          {
            "month": "2027-06",
            "in": 500000,
            "housing": 450000,
            "balance": 21650000
          },
          {
            "month": "2027-07",
            "in": 500000,
            "housing": 450000,
            "balance": 22100000
          },
          {
            "month": "2027-08",
            "in": 500000,
            "housing": 450000,
            "balance": 22550000
          },
          {
            "month": "2027-09",
            "in": 500000,
            "housing": 450000,
            "balance": 23000000
          },
          {
            "month": "2027-10",
            "in": 500000,
            "housing": 450000,
            "balance": 23450000
          },
          {
            "month": "2027-11",
            "in": 500000,
            "housing": 450000,
            "balance": 23900000
          }
        ]
      },
      "민간 월세·2달 늦게": {
        "min": -2100000,
        "end": 23900000,
        "flow": [
          {
            "month": "2026-12",
            "in": 0,
            "housing": 5450000,
            "balance": -2050000
          },
          {
            "month": "2027-01",
            "in": 0,
            "housing": 450000,
            "balance": -2100000
          },
          {
            "month": "2027-02",
            "in": 2000000,
            "housing": 450000,
            "balance": -150000
          },
          {
            "month": "2027-03",
            "in": 20500000,
            "housing": 450000,
            "balance": 20300000
          },
          {
            "month": "2027-04",
            "in": 500000,
            "housing": 450000,
            "balance": 20750000
          },
          {
            "month": "2027-05",
            "in": 500000,
            "housing": 450000,
            "balance": 21200000
          },
          {
            "month": "2027-06",
            "in": 500000,
            "housing": 450000,
            "balance": 21650000
          },
          {
            "month": "2027-07",
            "in": 500000,
            "housing": 450000,
            "balance": 22100000
          },
          {
            "month": "2027-08",
            "in": 500000,
            "housing": 450000,
            "balance": 22550000
          },
          {
            "month": "2027-09",
            "in": 500000,
            "housing": 450000,
            "balance": 23000000
          },
          {
            "month": "2027-10",
            "in": 500000,
            "housing": 450000,
            "balance": 23450000
          },
          {
            "month": "2027-11",
            "in": 500000,
            "housing": 450000,
            "balance": 23900000
          }
        ]
      },
      "전세임대·제때": {
        "min": 4200000,
        "end": 32100000,
        "flow": [
          {
            "month": "2026-12",
            "in": 1000000,
            "housing": 200000,
            "balance": 4200000
          },
          {
            "month": "2027-01",
            "in": 20500000,
            "housing": 200000,
            "balance": 24900000
          },
          {
            "month": "2027-02",
            "in": 500000,
            "housing": 1080000,
            "balance": 24720000
          },
          {
            "month": "2027-03",
            "in": 500000,
            "housing": 80000,
            "balance": 25540000
          },
          {
            "month": "2027-04",
            "in": 500000,
            "housing": 80000,
            "balance": 26360000
          },
          {
            "month": "2027-05",
            "in": 500000,
            "housing": 80000,
            "balance": 27180000
          },
          {
            "month": "2027-06",
            "in": 500000,
            "housing": 80000,
            "balance": 28000000
          },
          {
            "month": "2027-07",
            "in": 500000,
            "housing": 80000,
            "balance": 28820000
          },
          {
            "month": "2027-08",
            "in": 500000,
            "housing": 80000,
            "balance": 29640000
          },
          {
            "month": "2027-09",
            "in": 500000,
            "housing": 80000,
            "balance": 30460000
          },
          {
            "month": "2027-10",
            "in": 500000,
            "housing": 80000,
            "balance": 31280000
          },
          {
            "month": "2027-11",
            "in": 500000,
            "housing": 80000,
            "balance": 32100000
          }
        ]
      },
      "전세임대·2달 늦게": {
        "min": 3200000,
        "end": 32100000,
        "flow": [
          {
            "month": "2026-12",
            "in": 0,
            "housing": 200000,
            "balance": 3200000
          },
          {
            "month": "2027-01",
            "in": 0,
            "housing": 200000,
            "balance": 3400000
          },
          {
            "month": "2027-02",
            "in": 2000000,
            "housing": 1080000,
            "balance": 4720000
          },
          {
            "month": "2027-03",
            "in": 20500000,
            "housing": 80000,
            "balance": 25540000
          },
          {
            "month": "2027-04",
            "in": 500000,
            "housing": 80000,
            "balance": 26360000
          },
          {
            "month": "2027-05",
            "in": 500000,
            "housing": 80000,
            "balance": 27180000
          },
          {
            "month": "2027-06",
            "in": 500000,
            "housing": 80000,
            "balance": 28000000
          },
          {
            "month": "2027-07",
            "in": 500000,
            "housing": 80000,
            "balance": 28820000
          },
          {
            "month": "2027-08",
            "in": 500000,
            "housing": 80000,
            "balance": 29640000
          },
          {
            "month": "2027-09",
            "in": 500000,
            "housing": 80000,
            "balance": 30460000
          },
          {
            "month": "2027-10",
            "in": 500000,
            "housing": 80000,
            "balance": 31280000
          },
          {
            "month": "2027-11",
            "in": 500000,
            "housing": 80000,
            "balance": 32100000
          }
        ]
      }
    }
  },
  "story0": {
    "region": "서울",
    "end_date": "2026-11-15",
    "care_years_2plus": true,
    "end_type": null,
    "working": true,
    "returned_home": null,
    "asks": [
      "그룹홈에서 나가시는 날 만 나이가 어떻게 되시나요? (만 18세가 되기 전에 나가시는지, 만 18세가 된 뒤인지, 보호 기간을 연장하셨는지 알려주세요.)",
      "그룹홈에서 나간 뒤에는 어디서 지내실 예정인가요? 원래 가정(부모님 댁)으로 돌아가시나요?"
    ]
  },
  "story9": {
    "region": null,
    "end_date": null,
    "care_years_2plus": null,
    "end_type": null,
    "working": null,
    "returned_home": null,
    "asks": [
      "어느 지역(시·도, 시·군)에서 보호를 받고 계신가요?",
      "보호가 끝나는(퇴소하는) 날짜가 언제인가요? 정확한 날짜를 모르면 몇 월쯤인지라도 알려주세요.",
      "보호를 받은 기간이 모두 합쳐서 2년 이상 이어졌나요?",
      "보호가 만 18세가 되기 전에 끝나나요, 아니면 정해진 기간이 다 돼서 끝나나요, 아니면 기간을 연장했나요?",
      "지금 일하고 계신가요?",
      "보호가 끝난 뒤에 부모님이 계신 원래 집으로 돌아가시나요?"
    ]
  },
  "ask": "안녕하세요. 저는 서울에 사는 자립준비청년입니다. 2024년 9월에 만 16세로 시설 보호가 일찍 끝났고 원가정으로는 돌아가지 않았으며, 2026년 3월에 만 18세가 되었습니다. 아직 자립수당을 신청하지 않았는데, 이렇게 조기 보호종료 뒤 만 18세가 되어 받는 경우 60일 소급 기간을 보호종료일부터 세는지, 만 18세가 된 날부터 세는지 알려주실 수 있을까요? 확인해 주시면 감사하겠습니다.",
  "sources": {
    "ncrc-faq.txt": {
      "title": "아동권리보장원 자주하는질문",
      "url": "https://www.ncrc.or.kr/ncrc/cm/cntnts/cntntsView.do?mi=1062&cntntsId=1159",
      "accessed": "2026-10-23",
      "text": "만18세 이후 A년 B월에 보호종료된 아동이 자립수당을 받으려면 (A-2)년 (B+1)월 이전에 보호가 시작된 아동이어야 합니다."
    },
    "gov24-allowance.txt": {
      "title": "정부24 자립수당",
      "url": "https://www.gov.kr/portal/service/serviceInfo/508000000565",
      "accessed": "2026-10-23",
      "text": "만 18세 이후 만기 또는 연장 보호종료된 자로서 보호종료 5년 이내인 자(단, '18.8월 이후 보호종료된 자)"
    },
    "easylaw-allowance.txt": {
      "title": "찾기쉬운 생활법령정보 자립지원",
      "url": "https://easylaw.go.kr/CSP/CnpClsMain.laf?popMenu=ov&csmSeq=2619&ccfNo=2&cciNo=1&cnpClsNo=1",
      "accessed": "2026-10-23",
      "text": "자립준비청년 본인 명의 계좌로 매월 50만원의 자립수당이 지급되며, 지급일은 매월 20일(주말 및 공휴일의 경우 그 전일 지급)로 합니다\n단, 보호종료 예정 아동의 경우, 보호종료 전 30일 이내 신청 가능\n자립정착금은 각 지방자치단체에서 지원하며, 거주지에 따라 1,000만원부터 2,000만원 사이로 금액이 다를 수 있습니다\n자립정착금의 신청 방법은 아동복지시설 또는 가정위탁지원센터에 신청문의 후 자립정착금 사용계획서를 작성하여 가정위탁지원센터 또는 시설을 통해 관할 행정복지센터(시·군·구청)에 신청합니다"
    },
    "vegannews-60days.txt": {
      "title": "자립수당 보호종료 30일 전부터 신청 가능",
      "url": "https://www.vegannews.co.kr/news/article.html?no=390893",
      "accessed": "2026-10-23",
      "text": "보호종료일을 포함해 60일 이내에 신청하면 보호종료일이 속한 달부터 소급해 지급한다. 이 기간이 지난 뒤 신청하면 신청한 달부터 지급되므로"
    },
    "guri-settle.txt": {
      "title": "구리시 자립정착금 지원",
      "url": "https://www.guri.go.kr/youth/contents.do?key=5427",
      "accessed": "2026-10-23",
      "text": "만18세 이후 보호종료된 아동 15,000,000원 / 1인 / 1회 (퇴소한 해 : 10,000,000원 / 퇴소한 다음 해 : 5,000,000원)"
    },
    "munhwa-jeonse.txt": {
      "title": "LH, 청년1순위·자립준비청년 대상 전세임대주택 공급 확대",
      "url": "https://www.munhwa.com/article/11404686",
      "accessed": "2026-10-23",
      "text": "수도권 1억2000만 원, 광역시 9500만 원, 기타지역 8500만 원 한도로 전세보증금을 지원하며, 입주자는 100만 원의 입주자 부담 보증금과 지원금액(전세금에서 입주자 부담 보증금을 제외한 금액)에 대한 금리(연 1∼2%)를 월 임대료로 부담하게 된다.\n전세보증금과 월 임대료는 청년 1순위와 동일하나 월 임대료의 경우 22세 이하인 경우는 무이자, 전세임대주택 거주 5년 이내는 50% 감면 적용된다."
    },
    "seoul-welfare-allowance.txt": {
      "title": "자립준비청년 자립수당 신청 접수 안내",
      "url": "https://news.seoul.go.kr/welfare/?p=511982",
      "accessed": "2026-10-23",
      "text": "지원기간 : 보호종료일이 속한 달부터 최대 60회차 까지 가능 ('25.1월부터, 개월에서 회차로 개정)"
    },
    "seoul-mediahub.txt": {
      "title": "서울시 자립준비청년 지원 안내",
      "url": "https://mediahub.seoul.go.kr/archives/2010251",
      "accessed": "2026-10-23",
      "text": "‘자립정착금’은 1,500만원에서 2,000만원으로 각각 인상하고\n‘대중교통비’ 6만원도 지원 한다."
    },
    "gov24-chungnam-settle.txt": {
      "title": "자립준비청년 자립정착금 지원",
      "url": "https://www.gov.kr/portal/rcvfvrSvc/dtlEx/644000000843",
      "accessed": "2026-10-23",
      "text": "자립 초기에 필요한 자립정착금 1인 1,000만원 지원(2회 분할 지급)"
    }
  }
};
