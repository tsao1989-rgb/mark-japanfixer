/* =========================================================
   聯絡資訊設定 —— 只要改這裡，全站會自動更新
   ========================================================= */
const CONTACT = {
  // 您的聯絡 Email（顯示在聯絡區，表單也會寄到這裡）
  email: 'natsumeya.store@gmail.com',

  // 社群媒體：把 url 填上完整網址，圖示就會變成可點的連結；
  // 留空的會顯示成淡色、不可點。不需要的項目整行刪掉即可。
  // type 可用：instagram / facebook / line / linkedin
  social: [
    { type: 'instagram', url: 'https://www.instagram.com/hsiu.n.t/' },
  ],
};

const ICONS = {
  instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none"/></svg>',
  facebook: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.6 22v-8.2h2.7l.4-3.2h-3.1V8.6c0-.9.3-1.6 1.6-1.6h1.7V4.1C16.6 4.1 15.6 4 14.5 4c-2.4 0-4.1 1.500-4.100 4.200v2.400H7.600v3.200h2.800V22h3.200z"/></svg>',
  line: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3C6.500 3 2 6.600 2 11c0 3.900 3.500 7.200 8.300 7.900.800.200.700.500.600 1.300l-.100.900c0 .300-.200 1 .900.600s6-3.500 8.200-6C21.400 14.200 22 12.700 22 11c0-4.400-4.500-8-10-8z"/></svg>',
  linkedin: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.500 3.500a2 2 0 110 4 2 2 0 010-4zM3 9h3v12H3V9zm6 0h2.900v1.700c.500-.900 1.600-1.900 3.400-1.900 3.600 0 4.200 2.300 4.200 5.300V21h-3v-6.100c0-1.500 0-3.300-2-3.300s-2.300 1.500-2.300 3.200V21H9V9z"/></svg>',
};

