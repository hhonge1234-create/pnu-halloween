// Supabase 연결 정보 (publishable 키는 브라우저에 공개돼도 되는 키예요)
window.APP_CONFIG = {
  SUPABASE_URL: "https://utpgztnnmwseenyvcdcn.supabase.co",
  SUPABASE_KEY: "sb_publishable_r66zr0ECUqWaUPV1VhTAig_S9_lLEDF",

  // 티켓 가격 (DB의 private.set_order_amount 함수와 같게 유지)
  ITEMS: {
    party: { name: "할로윈 파티 입장권", price: 3000 },
    goods: { name: "호박 굿즈 세트", price: 5000 },
    photo: { name: "유령 포토부스", price: 2000 },
  },
};
