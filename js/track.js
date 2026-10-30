// 그로스 데이터 수집: 퍼널 단계, 버튼 클릭, 구매
(function () {
  const { SUPABASE_URL, SUPABASE_KEY } = window.APP_CONFIG;

  function store(kind) {
    try { return kind === "local" ? window.localStorage : window.sessionStorage; }
    catch (e) { return null; }
  }
  function getOrCreate(kind, key, make) {
    const s = store(kind);
    try {
      const v = s && s.getItem(key);
      if (v) return v;
      const nv = make();
      s && s.setItem(key, nv);
      return nv;
    } catch (e) { return make(); }
  }
  function uid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 12);
  }

  // 탭을 열 때마다 새 세션, 브라우저마다 고정 방문자 ID
  const sessionId = getOrCreate("session", "hw_session", uid);
  const visitorId = getOrCreate("local", "hw_visitor", uid);

  // UTM은 세션 첫 진입 때 값을 유지
  const params = new URLSearchParams(location.search);
  function utm(name) {
    const fromUrl = params.get(name);
    const s = store("session");
    try {
      if (fromUrl) { s && s.setItem("hw_" + name, fromUrl); return fromUrl.slice(0, 100); }
      return (s && s.getItem("hw_" + name)) || null;
    } catch (e) { return fromUrl; }
  }
  const context = {
    session_id: sessionId,
    visitor_id: visitorId,
    page: location.pathname.slice(0, 200),
    referrer: document.referrer ? document.referrer.slice(0, 500) : null,
    utm_source: utm("utm_source"),
    utm_medium: utm("utm_medium"),
    utm_campaign: utm("utm_campaign"),
    device: innerWidth < 768 ? "mobile" : innerWidth < 1024 ? "tablet" : "desktop",
  };

  function post(table, body) {
    return fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: "POST",
      keepalive: true,
      headers: {
        apikey: SUPABASE_KEY,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(body),
    }).then((r) => {
      if (!r.ok) throw new Error(`${table} insert failed: ${r.status}`);
      return r;
    });
  }

  // 같은 세션에서 같은 퍼널 단계는 한 번만 기록
  const sentSteps = new Set();
  function step(name) {
    if (sentSteps.has(name)) return;
    sentSteps.add(name);
    post("events", { ...context, event_type: "funnel_step", step: name })
      .catch((e) => console.warn(e));
  }

  function click(buttonId) {
    post("events", { ...context, event_type: "click", button_id: String(buttonId).slice(0, 64) })
      .catch((e) => console.warn(e));
  }

  function order(item, quantity, orderCode) {
    return post("orders", { session_id: sessionId, item, quantity, order_code: orderCode });
  }

  // data-track="버튼ID" 가 붙은 요소는 자동으로 클릭 기록
  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-track]");
    if (el) click(el.dataset.track);
  });

  // data-step="단계" 가 붙은 영역이 화면에 절반 이상 보이면 퍼널 단계 기록
  function observeSteps() {
    const els = document.querySelectorAll("[data-step]");
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => step(el.dataset.step));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          step(en.target.dataset.step);
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.4 });
    els.forEach((el) => io.observe(el));
  }

  window.Track = { step, click, order, sessionId };

  step("landing");
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", observeSteps);
  } else {
    observeSteps();
  }
})();