/* ========================================================= */
(function () {
  const root = document.documentElement;

  /* ---------- language ---------- */
  const TITLES = {
    zh: 'MARK — Japan Fixer｜日本在地製片協調',
    ja: 'MARK — Japan Fixer｜海外メディア撮影コーディネーター',
  };
  function setLang(lang) {
    if (lang !== 'zh' && lang !== 'ja') lang = 'zh';
    root.dataset.lang = lang;
    root.lang = lang === 'ja' ? 'ja' : 'zh-Hant';
    document.title = TITLES[lang];
    const fabEl = document.getElementById('fab');
    if (fabEl) fabEl.setAttribute('aria-label', lang === 'ja' ? 'お問い合わせ' : '聯絡我');
    const L = lang === 'ja'
      ? { close: '閉じる', prev: '前の写真', next: '次の写真', dialog: '写真を拡大表示' }
      : { close: '關閉', prev: '上一張', next: '下一張', dialog: '放大檢視照片' };
    const lbEl = document.getElementById('lightbox');
    if (lbEl) {
      lbEl.setAttribute('aria-label', L.dialog);
      lbEl.querySelector('.lb-close').setAttribute('aria-label', L.close);
      lbEl.querySelector('.lb-prev').setAttribute('aria-label', L.prev);
      lbEl.querySelector('.lb-next').setAttribute('aria-label', L.next);
    }
    document.querySelectorAll('[data-ph-zh]').forEach((el) => {
      el.placeholder = el.dataset[lang === 'ja' ? 'phJa' : 'phZh'];
    });
    try { localStorage.setItem('mark-lang', lang); } catch (e) {}
  }
  document.querySelectorAll('[data-lang-toggle]').forEach((b) => b.addEventListener('click', () => {
    setLang(root.dataset.lang === 'ja' ? 'zh' : 'ja');
    compose();
  }));
  let saved = null;
  try { saved = localStorage.getItem('mark-lang'); } catch (e) {}
  setLang(saved || ((navigator.language || '').toLowerCase().indexOf('ja') === 0 ? 'ja' : 'zh'));

  /* 疊層打開時，讓背後的內容暫時無法被鍵盤或螢幕閱讀器操作 */
  function setInert(els, on) {
    els.forEach((el) => { if (el) { el.inert = on; if (on) el.setAttribute('aria-hidden', 'true'); else el.removeAttribute('aria-hidden'); } });
  }

  /* ---------- 手機版選單 ---------- */
  const menuBtn = document.getElementById('menuBtn');
  function setMenu(open) {
    document.body.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.textContent = open ? 'Close' : 'Menu';
    document.body.style.overflow = open ? 'hidden' : '';
    setInert([document.querySelector('main'), document.querySelector('footer'), document.getElementById('fab')], open);
    if (open) { const first = document.querySelector('#siteNav a'); if (first) first.focus({ preventScroll: true }); }
  }
  // 選單開著時把手機轉成橫向（或視窗拉寬）會失去 Close 按鈕，所以自動關掉
  const phone = window.matchMedia('(max-width: 640px)');
  const onPhoneChange = (e) => { if (!e.matches && document.body.classList.contains('menu-open')) setMenu(false); };
  if (phone.addEventListener) phone.addEventListener('change', onPhoneChange); else phone.addListener(onPhoneChange);
  menuBtn.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
  document.querySelectorAll('.nav a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('menu-open')) setMenu(false);
  });

  /* ---------- 頁首：往下捲時收起、往上捲時出現，隨時能回到選單 ---------- */
  const header = document.querySelector('.site-header');
  let lastY = window.scrollY;
  let ticking = false;
  function onScrollHeader() {
    const y = window.scrollY;
    header.classList.toggle('scrolled', y > 21);
    if (document.body.classList.contains('menu-open')) header.classList.remove('hide');
    else if (y > 144 && y > lastY + 6) header.classList.add('hide');
    else if (y < lastY - 6 || y <= 144) header.classList.remove('hide');
    lastY = y;
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(onScrollHeader); }
  }, { passive: true });
  onScrollHeader();

  /* ---------- 手機版聯絡按鈕：離開首頁大標後才出現，到了聯絡區就收起來 ---------- */
  const fab = document.getElementById('fab');
  if (fab && 'IntersectionObserver' in window) {
    let pastHero = false;
    let atContact = false;
    const update = () => fab.classList.toggle('show', pastHero && !atContact);
    new IntersectionObserver(([e]) => { pastHero = !e.isIntersecting; update(); })
      .observe(document.querySelector('.hero'));
    new IntersectionObserver(([e]) => { atContact = e.isIntersecting; update(); }, { rootMargin: '0px 0px -34% 0px' })
      .observe(document.getElementById('contact'));
  }

  /* ---------- contact info ---------- */
  const mailLink = document.getElementById('mailLink');
  mailLink.textContent = CONTACT.email;
  mailLink.href = 'mailto:' + CONTACT.email;

  const social = document.getElementById('social');
  CONTACT.social.forEach((s) => {
    if (!ICONS[s.type]) return;
    const li = document.createElement('li');
    const el = document.createElement(s.url ? 'a' : 'span');
    if (s.url) { el.href = s.url; el.target = '_blank'; el.rel = 'noopener'; }
    el.setAttribute('aria-label', s.type.charAt(0).toUpperCase() + s.type.slice(1));
    el.title = s.type;
    el.innerHTML = ICONS[s.type];
    li.appendChild(el);
    social.appendChild(li);
  });

  /* ---------- 作品照片：下載完成才淡入，不會一格一格跳出來 ---------- */
  root.classList.add('js');   // 放在這裡：前面任何一段出錯，內容也不會被隱藏
  document.querySelectorAll('.cell img').forEach((img) => {
    const done = () => img.classList.add('loaded');
    if (img.complete && img.naturalWidth) done();
    else { img.addEventListener('load', done, { once: true }); img.addEventListener('error', done, { once: true }); }
  });

  /* ---------- 手機作品照片列：下方顯示「1 / 6」 ---------- */
  document.querySelectorAll('.project .grid').forEach((g) => {
    const n = g.children.length;
    const c = document.createElement('p');
    c.className = 'grid-count';
    c.setAttribute('aria-hidden', 'true');
    c.textContent = '1 / ' + n;
    g.after(c);
    let raf = 0;
    g.addEventListener('scroll', () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const step = g.children[0].getBoundingClientRect().width + parseFloat(getComputedStyle(g).columnGap || 0);
        c.textContent = Math.min(n, Math.round(g.scrollLeft / step) + 1) + ' / ' + n;
      });
    }, { passive: true });
  });

  /* ---------- reveal on scroll ---------- */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px 8% 0px', threshold: 0 });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('in'));
  }

  /* ---------- lightbox：淡入淡出；同一案子的照片可左右切換（‹ ›、← →、手機跟手滑動） ---------- */
  const lb = document.getElementById('lightbox');
  const lbImg = lb.querySelector('img');
  const lbVideo = lb.querySelector('.lb-video');
  // 影片用 YouTube 內嵌播放；關閉時整個移除，聲音才會停
  function stopVideo() { lbVideo.textContent = ''; lb.classList.remove('is-video'); }
  const lbCount = lb.querySelector('.lb-count');
  let lastFocus = null;
  let set = [];
  let idx = 0;
  let token = 0;
  let closeTimer = null;

  function show(i, dir = 0) {
    if (!set.length) return;
    idx = (i + set.length) % set.length;
    const cell = set[idx];
    const thumb = cell.querySelector('img');
    const full = cell.dataset.full;
    const t = ++token;
    lbCount.textContent = (idx + 1) + ' / ' + set.length;
    // 1) 立刻用已載入的預覽圖顯示，從滑動的方向滑進來，不必等下載
    lbImg.classList.add('dragging', 'is-loading');
    lbImg.style.transform = dir ? 'translateX(' + (dir * 55) + 'px)' : '';
    lbImg.src = thumb.currentSrc || thumb.src;
    lbImg.alt = thumb.alt;
    void lbImg.offsetWidth;
    lbImg.classList.remove('dragging', 'is-loading');
    lbImg.style.transform = '';
    // 2) 高畫質原圖解碼完成後無縫換上
    const pre = new Image();
    const upgrade = () => { if (t === token) lbImg.src = full; };
    pre.onload = upgrade;
    pre.onerror = upgrade;
    pre.src = full;
    if (pre.complete && pre.naturalWidth) upgrade();
    // 3) 先載入前後兩張原圖，切換時更順
    [idx + 1, idx - 1].forEach((j) => {
      const p = new Image();
      p.src = set[(j + set.length) % set.length].dataset.full;
    });
  }
  const behind = () => [document.querySelector('header'), document.querySelector('main'), document.querySelector('footer'), document.getElementById('fab')];
  function openLb() {
    clearTimeout(closeTimer);
    lastFocus = document.activeElement;
    lb.classList.add('open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setInert(behind(), true);
    document.body.classList.add('lb-open');
    lb.querySelector('.lb-close').focus({ preventScroll: true });
    // 手機按「返回」時關掉放大檢視，而不是離開網站
    try { history.pushState({ lightbox: true }, ''); } catch (e) {}
  }
  function openGallery(cell) {
    set = [...cell.closest('.grid').querySelectorAll('.cell[data-full]')];
    stopVideo();   // 剛關掉影片又馬上開照片時，不留下影片
    lb.classList.add('is-gallery');
    lbImg.removeAttribute('src');
    show(set.indexOf(cell));
    openLb();
  }
  function openVideo(id, title) {
    set = [];
    lb.classList.remove('is-gallery');
    lbImg.removeAttribute('src');
    stopVideo();
    const f = document.createElement('iframe');
    f.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0&playsinline=1';
    f.title = title || 'Video';
    f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    f.allowFullscreen = true;
    f.referrerPolicy = 'strict-origin-when-cross-origin';
    lbVideo.appendChild(f);
    lb.classList.add('is-video');
    openLb();
  }
  function isOpen() { return lb.classList.contains('open'); }
  function closeLb(fromHistory) {
    if (!isOpen()) return;
    token++;
    lb.classList.remove('open');
    lb.setAttribute('aria-hidden', 'true');
    stopVideo();
    document.body.style.overflow = '';
    setInert(behind(), false);
    document.body.classList.remove('lb-open');
    if (fromHistory !== true && history.state && history.state.lightbox) { try { history.back(); } catch (e) {} }
    if (lastFocus) lastFocus.focus({ preventScroll: true });
    closeTimer = setTimeout(() => {   // 等淡出結束再清掉內容
      lb.classList.remove('is-gallery');
      set = [];
      lbImg.removeAttribute('src');
    }, 360);
  }
  document.querySelectorAll('.cell[data-full]').forEach((b) => {
    b.addEventListener('click', () => openGallery(b));
  });
  document.querySelectorAll('[data-youtube]').forEach((b) => {
    b.addEventListener('click', () => openVideo(b.dataset.youtube, b.closest('.project').querySelector('.p-title').innerText.trim()));
  });
  lb.querySelector('.lb-prev').addEventListener('click', () => show(idx - 1, -1));
  lb.querySelector('.lb-next').addEventListener('click', () => show(idx + 1, 1));
  lb.querySelector('.lb-close').addEventListener('click', () => closeLb());
  window.addEventListener('popstate', () => closeLb(true));
  lb.addEventListener('click', (e) => { if (e.target === lb) closeLb(); });   // 點黑色背景關閉
  document.addEventListener('keydown', (e) => {
    if (!isOpen()) return;
    if (e.key === 'Escape') closeLb();
    else if (set.length && e.key === 'ArrowRight') show(idx + 1, 1);
    else if (set.length && e.key === 'ArrowLeft') show(idx - 1, -1);
  });

  // 手機：照片跟著手指移動，放開後超過門檻就換下一張，否則彈回原位
  let startX = null, startY = null, dx = 0, lastDy = 0, horizontal = null;
  const resetDrag = () => { startX = null; lbImg.classList.remove('dragging'); lbImg.style.transform = ''; };
  lb.addEventListener('touchcancel', resetDrag);
  lb.addEventListener('touchstart', (e) => {
    if (!set.length || e.touches.length > 1) { resetDrag(); return; }
    startX = e.touches[0].clientX; startY = e.touches[0].clientY; dx = 0; lastDy = 0; horizontal = null;
  }, { passive: true });
  lb.addEventListener('touchmove', (e) => {
    if (startX === null || e.touches.length > 1) return;
    dx = e.touches[0].clientX - startX;
    const dy = e.touches[0].clientY - startY;
    lastDy = dy;
    if (horizontal === null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) horizontal = Math.abs(dx) > Math.abs(dy);
    if (horizontal) {
      lbImg.classList.add('dragging');
      lbImg.style.transform = 'translateX(' + dx + 'px)';
    }
  }, { passive: true });
  lb.addEventListener('touchend', () => {
    if (startX === null) return;
    startX = null;
    lbImg.classList.remove('dragging');
    if (horizontal && Math.abs(dx) > 55) show(dx < 0 ? idx + 1 : idx - 1, dx < 0 ? 1 : -1);
    else if (horizontal === false && lastDy > 89) closeLb();   // 往下滑關閉
    else lbImg.style.transform = '';
  });

  /* ---------- contact form → 開啟 Gmail 或郵件軟體的寄信畫面（內容自動帶入） ---------- */
  const form = document.getElementById('contactForm');
  const err = document.getElementById('formError');
  const gmail = document.getElementById('sendGmail');
  const f = form.elements;

  function compose() {
    const ja = root.dataset.lang === 'ja';
    const name = f.name.value.trim();
    const subject = (ja ? '【撮影のご相談】' : '【拍攝詢問】') + name;
    const body = [
      (ja ? 'お名前／会社名：' : '姓名／公司：') + name,
      'Email：' + f.email.value.trim(),
      '',
      f.message.value.trim(),
    ].join('\n');
    const to = encodeURIComponent(CONTACT.email);
    const su = encodeURIComponent(subject);
    const bo = encodeURIComponent(body);
    // 表單還沒填好時不放真正的連結，避免長按「在新分頁開啟」打開空白信件
    gmail.href = isComplete() ? 'https://mail.google.com/mail/?view=cm&fs=1&to=' + to + '&su=' + su + '&body=' + bo : '#';
  }

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  function isComplete() {
    return [f.name, f.email, f.message].every((el) => {
      const v = el.value.trim();
      return v && (el.type !== 'email' || EMAIL_RE.test(v));
    });
  }

  function validate() {
    let ok = true;
    [f.name, f.email, f.message].forEach((el) => {
      const v = el.value.trim();
      const bad = !v || (el.type === 'email' && !EMAIL_RE.test(v));
      el.classList.toggle('invalid', bad);
      el.setAttribute('aria-invalid', String(bad));
      if (bad && ok) { el.focus(); ok = false; }
    });
    err.hidden = ok;
    return ok;
  }

  gmail.addEventListener('click', (e) => {
    if (!validate()) { e.preventDefault(); return; }
    compose();
  });
  // 在輸入框按 Enter：填好了就直接打開 Gmail 寄信畫面
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (validate()) { compose(); gmail.click(); }
  });
  form.addEventListener('input', (e) => {
    if (e.target.classList) { e.target.classList.remove('invalid'); e.target.removeAttribute('aria-invalid'); }
    compose();
    if (!err.hidden && isComplete()) err.hidden = true;
  });
  compose();

  /* ---------- 複製 Email 地址 ---------- */
  document.querySelectorAll('.mail-text').forEach((el) => { el.textContent = CONTACT.email; });
  document.querySelectorAll('.copy-mail').forEach((btn) => {
    btn.addEventListener('click', () => {
      const done = () => {
        const st = document.getElementById('copyStatus');
        if (st) st.textContent = root.dataset.lang === 'ja' ? 'コピーしました' : '已複製';
        btn.classList.add('copied');
        setTimeout(() => btn.classList.remove('copied'), 2000);
      };
      const fallback = () => {
        const t = btn.parentElement.querySelector('.mail-text');
        const r = document.createRange(); r.selectNodeContents(t);
        const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r);
        try { if (document.execCommand('copy')) done(); } catch (e3) {}
      };
      try {
        navigator.clipboard.writeText(CONTACT.email).then(done, fallback);
      } catch (e2) { fallback(); }
    });
  });

  document.getElementById('year').textContent = new Date().getFullYear();
})();
