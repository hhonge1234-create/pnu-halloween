# PNU 할로윈 나이트 2026

부산대학교 학생회 할로윈 이벤트 페이지예요. 그로스 데이터를 수집해요.

- `index.html`: 이벤트 페이지 (티켓 예매, 현장 결제)
- `dashboard.html`: 그로스 대시보드 (퍼널 이탈율, 버튼 클릭 수, 구매 전환율, 유입 경로, 기기). 대시보드 키가 필요해요.
- `js/track.js`: 데이터 수집 스크립트
- `js/config.js`: Supabase 주소, 공개 키, 티켓 가격

## 수집하는 데이터

| 퍼널 단계 | 기록 시점 |
|---|---|
| landing | 페이지 방문 |
| view_program | 프로그램 영역이 화면에 보임 |
| view_tickets | 티켓 영역이 화면에 보임 |
| select_ticket | 티켓 "선택하기" 클릭 |
| checkout_start | 수량 고르고 "다음" 클릭 |
| purchase | "예매 확정" 완료 |

- 버튼 클릭: `data-track="버튼ID"`가 붙은 요소는 자동으로 기록돼요. 새 버튼에도 이 속성만 붙이면 돼요.
- 유입 경로: 링크에 `?utm_source=instagram` 처럼 붙여서 공유하면 경로별 전환율을 볼 수 있어요.

## 가격 바꾸기

`js/config.js`의 `ITEMS`와 Supabase의 `private.set_order_amount` 함수를 같이 바꿔야 해요.

## 주문 확인

현장에서 받은 주문번호는 Supabase 대시보드의 Table Editor → `orders` 테이블에서 `order_code`로 찾으면 돼요.
