/* Dergi etkileşimleri: menü, sesli okuma, yazı boyutu, paylaş, video, arama */
(function () {
  'use strict';
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var store = {
    get: function (k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { window.localStorage.setItem(k, v); } catch (e) { /* yok say */ } }
  };
  var fmt = function (s) {
    s = Math.max(0, Math.round(s || 0));
    var m = Math.floor(s / 60), r = s % 60;
    return m + ':' + (r < 10 ? '0' : '') + r;
  };

  /* ---------- Mobil menü ---------- */
  var toggle = $('.menu-toggle'), nav = $('#main-nav');
  if (toggle && nav) {
    var openIcon = toggle.innerHTML;
    var closeIcon = '<svg class="icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';
    toggle.addEventListener('click', function () {
      var open = !nav.classList.contains('is-open');
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? toggle.dataset.labelClose : toggle.dataset.labelOpen);
      toggle.innerHTML = open ? closeIcon : openIcon;
    });
  }

  /* ---------- Yazı boyutu (A− / A+) ---------- */
  var body = $('.article-body');
  var sizeBtns = $$('[data-size]');
  if (body && sizeBtns.length) {
    var steps = [0.88, 1, 1.12, 1.26, 1.42];
    var idx = parseInt(store.get('textSize'), 10);
    if (isNaN(idx) || idx < 0 || idx >= steps.length) idx = 1;
    var applySize = function () {
      body.style.fontSize = 'calc(var(--article-size) * ' + steps[idx] + ')';
      sizeBtns.forEach(function (b) {
        var d = parseInt(b.dataset.size, 10);
        b.disabled = (d < 0 && idx === 0) || (d > 0 && idx === steps.length - 1);
      });
    };
    sizeBtns.forEach(function (b) {
      b.addEventListener('click', function () {
        idx = Math.min(steps.length - 1, Math.max(0, idx + parseInt(b.dataset.size, 10)));
        store.set('textSize', String(idx));
        applySize();
      });
    });
    applySize();
  }

  /* ---------- Paylaş ---------- */
  $$('[data-share]').forEach(function (box) {
    var btn = $('[data-share-toggle]', box), menu = $('.share-menu', box);
    var pageUrl = box.dataset.url || (location.origin + location.pathname);
    var title = box.dataset.title || document.title;
    var u = encodeURIComponent(pageUrl), t = encodeURIComponent(title);
    var links = {
      x: 'https://x.com/intent/post?text=' + t + '&url=' + u,
      facebook: 'https://www.facebook.com/sharer/sharer.php?u=' + u,
      whatsapp: 'https://wa.me/?text=' + encodeURIComponent(title + ' ' + pageUrl),
      linkedin: 'https://www.linkedin.com/sharing/share-offsite/?url=' + u,
      email: 'mailto:?subject=' + t + '&body=' + u
    };
    $$('[data-share-net]', box).forEach(function (a) { a.href = links[a.dataset.shareNet]; });
    var close = function () { menu.hidden = true; btn.setAttribute('aria-expanded', 'false'); };
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
      if (coarse && navigator.share) {
        navigator.share({ title: title, url: pageUrl }).catch(function () { /* vazgeçildi */ });
        return;
      }
      var open = menu.hidden;
      menu.hidden = !open;
      btn.setAttribute('aria-expanded', String(open));
    });
    var copyBtn = $('[data-share-copy]', box);
    if (copyBtn) {
      var label = $('span', copyBtn), original = label.textContent;
      copyBtn.addEventListener('click', function () {
        var done = function () {
          label.textContent = copyBtn.dataset.copied; copyBtn.classList.add('is-done');
          setTimeout(function () { label.textContent = original; copyBtn.classList.remove('is-done'); close(); }, 1600);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(pageUrl).then(done, function () { fallbackCopy(pageUrl); done(); });
        } else { fallbackCopy(pageUrl); done(); }
      });
    }
    document.addEventListener('click', function (e) { if (!box.contains(e.target)) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  });
  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'absolute'; ta.style.left = '-9999px';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch (e) { /* yok say */ }
    document.body.removeChild(ta);
  }

  /* ---------- Video ---------- */
  function playVideo(el) {
    var id = el.dataset.youtube, frame = $('.video-frame', el);
    if (!id || !frame || $('iframe', frame)) return;
    el._frameHTML = frame.innerHTML;
    var iframe = document.createElement('iframe');
    iframe.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) + '?autoplay=1&rel=0&modestbranding=1';
    iframe.title = el.dataset.title || 'Video';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.allowFullscreen = true;
    frame.innerHTML = '';
    frame.appendChild(iframe);
  }
  function resetVideo(el) {
    var frame = $('.video-frame', el);
    if (frame && el._frameHTML) { frame.innerHTML = el._frameHTML; el._frameHTML = null; }
  }
  $$('[data-video-stage]').forEach(function (stage) {
    var featured = $('.video-featured', stage);
    var thumbs = $$('.video-thumb', stage);
    thumbs.forEach(function (th) {
      var b = $('.video-frame', th);
      b.disabled = false;
      th.addEventListener('click', function () {
        resetVideo(featured);
        var fF = $('.video-frame', featured), fT = $('.video-frame', th);
        var fC = $('.video-caption', featured), tC = $('.video-caption', th);
        var tmp = fF.innerHTML; fF.innerHTML = fT.innerHTML; fT.innerHTML = tmp;
        tmp = fC.innerHTML; fC.innerHTML = tC.innerHTML; tC.innerHTML = tmp;
        tmp = fF.getAttribute('aria-label'); fF.setAttribute('aria-label', fT.getAttribute('aria-label')); fT.setAttribute('aria-label', tmp);
        ['youtube', 'title', 'duration', 'kind', 'poster'].forEach(function (k) {
          var a = featured.dataset[k], c = th.dataset[k];
          if (c === undefined) delete featured.dataset[k]; else featured.dataset[k] = c;
          if (a === undefined) delete th.dataset[k]; else th.dataset[k] = a;
        });
        fF.disabled = !featured.dataset.youtube;
        fT.disabled = false;
        featured.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    });
    var fb = $('.video-frame', featured);
    fb.addEventListener('click', function () { playVideo(featured); });
  });
  $$('.video').forEach(function (el) {
    if (el.closest('[data-video-stage]')) return;
    var b = $('.video-frame', el);
    if (b && el.dataset.youtube) b.addEventListener('click', function () { playVideo(el); });
  });

  /* ---------- Sesli okuma ---------- */
  $$('[data-player]').forEach(function (player) {
    var btn = $('[data-player-toggle]', player), bar = $('[data-player-bar]', player), fill = $('[data-player-fill]', player);
    var cur = $('[data-player-cur]', player), dur = $('[data-player-dur]', player), speedBtn = $('[data-player-speed]', player);
    var speeds = [1, 1.25, 1.5, 2], si = 0;
    var setProgress = function (frac, elapsed, total) {
      frac = Math.max(0, Math.min(1, frac || 0));
      fill.style.width = (frac * 100) + '%';
      bar.setAttribute('aria-valuenow', String(Math.round(frac * 100)));
      cur.textContent = fmt(elapsed);
      if (total) dur.textContent = fmt(total);
    };
    var setPlaying = function (on) {
      player.classList.toggle('is-playing', on);
      if (on) player.classList.add('is-started');
      btn.setAttribute('aria-label', on ? player.dataset.labelPause : player.dataset.labelPlay);
    };
    var engine;

    if (player.dataset.src) {
      /* Yüklenmiş ses dosyası */
      var audio = new Audio();
      audio.preload = 'metadata';
      audio.src = player.dataset.src;
      engine = {
        toggle: function () { if (audio.paused) audio.play().catch(function () {}); else audio.pause(); },
        rate: function (r) { audio.playbackRate = r; },
        seek: function (frac) { if (audio.duration) audio.currentTime = frac * audio.duration; }
      };
      audio.addEventListener('play', function () { setPlaying(true); });
      audio.addEventListener('pause', function () { setPlaying(false); });
      audio.addEventListener('ended', function () { setPlaying(false); });
      audio.addEventListener('loadedmetadata', function () { setProgress(0, 0, audio.duration); });
      audio.addEventListener('timeupdate', function () { setProgress(audio.currentTime / (audio.duration || 1), audio.currentTime, audio.duration); });
    } else if ('speechSynthesis' in window && 'SpeechSynthesisUtterance' in window) {
      /* Tarayıcının kendi sesiyle okuma */
      var synth = window.speechSynthesis, lang = player.dataset.speechLang || document.documentElement.lang;
      var chunks = [], total = 0;
      var addText = function (el, text) {
        text = text.replace(/\s+/g, ' ').trim();
        if (!text) return;
        var parts = text.match(/[^.!?…]+[.!?…]+["'”’)]*\s*|[^.!?…]+$/g) || [text];
        var buf = '';
        parts.forEach(function (p) {
          if ((buf + p).length > 220 && buf) { chunks.push({ el: el, text: buf.trim(), start: total }); total += buf.length; buf = ''; }
          buf += p;
        });
        if (buf.trim()) { chunks.push({ el: el, text: buf.trim(), start: total }); total += buf.length; }
      };
      var collect = function () {
        $$('[data-speak]').forEach(function (el) { addText(el, el.textContent); });
        var root = $('[data-speak-body]');
        if (root) {
          $$('p, h2, h3, blockquote, li', root).forEach(function (el) {
            if (el.closest('figure') || (el.tagName === 'P' && el.parentElement.closest('blockquote, li'))) return;
            var clone = el.cloneNode(true);
            $$('sup', clone).forEach(function (s) { s.remove(); });
            addText(el, clone.textContent);
          });
        }
      };
      collect();
      var CPS = 14.5; // saniyede okunan karakter (yaklaşık)
      var estTotal = function () { return total / (CPS * speeds[si]); };
      var index = 0, charInChunk = 0, playing = false, token = 0, reading = null;
      var pickVoice = function () {
        var vs = synth.getVoices(), base = lang.slice(0, 2).toLowerCase();
        var exact = vs.filter(function (v) { return v.lang && v.lang.replace('_', '-').toLowerCase() === lang.toLowerCase(); });
        var near = vs.filter(function (v) { return v.lang && v.lang.slice(0, 2).toLowerCase() === base; });
        var list = exact.length ? exact : near;
        return list.filter(function (v) { return v.localService; })[0] || list[0] || null;
      };
      var mark = function (el) {
        if (reading === el) return;
        if (reading) reading.classList.remove('is-reading');
        reading = el; if (el) el.classList.add('is-reading');
      };
      var update = function () {
        var done = index < chunks.length ? chunks[index].start + charInChunk : total;
        setProgress(done / (total || 1), done / (CPS * speeds[si]), estTotal());
      };
      var speak = function () {
        var my = ++token;
        synth.cancel();
        if (index >= chunks.length) { stop(true); return; }
        var ch = chunks[index];
        var u = new SpeechSynthesisUtterance(ch.text);
        u.lang = lang; u.rate = speeds[si];
        var v = pickVoice(); if (v) u.voice = v;
        u.onboundary = function (e) { if (my === token) { charInChunk = e.charIndex || 0; update(); } };
        u.onend = function () { if (my !== token || !playing) return; index++; charInChunk = 0; update(); speak(); };
        u.onerror = function (e) { if (my !== token) return; if (e.error !== 'interrupted' && e.error !== 'canceled') { playing = false; setPlaying(false); } };
        mark(ch.el);
        charInChunk = 0; update();
        synth.speak(u);
      };
      var stop = function (finished) {
        token++; playing = false; synth.cancel(); setPlaying(false); mark(null);
        if (finished) { index = 0; charInChunk = 0; setProgress(1, estTotal(), estTotal()); }
      };
      engine = {
        toggle: function () {
          if (!chunks.length) return;
          if (playing) { stop(false); }
          else { playing = true; setPlaying(true); speak(); }
        },
        rate: function () { update(); if (playing) speak(); },
        seek: function (frac) {
          var target = frac * total, i = 0;
          while (i < chunks.length - 1 && chunks[i + 1].start <= target) i++;
          index = i; charInChunk = 0; update();
          if (playing) speak();
        }
      };
      if (synth.onvoiceschanged !== undefined) synth.onvoiceschanged = function () { /* sesler yüklendi */ };
      window.addEventListener('pagehide', function () { synth.cancel(); });
      setProgress(0, 0, estTotal());
    } else {
      player.classList.add('is-unavailable');
      var lbl = $('.player-label span', player);
      if (lbl) lbl.parentElement.setAttribute('data-msg', player.dataset.unavailable);
      if (lbl) lbl.textContent = player.dataset.unavailable;
      btn.disabled = true; speedBtn.disabled = true;
      return;
    }

    btn.addEventListener('click', function () { engine.toggle(); });
    speedBtn.addEventListener('click', function () {
      si = (si + 1) % speeds.length;
      speedBtn.textContent = String(speeds[si]).replace('.', document.documentElement.lang === 'tr' ? ',' : '.') + '×';
      engine.rate(speeds[si]);
    });
    var seekAt = function (clientX) {
      var r = bar.getBoundingClientRect();
      engine.seek(Math.max(0, Math.min(1, (clientX - r.left) / r.width)));
    };
    var dragging = false;
    bar.addEventListener('pointerdown', function (e) { dragging = true; bar.setPointerCapture && bar.setPointerCapture(e.pointerId); seekAt(e.clientX); });
    bar.addEventListener('pointermove', function (e) { if (dragging && player.dataset.src) seekAt(e.clientX); });
    bar.addEventListener('pointerup', function (e) { if (dragging && !player.dataset.src) seekAt(e.clientX); dragging = false; });
    bar.addEventListener('keydown', function (e) {
      var now = parseFloat(bar.getAttribute('aria-valuenow')) / 100;
      if (e.key === 'ArrowRight') { engine.seek(Math.min(1, now + 0.05)); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { engine.seek(Math.max(0, now - 0.05)); e.preventDefault(); }
    });
  });

  /* ---------- Arama ---------- */
  var form = $('[data-search]');
  if (form) {
    var input = $('input', form), out = $('[data-results]');
    var data = null;
    var norm = function (s) {
      return String(s || '').toLocaleLowerCase('tr').replace(/ı/g, 'i').normalize('NFD').replace(/[̀-ͯ]/g, '');
    };
    var esc = function (s) { return String(s || '').replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
    var run = function () {
      var q = norm(input.value).trim();
      if (!q) { out.innerHTML = ''; return; }
      var terms = q.split(/\s+/);
      var res = data.filter(function (d) {
        var hay = norm([d.t, d.s, d.a, d.sec, d.x].join(' '));
        return terms.every(function (term) { return hay.indexOf(term) !== -1; });
      });
      out.innerHTML = res.length
        ? res.map(function (d) { return '<li>' + (d.sec ? '<span class="kicker">' + esc(d.sec) + '</span>' : '') + '<h2><a href="' + esc(d.u) + '">' + esc(d.t) + '</a></h2><p>' + esc(d.s) + '</p></li>'; }).join('')
        : '<li><p>' + esc(form.dataset.empty) + '</p></li>';
    };
    var load = function (cb) {
      if (data) return cb();
      fetch(form.dataset.index).then(function (r) { return r.json(); }).then(function (j) { data = j; cb(); }).catch(function () { data = []; cb(); });
    };
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      load(run);
      try { history.replaceState(null, '', '?q=' + encodeURIComponent(input.value)); } catch (err) { /* yok say */ }
    });
    input.addEventListener('input', function () { load(run); });
    var initial = new URLSearchParams(location.search).get('q');
    if (initial) { input.value = initial; load(run); }
    input.focus();
  }
})();
