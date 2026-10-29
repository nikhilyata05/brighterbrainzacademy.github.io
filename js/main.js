/* ==========================================================
   Brighter Brainz Academy — interactions
   Plain JavaScript, no dependencies.
   ========================================================== */
(function () {
  'use strict';

  var CFG = window.BB_CONFIG || {};
  var GALLERY = window.BB_GALLERY || [];
  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var IMG = 'assets/img/gallery/';

  function el(tag, cls, attrs) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (attrs) Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    return n;
  }

  // Reveal-hidden styles only apply once this class exists, so content is never stuck hidden.
  root.classList.add('js-ready');

  /* ---------- Footer year ---------- */
  var yr = $('#year'); if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- Opening reveal ---------- */
  var intro = $('#intro');
  if (intro) {
    try { sessionStorage.setItem('bb-intro', '1'); } catch (e) {}
    setTimeout(function () { if (intro.parentNode) intro.parentNode.removeChild(intro); }, 1900);
  }

  /* ---------- WhatsApp helper ---------- */
  function waLink(text) {
    return 'https://wa.me/' + (CFG.whatsappNumber || '917093351073') + (text ? '?text=' + encodeURIComponent(text) : '');
  }

  /* ==========================================================
     Build dynamic content first, so the reveal observer sees it
     ========================================================== */

  /* ---------- Gallery: chips + masonry + lightbox ---------- */
  var gGrid = $('#galleryGrid'), gChips = $('#galleryChips');
  var lbList = GALLERY.slice();     // list the lightbox is currently browsing

  function shotCaption(item) {
    var cap = el('span', 'zoom__cap');
    var tag = el('span', 'zoom__tag'); tag.textContent = item.category;
    var txt = el('span'); txt.textContent = item.caption;
    cap.appendChild(tag); cap.appendChild(txt);
    return cap;
  }
  function renderGallery(cat, animate) {
    if (!gGrid) return;
    gGrid.innerHTML = '';
    var items = GALLERY.filter(function (g) { return cat === 'All' || g.category === cat; });
    lbList = items;
    items.forEach(function (item, i) {
      var fig = el('figure', 'shot' + (animate ? ' is-filtering' : ''));
      if (animate) fig.style.animationDelay = (i * 40) + 'ms';
      var btn = el('button', 'zoom', { type: 'button', 'data-gallery': item.id, 'aria-label': 'Open photo: ' + item.caption });
      var img = el('img', '', { src: IMG + item.id + '-sm.jpg', alt: item.alt || item.caption, loading: 'lazy', decoding: 'async' });
      btn.appendChild(img); btn.appendChild(shotCaption(item));
      fig.appendChild(btn);
      gGrid.appendChild(fig);
    });
  }
  if (gGrid && gChips && GALLERY.length) {
    var cats = ['All'];
    GALLERY.forEach(function (g) { if (cats.indexOf(g.category) < 0) cats.push(g.category); });
    cats.forEach(function (c, i) {
      var n = c === 'All' ? GALLERY.length : GALLERY.filter(function (g) { return g.category === c; }).length;
      var b = el('button', 'chip' + (i === 0 ? ' is-active' : ''), { type: 'button', 'data-cat': c, 'aria-pressed': i === 0 ? 'true' : 'false' });
      b.appendChild(document.createTextNode(c));
      var s = el('small'); s.textContent = n; b.appendChild(s);
      gChips.appendChild(b);
    });
    gChips.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('.chip') : null;
      if (!b) return;
      $$('.chip', gChips).forEach(function (x) { var on = x === b; x.classList.toggle('is-active', on); x.setAttribute('aria-pressed', on ? 'true' : 'false'); });
      renderGallery(b.getAttribute('data-cat'), !reduceMotion.matches);
    });
    renderGallery('All', false);
  } else if (gChips) { gChips.hidden = true; }

  /* ---------- Instagram: real posts and reels, sliding automatically ---------- */
  var igTrack = $('#igTrack'), igRail = $('#igRail');
  var igUrl = CFG.instagramUrl || 'https://www.instagram.com/brighter_brainz/';
  // Accepts post / reel links, e.g. https://www.instagram.com/reel/AbC123/
  var igPosts = (Array.isArray(CFG.instagramPosts) ? CFG.instagramPosts : []).map(function (u) {
    var m = String(u).match(/instagram\.com\/(p|reel|reels|tv)\/([\w-]+)/i);
    return m ? { kind: m[1].toLowerCase() === 'reels' ? 'reel' : m[1].toLowerCase(), code: m[2] } : null;
  }).filter(Boolean);
  if (igTrack && igPosts.length) {
    [false, true].forEach(function (dup) {
      igPosts.forEach(function (p) {
        var card = el('div', 'reel reel--embed' + (dup ? ' reel--dup' : ''));
        if (dup) card.setAttribute('aria-hidden', 'true');
        var f = el('iframe', '', { src: 'https://www.instagram.com/' + p.kind + '/' + p.code + '/embed/', title: dup ? '' : 'Instagram post from Brighter Brainz Academy',
          loading: 'lazy', scrolling: 'no', allowtransparency: 'true' });
        if (dup) f.setAttribute('tabindex', '-1');
        card.appendChild(f); igTrack.appendChild(card);
      });
    });
    igTrack.style.setProperty('--rail-time', Math.max(40, igPosts.length * 12) + 's');
    if (igRail) igRail.setAttribute('role', 'region');
  } else if (igRail) { igRail.hidden = true; }
  // No post links yet: show Instagram's own live embed of the profile (its latest posts), so the section is never empty.
  var igEmpty = $('#igEmpty');
  if (igEmpty) {
    igEmpty.hidden = igPosts.length > 0;
    if (!igPosts.length) {
      var handle = (igUrl.match(/instagram\.com\/([\w.]+)/) || [])[1] || 'brighter_brainz';
      var pf = el('iframe', 'ig__profile', { src: 'https://www.instagram.com/' + handle + '/embed/', title: 'Latest posts from @' + handle + ' on Instagram', loading: 'lazy', scrolling: 'yes' });
      igEmpty.innerHTML = ''; igEmpty.appendChild(pf);
    }
  }

  /* ---------- YouTube: channel link + optional video previews ---------- */
  var channel = (CFG.youtubeChannelUrl || '').trim();
  if (channel) {
    var yl = $('#youtubeLink'), fy = $('#footerYoutube');
    if (yl) yl.href = channel;
    if (fy) fy.href = channel;
  }
  var ytGrid = $('#ytGrid');
  function ytId(v) {
    if (!v) return '';
    var raw = typeof v === 'string' ? v : (v.url || v.id || '');
    var m = String(raw).match(/(?:v=|youtu\.be\/|shorts\/|embed\/)([\w-]{11})/) || String(raw).match(/^([\w-]{11})$/);
    return m ? m[1] : '';
  }
  var vids = (Array.isArray(CFG.youtubeVideos) ? CFG.youtubeVideos : []).map(function (v) {
    return { id: ytId(v), title: (v && v.title) || '' };
  }).filter(function (v) { return v.id; });
  // Channel id given: embed the channel's uploads playlist (always the latest videos, no links to maintain).
  var chId = (CFG.youtubeChannelId || '').trim();
  if (ytGrid && !vids.length && /^UC[\w-]{22}$/.test(chId)) {
    ytGrid.closest('.yt').classList.add('has-videos');
    var wrap = el('div', 'vid__thumb vid__playlist');
    wrap.appendChild(el('iframe', '', { src: 'https://www.youtube-nocookie.com/embed/videoseries?list=UU' + chId.slice(2),
      title: 'Latest videos from Brighter Brainz Academy', loading: 'lazy', referrerpolicy: 'strict-origin-when-cross-origin', allow: 'accelerometer; encrypted-media; picture-in-picture', allowfullscreen: '' }));
    ytGrid.style.gridTemplateColumns = '1fr';
    ytGrid.appendChild(wrap);
  }
  if (ytGrid && vids.length) {
    ytGrid.closest('.yt').classList.add('has-videos');
    vids.forEach(function (v) {
      var title = v.title || 'Brighter Brainz video';
      var hasTitle = !!v.title;
      var item = el('article', 'vid reveal');
      var thumb = el('div', 'vid__thumb');
      var play = el('button', 'vid__play', { type: 'button', 'aria-label': 'Watch more on our YouTube channel' });
      play.innerHTML = '<img alt="" loading="lazy" src="https://i.ytimg.com/vi/' + v.id + '/hqdefault.jpg"><span class="vid__btn"><svg class="i" aria-hidden="true"><use href="#i-play"/></svg></span>';
      // The play button opens the channel (embedded playback can be blocked by YouTube's embed checks).
      play.addEventListener('click', function () { window.open(channel || 'https://www.youtube.com/@brighterbrainzz', '_blank', 'noopener'); });
      thumb.appendChild(play);
      item.appendChild(thumb);
      if (hasTitle) { var h = el('h4'); h.textContent = title; item.appendChild(h); }
      ytGrid.appendChild(item);
    });
    var more = el('a', 'btn btn--dark yt__more magnetic', { href: channel || 'https://www.youtube.com/@brighterbrainzz', target: '_blank', rel: 'noopener' });
    more.innerHTML = '<svg class="i" aria-hidden="true"><use href="#i-youtube"/></svg><span>Visit our YouTube channel</span><svg class="i btn__arrow" aria-hidden="true"><use href="#i-arrow"/></svg>';
    ytGrid.appendChild(more);
  }

  /* ---------- Lightbox ---------- */
  var lb = $('#lightbox'), lbImg = $('#lbImg'), lbCap = $('#lbCap'), lbCount = $('#lbCount');
  var lbClose = $('#lbClose'), lbPrev = $('#lbPrev'), lbNext = $('#lbNext');
  var current = 0, opener = null, hideT = 0;

  function show(i) {
    if (!lbList.length) return;
    current = (i + lbList.length) % lbList.length;
    var it = lbList[current];
    lbImg.src = IMG + it.id + '.jpg';
    lbImg.alt = it.alt || it.caption;
    lbCap.textContent = it.caption;
    lbCount.textContent = it.category + ' · ' + (current + 1) + ' of ' + lbList.length;
  }
  function openLb(list, id, from) {
    var idx = -1;
    list.forEach(function (g, i) { if (g.id === id) idx = i; });
    if (idx < 0) return;
    clearTimeout(hideT);
    lbList = list; opener = from; show(idx);
    lb.classList.toggle('is-single', list.length < 2);
    lb.hidden = false;
    void lb.offsetWidth;
    lb.classList.add('is-open');
    document.body.classList.add('is-locked');
    lbClose.focus();
  }
  function closeLb() {
    lb.classList.remove('is-open');
    document.body.classList.remove('is-locked');
    hideT = setTimeout(function () { lb.hidden = true; lbImg.removeAttribute('src'); }, 300);
    if (opener && document.contains(opener)) opener.focus();
  }
  // Photos in the gallery browse the current filter; photos elsewhere on the page browse everything.
  document.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('[data-gallery], [data-open]') : null;
    if (!b) return;
    if (b.hasAttribute('data-gallery')) openLb(lbList.slice(), b.getAttribute('data-gallery'), b);
    else openLb(GALLERY, b.getAttribute('data-open'), b);
  });
  lbClose.addEventListener('click', closeLb);
  lbPrev.addEventListener('click', function () { show(current - 1); });
  lbNext.addEventListener('click', function () { show(current + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') { e.preventDefault(); closeLb(); }
    else if (e.key === 'ArrowLeft') show(current - 1);
    else if (e.key === 'ArrowRight') show(current + 1);
    else if (e.key === 'Tab') {   // keep keyboard focus inside the viewer
      var f = lb.classList.contains('is-single') ? [lbClose] : [lbClose, lbPrev, lbNext];
      var idx = f.indexOf(document.activeElement);
      e.preventDefault();
      f[(idx + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
    }
  });
  var sx = 0;
  lb.addEventListener('touchstart', function (e) { sx = e.changedTouches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    var dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
  }, { passive: true });

  /* ==========================================================
     Navigation
     ========================================================== */
  var nav = $('#nav'), navLinks = $('#navLinks'), toggle = $('#navToggle');
  var lastY = window.scrollY, ticking = false;

  function menuOpen() { return navLinks.classList.contains('is-open'); }
  function setMenu(open) {
    navLinks.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.classList.toggle('is-locked', open);
    if (open) nav.classList.remove('is-hidden');
  }
  toggle.addEventListener('click', function () { setMenu(!menuOpen()); });
  $$('a', navLinks).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menuOpen()) { setMenu(false); toggle.focus(); }
  });
  window.matchMedia('(min-width: 1141px)').addEventListener('change', function (m) { if (m.matches) setMenu(false); });

  function onScrollNav() {
    var y = window.scrollY;
    nav.classList.toggle('is-solid', y > 40);
    if (!menuOpen()) {
      if (y > lastY + 6 && y > 400) nav.classList.add('is-hidden');
      else if (y < lastY - 6 || y < 400) nav.classList.remove('is-hidden');
    }
    lastY = y;
    var top = $('#toTop');
    if (top) top.classList.toggle('is-show', y > 700);
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScrollNav); }
  }, { passive: true });
  onScrollNav();

  // Keep the nav visible when a link or control inside it receives keyboard focus
  nav.addEventListener('focusin', function () { nav.classList.remove('is-hidden'); });

  // Active link highlighting (sections without their own nav link map to the nearest one)
  if ('IntersectionObserver' in window) {
    var NAV_MAP = { journey: 'about', difference: 'approach', beyond: 'approach', faq: 'contact' };
    var linkMap = {};
    $$('a[href^="#"]', navLinks).forEach(function (a) { linkMap[a.getAttribute('href').slice(1)] = a; });
    var secObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var id = en.target.id, key = NAV_MAP[id] || id;
        $$('a', navLinks).forEach(function (a) { a.classList.remove('is-active'); });
        if (linkMap[key] && id !== 'home') linkMap[key].classList.add('is-active');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main section[id]').forEach(function (s) { secObs.observe(s); });
  }

  /* ---------- Scroll reveals ---------- */
  var reveals = $$('.reveal');
  if ('IntersectionObserver' in window) {
    var rObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); rObs.unobserve(en.target); }
      });
    }, { threshold: 0, rootMargin: '0px 0px -6% 0px' });
    reveals.forEach(function (n) { rObs.observe(n); });
  } else {
    reveals.forEach(function (n) { n.classList.add('is-in'); });
  }

  /* ---------- Journey: growth counter + dot field ---------- */
  var field = $('#dotfield'), countNow = $('#countNow'), replayBtn = $('#replay');
  var TOTAL = 85, START = 2, dots = [], raf = 0;
  if (field && countNow) {
    var frag = document.createDocumentFragment();
    for (var d = 0; d < TOTAL; d++) { var dot = document.createElement('i'); dots.push(dot); frag.appendChild(dot); }
    field.appendChild(frag);

    var paint = function (n) {
      for (var k = 0; k < TOTAL; k++) {
        dots[k].classList.toggle('on', k < n);
        dots[k].classList.toggle('gold', k < START && k < n);
      }
      countNow.textContent = n >= TOTAL ? TOTAL + '+' : String(n);
    };
    var playGrowth = function () {
      cancelAnimationFrame(raf);
      if (reduceMotion.matches) { paint(TOTAL); return; }
      paint(START);
      var t0 = null, dur = 3200;
      var step = function (t) {
        if (t0 === null) t0 = t;
        var p = Math.min((t - t0) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        paint(Math.round(START + (TOTAL - START) * eased));
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };
    if (reduceMotion.matches || !('IntersectionObserver' in window)) { paint(TOTAL); }
    else {
      var jObs = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) { jObs.disconnect(); playGrowth(); }
      }, { threshold: 0.35 });
      jObs.observe($('.journey__stage'));
    }
    if (replayBtn) replayBtn.addEventListener('click', playGrowth);
  }

  /* ---------- Results: 100% counts up once in view ---------- */
  var pass = $('#passCount');
  if (pass && !reduceMotion.matches && 'IntersectionObserver' in window) {
    var target = parseInt(pass.getAttribute('data-count'), 10) || 100;
    var pObs = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      pObs.disconnect();
      var t0 = null, dur = 1800;
      var step = function (t) {
        if (t0 === null) t0 = t;
        var p = Math.min((t - t0) / dur, 1);
        pass.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      };
      pass.textContent = '0';
      requestAnimationFrame(step);
    }, { threshold: 0.5 });
    pObs.observe(pass);
  }

  /* ---------- Classes selector ---------- */
  var panel = $('#classPanel'), cLabel = $('#classLabel'), cText = $('#classText'), cCta = $('#classCta'), cName = $('#classCtaName');
  var pills = $$('.pill');
  function selectLevel(btn, animate) {
    var level = btn.getAttribute('data-level');
    pills.forEach(function (p) { var on = p === btn; p.classList.toggle('is-active', on); p.setAttribute('aria-pressed', on ? 'true' : 'false'); });
    var apply = function () {
      cLabel.textContent = level;
      cName.textContent = level;
      cText.textContent = 'Concept-first lessons on the board, regular practice and assessments, and time for individual doubts. Subjects, batch timings and availability are shared when you enquire about ' + level + '.';
      cCta.href = waLink("Hello Brighter Brainz Academy, I'd like to enquire about " + level + '.');
      panel.classList.remove('is-swap');
    };
    if (animate && !reduceMotion.matches) { panel.classList.add('is-swap'); setTimeout(apply, 220); } else { apply(); }
  }
  pills.forEach(function (p) { p.addEventListener('click', function () { selectLevel(p, true); }); });
  if (pills.length) selectLevel(pills[0], false);

  /* ---------- FAQ accordion ---------- */
  var qas = $$('.qa');
  qas.forEach(function (qa) {
    var q = $('.qa__q', qa), a = $('.qa__a', qa);
    a.inert = true;
    q.addEventListener('click', function () {
      var open = !qa.classList.contains('is-open');
      qas.forEach(function (o) {
        var isThis = o === qa, on = isThis && open;
        o.classList.toggle('is-open', on);
        $('.qa__q', o).setAttribute('aria-expanded', on ? 'true' : 'false');
        $('.qa__a', o).inert = !on;
      });
    });
  });

  /* ---------- Enquiry form → WhatsApp ---------- */
  var form = $('#enquiryForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.name.value.trim(), cls = form.class.value, msg = form.message.value.trim();
      var text = "Hello Brighter Brainz Academy, I'd like to enquire about admissions.";
      if (cls) text = "Hello Brighter Brainz Academy, I'd like to enquire about " + cls + '.';
      if (name) text += ' My name is ' + name + '.';
      if (msg) text += ' ' + msg;
      window.open(waLink(text), '_blank', 'noopener');
    });
  }

  /* ---------- Floating buttons ---------- */
  var fabWa = $('#fabWa'), toTop = $('#toTop'), footerTop = $('#footerTop'), contact = $('#contact');
  function goTop() { window.scrollTo({ top: 0 }); }
  if (toTop) toTop.addEventListener('click', goTop);
  if (footerTop) footerTop.addEventListener('click', goTop);
  var footerEl = $('.footer');
  if (footerEl && toTop && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (en) { toTop.classList.toggle('is-away', en[0].isIntersecting); }, { threshold: 0.2 }).observe(footerEl);
  }
  if (contact && fabWa && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (en) {
      var inView = en[0].isIntersecting;
      fabWa.classList.toggle('is-away', inView);
      if (toTop) toTop.classList.toggle('shift', inView);
    }, { threshold: 0.25 }).observe(contact);
  }

  /* ---------- Desktop-only effects (skipped for touch and reduced motion) ---------- */
  function enhancePointer() {
    if (!finePointer.matches || reduceMotion.matches) return;
    root.classList.add('has-cursor');

    // Soft spotlight that trails the mouse; switches tint over light sections
    var glow = $('#cursorGlow'), x = 0, y = 0, tx = 0, ty = 0, running = false;
    function loop() {
      x += (tx - x) * 0.14; y += (ty - y) * 0.14;
      glow.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
      if (Math.abs(tx - x) > 0.2 || Math.abs(ty - y) > 0.2) requestAnimationFrame(loop); else running = false;
    }
    function tint(target) {
      var s = target && target.closest ? target.closest('section, footer, header') : null;
      var light = !!s && (s.classList.contains('is-ivory') || s.classList.contains('is-sand'));
      glow.classList.toggle('on-light', light);
    }
    window.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      tx = e.clientX; ty = e.clientY;
      if (!glow.classList.contains('is-on')) { x = tx; y = ty; glow.classList.add('is-on'); }
      tint(e.target);
      if (!running) { running = true; requestAnimationFrame(loop); }
    }, { passive: true });
    document.addEventListener('mouseleave', function () { glow.classList.remove('is-on'); });
    document.addEventListener('mouseenter', function () { glow.classList.add('is-on'); });

    // Magnetic buttons
    $$('.magnetic').forEach(function (m) {
      m.addEventListener('mousemove', function (e) {
        var r = m.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) * 0.22, dy = (e.clientY - (r.top + r.height / 2)) * 0.3;
        m.style.setProperty('--mx', Math.max(-9, Math.min(9, dx)) + 'px');
        m.style.setProperty('--my', Math.max(-7, Math.min(7, dy)) + 'px');
      });
      m.addEventListener('mouseleave', function () { m.style.setProperty('--mx', '0px'); m.style.setProperty('--my', '0px'); });
    });

    // Card tilt
    $$('.tilt').forEach(function (t) {
      t.addEventListener('mousemove', function (e) {
        var r = t.getBoundingClientRect(), px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
        t.style.setProperty('--ry', (px * 7).toFixed(2) + 'deg');
        t.style.setProperty('--rx', (-py * 5).toFixed(2) + 'deg');
      });
      t.addEventListener('mouseleave', function () { t.style.setProperty('--rx', '0deg'); t.style.setProperty('--ry', '0deg'); });
    });
  }
  enhancePointer();

  /* ---------- Parallax (wide screens only, throttled with rAF) ---------- */
  var pxEls = $$('[data-parallax]'), pxTick = false;
  var wide = window.matchMedia('(min-width: 900px)');
  function parallax() {
    pxTick = false;
    var on = wide.matches && !reduceMotion.matches, vh = window.innerHeight;
    pxEls.forEach(function (p) {
      if (!on) { p.style.transform = ''; return; }
      var r = p.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      var offset = (r.top + r.height / 2 - vh / 2) * parseFloat(p.getAttribute('data-parallax'));
      p.style.transform = 'translate3d(0,' + (-offset).toFixed(1) + 'px,0)';
    });
  }
  window.addEventListener('scroll', function () { if (!pxTick) { pxTick = true; requestAnimationFrame(parallax); } }, { passive: true });
  window.addEventListener('resize', parallax);
  parallax();
})();
