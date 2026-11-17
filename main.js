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
  root.classList.add('js');

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
    document.querySelectorAll('[data-ph-zh]').forEach((el) => {
      el.placeholder = el.dataset[lang === 'ja' ? 'phJa' : 'phZh'];
    });
    try { localStorage.setItem('mark-lang', lang); } catch (e) {}
  }
  document.getElementById('langBtn').addEventListener('click', () => {
    setLang(root.dataset.lang === 'ja' ? 'zh' : 'ja');
  });
  let saved = null;
  try { saved = localStorage.getItem('mark-lang'); } catch (e) {}
  setLang(saved || 'zh');

  /* ---------- 手機版選單 ---------- */
  const menuBtn = document.getElementById('menuBtn');
  function setMenu(open) {
    document.body.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.textContent = open ? 'Close' : 'Menu';
    document.body.style.overflow = open ? 'hidden' : '';
  }
  menuBtn.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
  document.querySelectorAll('.nav a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('menu-open')) setMenu(false);
  });

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
    el.setAttribute('aria-label', s.type);
    el.title = s.type;
    el.innerHTML = ICONS[s.type];
    li.appendChild(el);
    social.appendChild(li);
  });

  /* ---------- reveal on scroll ---------- */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.02 });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('in'));
  }

  /* ---------- lightbox：同一個案子的照片可直接左右切換（‹ › 按鈕、鍵盤 ← →、手機左右滑） ---------- */
  const lb = document.getElementById('lightbox');
  const lbImg = lb.querySelector('img');
  const lbVideo = lb.querySelector('video');
  const lbCount = lb.querySelector('.lb-count');
  let lastFocus = null;
  let set = [];
  let idx = 0;

  function show(i) {
    idx = (i + set.length) % set.length;
    const cell = set[idx];
    lbImg.src = cell.dataset.full;
    lbImg.alt = cell.querySelector('img').alt;
    lbCount.textContent = (idx + 1) + ' / ' + set.length;
    // 先載入前後兩張，切換時不用等
    [idx + 1, idx - 1].forEach((j) => {
      const pre = new Image();
      pre.src = set[(j + set.length) % set.length].dataset.full;
    });
  }
  function openLb() {
    lastFocus = document.activeElement;
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
    lb.querySelector('.lb-close').focus();
  }
  function openGallery(cell) {
    set = [...cell.closest('.grid').querySelectorAll('.cell[data-full]')];
    lb.classList.add('is-gallery');
    show(set.indexOf(cell));
    openLb();
  }
  function openVideo(src) {
    set = [];
    lb.classList.remove('is-gallery');
    lbVideo.src = src;
    lbVideo.play().catch(() => {});
    openLb();
  }
  function closeLb() {
    lb.hidden = true;
    lb.classList.remove('is-gallery');
    set = [];
    lbImg.removeAttribute('src');
    lbVideo.pause(); lbVideo.removeAttribute('src'); lbVideo.load();
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }
  document.querySelectorAll('.cell[data-full]').forEach((b) => {
    b.addEventListener('click', () => openGallery(b));
  });
  document.querySelectorAll('[data-video]').forEach((b) => {
    b.addEventListener('click', () => openVideo(b.dataset.video));
  });
  lb.querySelector('.lb-prev').addEventListener('click', () => show(idx - 1));
  lb.querySelector('.lb-next').addEventListener('click', () => show(idx + 1));
  lb.querySelector('.lb-close').addEventListener('click', closeLb);
  lb.addEventListener('click', (e) => { if (e.target === lb) closeLb(); });   // 點黑色背景關閉
  document.addEventListener('keydown', (e) => {
    if (lb.hidden) return;
    if (e.key === 'Escape') closeLb();
    else if (set.length && e.key === 'ArrowRight') show(idx + 1);
    else if (set.length && e.key === 'ArrowLeft') show(idx - 1);
  });
  // 手機：左右滑動切換
  let touchX = null, touchY = null;
  lb.addEventListener('touchstart', (e) => {
    touchX = e.touches[0].clientX; touchY = e.touches[0].clientY;
  }, { passive: true });
  lb.addEventListener('touchend', (e) => {
    if (touchX === null || !set.length) return;
    const dx = e.changedTouches[0].clientX - touchX;
    const dy = e.changedTouches[0].clientY - touchY;
    touchX = null;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) show(dx < 0 ? idx + 1 : idx - 1);
  }, { passive: true });

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
    gmail.href = 'https://mail.google.com/mail/?view=cm&fs=1&to=' + to + '&su=' + su + '&body=' + bo;
  }

  function validate() {
    let ok = true;
    [f.name, f.email, f.message].forEach((el) => {
      const v = el.value.trim();
      const bad = !v || (el.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v));
      el.classList.toggle('invalid', bad);
      if (bad && ok) { el.focus(); ok = false; }
    });
    err.hidden = ok;
    return ok;
  }

  gmail.addEventListener('click', (e) => {
    if (!validate()) { e.preventDefault(); return; }
    compose();
  });
  form.addEventListener('submit', (e) => { e.preventDefault(); validate(); });
  form.addEventListener('input', (e) => {
    if (e.target.classList) e.target.classList.remove('invalid');
    compose();
  });
  compose();

  /* ---------- 複製 Email 地址 ---------- */
  document.querySelectorAll('.mail-text').forEach((el) => { el.textContent = CONTACT.email; });
  document.querySelectorAll('.copy-mail').forEach((btn) => {
    btn.addEventListener('click', () => {
      const done = () => {
        btn.classList.add('copied');
        setTimeout(() => btn.classList.remove('copied'), 2000);
      };
      const fallback = () => {
        const t = btn.parentElement.querySelector('.mail-text');
        const r = document.createRange(); r.selectNodeContents(t);
        const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r);
      };
      try {
        navigator.clipboard.writeText(CONTACT.email).then(done, fallback);
      } catch (e2) { fallback(); }
    });
  });

  document.getElementById('year').textContent = new Date().getFullYear();
})();
