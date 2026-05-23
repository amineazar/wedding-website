'use client';
import { useEffect, useState } from 'react';

export default function WeddingSite() {
  const [showRegistry, setShowRegistry] = useState(true);

  useEffect(() => {
    if (window.location.pathname === '/rsvp') setShowRegistry(false);
    // Disable browser scroll restoration so refresh always returns to the top
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    // ─── GSAP (loaded dynamically — avoids SSR issues) ───
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      (async () => {
        const { gsap } = await import('gsap');
        const { ScrollTrigger } = await import('gsap/ScrollTrigger');
        gsap.registerPlugin(ScrollTrigger);

        const isMobile = window.innerWidth < 900;
        const mobileFactor = isMobile ? 0.45 : 1;

        // — Timeline venue photo —
        const tlBg = document.getElementById('timelineParallaxBg');
        if (tlBg) {
          gsap.fromTo(tlBg,
            { y: '-10%' },
            {
              y: '10%', ease: 'none',
              scrollTrigger: {
                trigger: '#timeline',
                start: 'top bottom',
                end: 'bottom top',
                scrub: 0.6
              }
            }
          );
        }

        // — PARALLAX layer 1: bg carpet — very slow, weighty drift —
        const carpetBg = document.getElementById('carpetBg');
        if (carpetBg) {
          gsap.fromTo(carpetBg,
            { y: isMobile ? 60 : 180 },
            {
              y: isMobile ? -60 : -180, ease: 'none',
              scrollTrigger: {
                trigger: '#timeline',
                start: 'top bottom',
                end: 'bottom top',
                scrub: 0.6
              }
            }
          );
        }

        // — PARALLAX layer 2: corners — much faster, each its own speed —
        var cornerCfg = {
          carpetCornerTL: { from: 0, to: isMobile ? -480 : -1200, scrub: 0.25 },
          carpetCornerTR: { from: 0, to: isMobile ? -540 : -1400, scrub: 0.18 },
          carpetCornerBR: { from: 0, to: isMobile ? -560 : -1300, scrub: 0.28 },
          carpetCornerBL: { from: 0, to: isMobile ? -560 : -1300, scrub: 0.28 }
        };
        Object.keys(cornerCfg).forEach(function (id) {
          var el = document.getElementById(id);
          if (!el) return;
          var c = cornerCfg[id];
          gsap.fromTo(el,
            { y: c.from },
            {
              y: c.to, ease: 'none',
              scrollTrigger: {
                trigger: '#timeline',
                start: 'top bottom',
                end: 'bottom top',
                scrub: c.scrub
              }
            }
          );
        });

        // — Carpet border strips peel apart —
        const carpetTop = document.getElementById('carpetBorderTop');
        const carpetBot = document.getElementById('carpetBorderBottom');
        if (carpetTop) {
          gsap.fromTo(carpetTop,
            { y: 0 },
            {
              y: -28 * mobileFactor, ease: 'none',
              scrollTrigger: { trigger: '#timeline', start: 'top bottom', end: 'bottom top', scrub: 1.5 }
            }
          );
        }
        if (carpetBot) {
          gsap.fromTo(carpetBot,
            { y: 0 },
            {
              y: 28 * mobileFactor, ease: 'none',
              scrollTrigger: { trigger: '#timeline', start: 'top bottom', end: 'bottom top', scrub: 1.5 }
            }
          );
        }

        // — Dress code background image —
        const dcBg = document.getElementById('dresscodeBg');
        if (dcBg) {
          gsap.fromTo(dcBg,
            { y: '-22%' },
            {
              y: '22%', ease: 'none',
              scrollTrigger: {
                trigger: '#dresscode',
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1.2
              }
            }
          );
        }

        

        // ═══ TRAVEL SECTION PARALLAX ═══
        const travelBg = document.getElementById('travelBg');
        if (travelBg) {
          const isMob = window.innerWidth < 768;
          const intensity = isMob ? 12 : 22;
          gsap.fromTo(travelBg,
            { y: '-' + intensity + '%' },
            {
              y: intensity + '%',
              ease: 'none',
              scrollTrigger: {
                trigger: '#travel',
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1.2
              }
            }
          );
        }

      })();
    }

    // ─── Vanilla JS ───
    const prog = document.getElementById('progress');
    const siteBg = document.getElementById('site-bg');
    const arches = document.querySelectorAll('.arch');
    const practicalSection = document.getElementById('practical');
    const colonnade = document.getElementById('colonnade');
    const practicalProgress = document.getElementById('practicalProgress');
    const travelSection = document.getElementById('travel');
    const travelCards = document.querySelectorAll('.travel-card');
    const travelProgress = document.getElementById('travelProgress');
    let _rawTP = 0, _smoothTP = 0, _travelLerping = false;

    function onScroll() {
      // ── Batch ALL layout reads first (prevents forced reflow) ────────────────
      const y = window.scrollY;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const maxH = document.body.scrollHeight - vh;

      const _practicalEl = document.getElementById('practical');
      const _pTop = _practicalEl ? _practicalEl.getBoundingClientRect().top : vh;

      const rsvpEl = document.getElementById('rsvp');
      const rsvpRect = rsvpEl ? rsvpEl.getBoundingClientRect() : null;

      let practRect = null, practOffH = 0, trackWidth = 0, globalStart = 0, globalEnd = 0;
      if (practicalSection && colonnade && vw > 900) {
        practRect = practicalSection.getBoundingClientRect();
        practOffH = practicalSection.offsetHeight;
        trackWidth = colonnade.scrollWidth;
        const cdEl = document.getElementById('countdown');
        globalStart = cdEl ? cdEl.offsetTop : practicalSection.offsetTop;
        globalEnd = practicalSection.offsetTop + practOffH - vh;
      }

      // Read arch rects only when practical section is pinned (avoids unnecessary layout reads)
      const archRects = (practRect && practRect.top <= 0 && practRect.bottom >= vh)
        ? Array.from(arches).map(a => a.getBoundingClientRect())
        : [];

      let earlyStart = 0, travelEnd = 0;
      if (travelSection && vw > 900) {
        // Start 60% of viewport before the section sticks: the card enters the
        // viewport mid-animation and is fully centred by the time the pin locks.
        earlyStart = travelSection.offsetTop - vh * 0.60;
        travelEnd = travelSection.offsetTop + travelSection.offsetHeight - vh;
      }

      // ── Now do all writes ────────────────────────────────────────────────────
      prog.style.width = (y / maxH * 100) + '%';
      const _sbuf = vh * 0.18;
      siteBg.style.transform = 'translateY(' + Math.max(-_sbuf, Math.min(_sbuf, y * 0.3)) + 'px)';
      siteBg.style.opacity = Math.max(0, Math.min(1, _pTop / vh));

      if (rsvpEl && rsvpRect) {
        const rsvpRatio = 1 - (rsvpRect.top + rsvpRect.height / 2) / vh;
        const rsvpPos = 40 + rsvpRatio * 18;
        rsvpEl.style.backgroundPosition = 'center ' + Math.max(20, Math.min(60, rsvpPos)) + '%';
      }

      // ═══ HORIZONTAL SCROLL — Worth the Drive ═══
      if (practicalSection && colonnade && vw > 900 && practRect) {
        const travel = trackWidth - vw;
        const lockedProgress = Math.max(0, Math.min(1, (y - globalStart) / Math.max(1, globalEnd - globalStart)));

        if (practRect.top <= 0 && practRect.bottom >= vh) {
          // Pinned — drive horizontal colonnade
          colonnade.style.transform = 'translateX(' + (-lockedProgress * travel) + 'px)';
          practicalProgress.style.width = (lockedProgress * 100) + '%';
        } else if (practRect.top > 0) {
          // Not yet pinned — pre-position colonnade silently so there is no jump when it pins
          colonnade.style.transform = 'translateX(' + (-lockedProgress * travel) + 'px)';
          practicalProgress.style.width = '0%';
        } else {
          colonnade.style.transform = 'translateX(' + (-travel) + 'px)';
          practicalProgress.style.width = '100%';
        }
        // Arch scale: uses pre-read rects — no layout read inside the loop
        arches.forEach((arch, idx) => {
          const ar = archRects[idx] || arch.getBoundingClientRect();
          const ac = ar.left + ar.width / 2;
          const xRatio = ac / vw; // 0=left edge, 1=right edge
          let scale, opacity;
          const GROW_START = 0.92;
          if (xRatio <= 0.5) {
            scale = 1.0; opacity = 1;
          } else if (xRatio <= GROW_START) {
            const d = (xRatio - 0.5) / (GROW_START - 0.5);
            const eased = d * d * d;
            scale = 1.0 - eased * 0.72;
            opacity = 1 - eased * 0.65;
          } else {
            scale = 0.28; opacity = 0.08;
          }
          arch.style.transform = 'scale(' + scale + ')';
          arch.style.opacity = Math.max(0.15, opacity);
          const TEXT_FADE_START = 0.78;
          let textOpacity;
          if (xRatio <= 0.5) {
            textOpacity = 1;
          } else if (xRatio <= TEXT_FADE_START) {
            textOpacity = 1 - ((xRatio - 0.5) / (TEXT_FADE_START - 0.5));
          } else {
            textOpacity = 0;
          }
          const titleEl = arch.querySelector('.arch-title');
          const textEl = arch.querySelector('.arch-text');
          if (titleEl) titleEl.style.opacity = textOpacity;
          if (textEl) textEl.style.opacity = textOpacity;
        });
      }

      // ═══ SPLIT-LANE — Travel section ═══
      if (travelSection && vw > 900) {
        _rawTP = Math.max(0, Math.min(1, (y - earlyStart) / Math.max(1, travelEnd - earlyStart)));
        travelProgress.style.width = (_rawTP * 100) + '%';
        if (!_travelLerping) {
          // Snap on first entry so there's no frozen peek frame before the lerp catches up
          _smoothTP = _rawTP;
          _travelLerping = true;
          _lerpTravel();
        }
      }
    }

    // ── Travel card lerp helpers ──
    function _applyTravelCards(totalProgress) {
      const vw = window.innerWidth;
      const n = travelCards.length;           // 4 cards
      const win = 1 / n;                        // each card owns 1/4 of scroll range

      // Batch all offsetWidth reads BEFORE any writes to avoid forced reflow
      const cardWidths = Array.from(travelCards).map(card => card.offsetWidth || 560);

      travelCards.forEach((card, i) => {
        const cardW = cardWidths[i];
        const centerX = -cardW / 2;             // left:50% + translateX(-cardW/2) = centered
        const fromLeft = (i % 2 === 0);           // even cards enter from left, odd from right
        const offX = fromLeft ? centerX - vw * 0.6 : centerX + vw * 0.6; // off-screen start
        const exitX = fromLeft ? centerX + vw * 0.18 : centerX - vw * 0.18; // slight drift on exit

        const rawP = (totalProgress - i * win) / win; // 0→1 within this card's window

        // ── before this card's turn — faint ghost hint off-screen ──────────────
        if (rawP <= 0) {
          card.style.transform = 'translateY(-50%) translateX(' + offX + 'px) scale(0.45)';
          card.style.opacity = i === 0 ? '0.10' : '0'; // card 0: subtle hint visible as section enters
          card.style.zIndex = 10 + i;
          card.classList.remove('active');
          return;
        }

        // ── after this card's turn (last card stays visible) ────────────────────
        if (rawP >= 1) {
          if (i === n - 1) {
            card.style.transform = 'translateY(-50%) translateX(' + centerX + 'px) scale(1)';
            card.style.opacity = '1';
            card.style.zIndex = 15;
            card.classList.add('active');
          } else {
            card.style.transform = 'translateY(-50%) translateX(' + exitX + 'px) scale(0.92)';
            card.style.opacity = '0';
            card.style.zIndex = 10 + i;
            card.classList.remove('active');
          }
          return;
        }

        // ── three phases within this card's window ───────────────────────────────
        const ENTRY = 0.45;  // 0→0.45  slide in from side
        const HOLD = 0.90;   // 0.45→0.90  fully visible hold (longer reading time)
                              // 0.90→1.0  fade out (last card skips)

        let tx, scale, opacity;

        if (rawP <= ENTRY) {
          const t = rawP / ENTRY;                    // 0→1 over entry phase
          tx = offX + (centerX - offX) * t;          // linear position — uniform slide, no "jumped to center"
          scale = 0.45 + t * 0.55;
          opacity = t * t * (3 - 2 * t);             // smoothstep fade-in
        } else if (rawP <= HOLD) {
          tx = centerX;
          scale = 1;
          opacity = 1;
        } else {
          const t = (rawP - HOLD) / (1 - HOLD);
          const e = t * t;                     // ease-in
          if (i === n - 1) {
            tx = centerX; scale = 1; opacity = 1;
          } else {
            tx = centerX + (exitX - centerX) * e;
            scale = 1 - e * 0.08;
            opacity = 1 - e;
          }
        }

        card.style.transform = 'translateY(-50%) translateX(' + tx + 'px) scale(' + scale + ')';
        card.style.opacity = Math.max(0, opacity);
        card.style.zIndex = 10 + i;
        card.classList.toggle('active', rawP > 0.1 && opacity > 0.3);
      });
    }
    function _lerpTravel() {
      _smoothTP += (_rawTP - _smoothTP) * 0.09;
      _applyTravelCards(_smoothTP);
      if (Math.abs(_rawTP - _smoothTP) > 0.0005) {
        requestAnimationFrame(_lerpTravel);
      } else {
        _smoothTP = _rawTP;
        _applyTravelCards(_smoothTP);
        _travelLerping = false;
      }
    }
    // ── Dynamically size travel section so it ends just after last card lands ──
    function recalcTravelHeight() {
      if (!travelSection || window.innerWidth <= 900) return;
      const vh = window.innerHeight;
      // earlyStart = travel.offsetTop - 0.60*vh
      // effective denominator = H - 0.40*vh; target denominator = 4.20*vh (extra hold time)
      // → H = 4.20*vh + 0.40*vh = 4.60*vh
      const H = vh * 4.60;
      travelSection.style.height = Math.max(H, 2.5 * vh) + 'px';
    }
    recalcTravelHeight();
    window.addEventListener('resize', recalcTravelHeight, { passive: true });

    let _ticking = false;
    function _scheduleScroll() { if (!_ticking) { _ticking = true; requestAnimationFrame(() => { onScroll(); _ticking = false; }); } }
    window.addEventListener('scroll', _scheduleScroll, { passive: true });
    window.addEventListener('resize', _scheduleScroll, { passive: true });
    onScroll();

    // Nav
    const nav = document.getElementById('nav');
    window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 60), { passive: true });

    // Mobile burger menu
    const burger = document.getElementById('navBurger');
    const mobileMenu = document.getElementById('mobileMenu');
    burger.addEventListener('click', () => {
      const open = mobileMenu.classList.toggle('open');
      burger.classList.toggle('open', open);
    });
    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        burger.classList.remove('open');
      });
    });

    // Countdown
    function tick() { const target = new Date('2026-06-20T15:00:00Z'); const now = new Date(); let diff = Math.max(0, target - now); const d = Math.floor(diff / 86400000); diff %= 86400000; const h = Math.floor(diff / 3600000); diff %= 3600000; const m = Math.floor(diff / 60000); diff %= 60000; const s = Math.floor(diff / 1000); document.getElementById('cd-d').textContent = String(d).padStart(2, '0'); document.getElementById('cd-h').textContent = String(h).padStart(2, '0'); document.getElementById('cd-m').textContent = String(m).padStart(2, '0'); document.getElementById('cd-s').textContent = String(s).padStart(2, '0'); }
    tick(); setInterval(tick, 1000);

        // Generic reveals

    // ═══ MOBILE card reveals — Skylodge arches + Travel cards ═══
    if (window.innerWidth < 900) {
      const mobCards = document.querySelectorAll('.arch,.travel-card');
      mobCards.forEach(el => el.classList.add('mob-reveal'));
      const mobObs = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            // small stagger based on sibling index
            const siblings = Array.from(e.target.parentElement.children);
            const idx = siblings.indexOf(e.target);
            setTimeout(() => e.target.classList.add('mob-in'), idx * 80);
            mobObs.unobserve(e.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
      mobCards.forEach(el => mobObs.observe(el));
    }
    // ─── Timeline bidirectional reveal (separate from general one-way reveals) ───
    const tlRevealEls = document.querySelectorAll('#timeline .reveal,#timeline .reveal-left,#timeline .reveal-right');
    const tlRevealSet = new Set(tlRevealEls);
    const timelineObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in'); }
        else { e.target.classList.remove('in'); }
      });
    }, { threshold: .2, rootMargin: '0px 0px -60px 0px' });
    tlRevealEls.forEach(el => timelineObs.observe(el));

    // ─── General one-way reveals (excluding timeline) ───
    const revealEls = Array.from(document.querySelectorAll('.reveal,.reveal-left,.reveal-right')).filter(el => !tlRevealSet.has(el));
    const revealObs = new IntersectionObserver(entries => { entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); revealObs.unobserve(e.target); } }); }, { threshold: .05, rootMargin: '0px 0px -20px 0px' });
    revealEls.forEach(el => revealObs.observe(el));

    // Dress code swatches — staggered pop-in
    const swatches = document.querySelectorAll('.swatch');
    const swatchObs = new IntersectionObserver(entries => { entries.forEach(e => { if (e.isIntersecting) { const idx = parseInt(e.target.dataset.sw); setTimeout(() => e.target.classList.add('in'), idx * 100); swatchObs.unobserve(e.target); } }); }, { threshold: .3 });
    swatches.forEach(s => swatchObs.observe(s));

    // Dress code tip text
    const dcTip = document.querySelector('.dresscode-tip');
    const dcObs = new IntersectionObserver(entries => { entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); dcObs.unobserve(e.target); } }); }, { threshold: .2 });
    if (dcTip) dcObs.observe(dcTip);

    // ═══ VENUE BG visibility — show when timeline or travel is in view ═══
    const venueBg = document.getElementById('venue-bg');
    const timelineSec = document.getElementById('timeline');
    const dressSec = document.getElementById('dresscode');
    function updateVenueBg() {
      if (!venueBg || !timelineSec) return;
      const tlRect = timelineSec.getBoundingClientRect();
      const trvlRect = travelSection ? travelSection.getBoundingClientRect() : { top: 9999, bottom: 0 };
      const dressRect = dressSec ? dressSec.getBoundingClientRect() : { top: 9999, bottom: 0 };
      const vh = window.innerHeight;
      // Show venue bg when any of these sections are on screen
      const visible = (tlRect.top < vh && tlRect.bottom > 0) || (trvlRect.top < vh && trvlRect.bottom > 0) || (dressRect.top < vh && dressRect.bottom > 0);
      venueBg.classList.toggle('visible', visible);
      // Parallax the venue bg
      if (visible) {
        const y = window.scrollY;
        venueBg.style.transform = 'translateY(' + (y * 0.25) + 'px)';
      }
    }
    window.addEventListener('scroll', updateVenueBg, { passive: true });

    // ═══ RSVP: Dynamic guest list ═══
    const rsvpAccept = document.getElementById('rsvpAccept');
    const rsvpDecline = document.getElementById('rsvpDecline');
    const addGuestBtn = document.getElementById('addGuestBtn');
    const guestList = document.getElementById('guestList');
    const declineNote = document.getElementById('declineNote');
    let guestCount = 0;
    let hasSubmitted = false;

    function updateGuestBtn() {
      const accepting = rsvpAccept && rsvpAccept.checked;
      const declining = rsvpDecline && rsvpDecline.checked;

      // Toggle add-guest button
      if (addGuestBtn) {
        addGuestBtn.classList.toggle('disabled', !accepting);
        addGuestBtn.disabled = !accepting;
      }

      // Show/hide decline note
      if (declineNote) declineNote.style.display = declining ? 'block' : 'none';

      // Clear all guest fields when switching to decline
      if (declining && guestList) {
        guestList.innerHTML = '';
        guestCount = 0;
      }

      // Re-enable submit whenever declining is selected (button state survives re-renders via dataset)
      const submitBtn = document.getElementById('rsvpSubmitBtn');
      if (submitBtn) {
        const wasSubmitted = submitBtn.dataset.submitted === 'true';
        if (declining) {
          submitBtn.disabled = false;
          submitBtn.textContent = wasSubmitted ? 'Update RSVP' : 'Send RSVP';
        } else if (wasSubmitted) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Sent ✓';
        }
      }
    }

    function addGuest() {
      if (!rsvpAccept || !rsvpAccept.checked) return;
      guestCount++;
      const item = document.createElement('div');
      item.className = 'rsvp-guest-item';
      item.dataset.guest = guestCount;
      item.innerHTML = `
        <div class="rsvp-guest-header">
          <span class="rsvp-guest-label">Guest ${guestCount}</span>
          <button class="rsvp-guest-remove" aria-label="Remove guest" type="button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
          </button>
        </div>
        <input class="rsvp-input" type="text" placeholder="Full Name" />
      `;
      item.querySelector('.rsvp-guest-remove').addEventListener('click', () => {
        item.remove();
        // Re-number remaining guests
        guestList.querySelectorAll('.rsvp-guest-item').forEach((el, i) => {
          el.querySelector('.rsvp-guest-label').textContent = `Guest ${i + 1}`;
          guestCount = i + 1;
        });
        if (!guestList.querySelectorAll('.rsvp-guest-item').length) guestCount = 0;
      });
      guestList.appendChild(item);
    }

    if (rsvpAccept) rsvpAccept.addEventListener('change', updateGuestBtn);
    if (rsvpDecline) rsvpDecline.addEventListener('change', () => { updateGuestBtn(); });
    if (addGuestBtn) addGuestBtn.addEventListener('click', addGuest);
    updateGuestBtn();

    // ═══ RSVP: Submit to Google Sheets via Apps Script ═══
    const rsvpSubmitBtn = document.getElementById('rsvpSubmitBtn');
    const rsvpStatus = document.getElementById('rsvpStatus');

    if (rsvpSubmitBtn) {
      rsvpSubmitBtn.addEventListener('click', async () => {
        const name = document.getElementById('rsvpName').value.trim();
        const email = document.getElementById('rsvpEmail').value.trim();
        const phone = document.getElementById('rsvpPhone').value.trim();
        const msg = document.getElementById('rsvpMsg').value.trim();
        const attending = rsvpAccept.checked ? 'Yes' : rsvpDecline.checked ? 'No' : '';
        const guestNames = Array.from(guestList.querySelectorAll('.rsvp-guest-item input')).map(i => i.value.trim()).filter(Boolean).join(', ');

        if (!name) { showStatus('Please enter your name.', '#E8766A'); return; }
        if (!phone) { showStatus('Please enter your phone number.', '#E8766A'); return; }
        if (!attending) { showStatus('Please select if you will attend.', '#E8766A'); return; }

        const data = { name, email, phone, attending, guests: guestNames, message: msg, timestamp: new Date().toISOString() };



        rsvpSubmitBtn.textContent = 'Sending...';
        rsvpSubmitBtn.disabled = true;
        try {
          const res = await fetch('/api/rsvp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
          if (!res.ok) throw new Error('Server error');
          hasSubmitted = true;
          rsvpSubmitBtn.dataset.submitted = 'true';
          const msg = attending === 'No'
            ? 'Your response has been updated.'
            : 'Thank you! Your RSVP has been received.';
          showStatus(msg, 'var(--gold)');
          rsvpSubmitBtn.textContent = 'Sent ✓';
        } catch (err) {
          showStatus('Something went wrong. Please try again.', '#E8766A');
          rsvpSubmitBtn.textContent = hasSubmitted ? 'Update RSVP' : 'Send RSVP';
          rsvpSubmitBtn.disabled = false;
        }
      });
    }
    function showStatus(msg, color) {
      rsvpStatus.textContent = msg;
      rsvpStatus.style.color = color;
      rsvpStatus.style.opacity = '1';
    }

    // ─── Cleanup ───
    return () => {
      window.removeEventListener('scroll', _scheduleScroll);
      window.removeEventListener('resize', _scheduleScroll);
    };
  }, []);

  return (
    <>
      <div id="site-bg"></div><div id="venue-bg"></div><div id="site-overlay"></div><div id="progress"></div>

      <nav id="nav">
        <a href="#hero" className="nav-logo"><img src="/favicon.svg" alt="A · L" className="nav-logo-img" fetchpriority="high" /></a>
        <ul className="nav-links"><li><a href="#countdown">Countdown</a></li><li><a href="#practical">Venue</a></li><li><a href="#timeline">Event Details</a></li><li><a href="#travel">Getting Around</a></li><li><a href="#rsvp">R.S.V.P.</a></li>{showRegistry && <li><a href="#registry">Wishes</a></li>}</ul>
        <button className="nav-burger" id="navBurger" aria-label="Open menu">
          <span></span><span></span><span></span>
        </button>
      </nav>
      <div className="mobile-menu" id="mobileMenu">
        <ul className="mobile-menu-links">
          <li><a href="#countdown">Countdown</a></li>
          <li><a href="#practical">Venue</a></li>
          <li><a href="#timeline">Event Details</a></li>
          <li><a href="#travel">Getting Around</a></li>
          <li><a href="#rsvp">R.S.V.P.</a></li>
          {showRegistry && <li><a href="#registry">Wishes</a></li>}
        </ul>
      </div>

      <section id="hero">
        <div className="hero-content">
          <p className="hero-eyebrow">You are warmly invited to celebrate</p>
          <img src="/hero-title-white.png" className="hero-names-img" alt="Amine &amp; Lamya" />
          <div className="hero-rule"></div>
          <p className="hero-date">20 &middot; 06 &middot; 2026</p>
          <p className="hero-location">Skylodge<br />Feytroun, Lebanon</p>
        </div>
        <div className="hero-scroll"><span>Scroll</span><div className="scroll-needle"></div></div>
      </section>

      <section id="countdown">
        <span className="section-eyebrow reveal">Until we say I do</span>
        <div className="cd-grid">
          <div className="cd-unit reveal d1"><span className="cd-num" id="cd-d">00</span><span className="cd-lbl">Days</span></div><div className="cd-sep reveal d1">&middot;</div>
          <div className="cd-unit reveal d2"><span className="cd-num" id="cd-h">00</span><span className="cd-lbl">Hours</span></div><div className="cd-sep reveal d2">&middot;</div>
          <div className="cd-unit reveal d3"><span className="cd-num" id="cd-m">00</span><span className="cd-lbl">Minutes</span></div><div className="cd-sep reveal d3">&middot;</div>
          <div className="cd-unit reveal d4"><span className="cd-num" id="cd-s">00</span><span className="cd-lbl">Seconds</span></div>
        </div>
      </section>

      <section id="practical">
        <div className="practical-pin"><div className="mashrabiya-bg"></div>
          <div className="practical-header">
            <span className="section-eyebrow venue-eyebrow reveal">VENUE</span>
            <h2 className="section-title reveal d1">SKYLODGE</h2>
            <p className="practical-subtitle reveal d2">We can&apos;t wait to celebrate with you at this stunning mountain hideaway.</p>
            <a className="venue-btn reveal d3" href="https://www.google.com/maps/search/Skylodge+Feytroun+Lebanon" target="_blank" rel="noopener"><svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: ".5em", verticalAlign: "-.15em", flexShrink: 0 }}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zM12 11.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" /></svg>Find Directions</a>
            <div className="good-to-know reveal d3"><span>Good to Know</span></div>
            <div className="scroll-progress-wrap"><div className="scroll-progress-bar" id="practicalProgress"></div></div>
          </div>
          <div className="colonnade-stage"><div className="colonnade" id="colonnade">
            <div className="arch" data-arch="0"><svg className="arch-frame" viewBox="0 0 230 410" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><path d="M 8 408 L 8 130 Q 8 8,115 4 Q 222 8,222 130 L 222 408 Z" fill="url(#archG1)" stroke="rgba(201,160,74,0.45)" strokeWidth="1" /><path d="M 14 410 L 14 132 Q 14 14,115 10 Q 216 14,216 132 L 216 410" fill="none" stroke="rgba(201,160,74,0.18)" strokeWidth="0.6" /></svg><div className="arch-medallion"><svg viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M30,7 A14,14 0 0,1 44,21 C44,32 30,50 30,50 C30,50 16,32 16,21 A14,14 0 0,1 30,7 Z" strokeWidth="1.3" /><circle cx="30" cy="21" r="5" strokeWidth="1.1" /></svg></div><div className="arch-inner"><h3 className="arch-title">Worth the drive</h3><p className="arch-text">We&#39;re about an hour from Beirut. And since we fully plan on cheering and drinking all night long, we highly recommend booking a nearby hotel or Airbnb so we can party properly. Please don&#39;t drink and drive.</p></div></div>
            <div className="arch" data-arch="1"><svg className="arch-frame" viewBox="0 0 230 410" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="archG1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="rgba(201,160,74,0.08)" /><stop offset="100%" stopColor="rgba(18,10,3,0.4)" /></linearGradient></defs><path d="M 8 408 L 8 130 Q 8 8,115 4 Q 222 8,222 130 L 222 408 Z" fill="url(#archG1)" stroke="rgba(201,160,74,0.45)" strokeWidth="1" /><path d="M 14 410 L 14 132 Q 14 14,115 10 Q 216 14,216 132 L 216 410" fill="none" stroke="rgba(201,160,74,0.18)" strokeWidth="0.6" /></svg><div className="arch-medallion"><svg viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><polyline points="6,50 22,22 38,50" strokeWidth="1.4" /><polyline points="22,50 38,10 54,50" strokeWidth="1.4" /></svg></div><div className="arch-inner"><h3 className="arch-title">Up in the mountains</h3><p className="arch-text">Celebrating at 1,300 meters altitude, tucked between rock formations. Don&apos;t worry, complimentary valet service will be available, and Golf Carts will whisk you from your car straight into the magic.</p></div></div>
            <div className="arch" data-arch="2"><svg className="arch-frame" viewBox="0 0 230 410" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><path d="M 8 408 L 8 130 Q 8 8,115 4 Q 222 8,222 130 L 222 408 Z" fill="url(#archG1)" stroke="rgba(201,160,74,0.45)" strokeWidth="1" /><path d="M 14 410 L 14 132 Q 14 14,115 10 Q 216 14,216 132 L 216 410" fill="none" stroke="rgba(201,160,74,0.18)" strokeWidth="0.6" /></svg><div className="arch-medallion"><svg viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><circle cx="30" cy="30" r="9" strokeWidth="1.3" /><line x1="30" y1="16" x2="30" y2="8" strokeWidth="1.2" /><line x1="44" y1="30" x2="52" y2="30" strokeWidth="1.2" /><line x1="30" y1="44" x2="30" y2="52" strokeWidth="1.2" /><line x1="16" y1="30" x2="8" y2="30" strokeWidth="1.2" /><line x1="39" y1="21" x2="43" y2="17" strokeWidth=".9" /><line x1="39" y1="39" x2="43" y2="43" strokeWidth=".9" /><line x1="21" y1="39" x2="17" y2="43" strokeWidth=".9" /><line x1="21" y1="21" x2="17" y2="17" strokeWidth=".9" /></svg></div><div className="arch-inner"><h3 className="arch-title">Sun&apos;s out, vibes out</h3><p className="arch-text">The sun might be a little extra during the day &mdash; but we&apos;ve got you covered with mini umbrellas for the shade lovers.</p></div></div>
            <div className="arch" data-arch="3"><svg className="arch-frame" viewBox="0 0 230 410" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><path d="M 8 408 L 8 130 Q 8 8,115 4 Q 222 8,222 130 L 222 408 Z" fill="url(#archG1)" stroke="rgba(201,160,74,0.45)" strokeWidth="1" /><path d="M 14 410 L 14 132 Q 14 14,115 10 Q 216 14,216 132 L 216 410" fill="none" stroke="rgba(201,160,74,0.18)" strokeWidth="0.6" /></svg><div className="arch-medallion"><svg viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M30,8 L33,27 L52,30 L33,33 L30,52 L27,33 L8,30 L27,27 Z" strokeWidth="1.3" /><path d="M47,10 L48.2,14 L52,15 L48.2,16 L47,20 L45.8,16 L42,15 L45.8,14 Z" strokeWidth=".9" /><path d="M14,42 L14.8,45 L18,46 L14.8,47 L14,50 L13.2,47 L10,46 L13.2,45 Z" strokeWidth=".8" /></svg></div><div className="arch-inner"><h3 className="arch-title">Cooler nights ahead</h3><p className="arch-text">Once the sun dips, it gets a bit nippy. Bring a cute layer so you can stay cozy and keep dancing under the stars.</p></div></div>
            <div className="arch" data-arch="4"><svg className="arch-frame" viewBox="0 0 230 410" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><path d="M 8 408 L 8 130 Q 8 8,115 4 Q 222 8,222 130 L 222 408 Z" fill="url(#archG1)" stroke="rgba(201,160,74,0.45)" strokeWidth="1" /><path d="M 14 410 L 14 132 Q 14 14,115 10 Q 216 14,216 132 L 216 410" fill="none" stroke="rgba(201,160,74,0.18)" strokeWidth="0.6" /></svg><div className="arch-medallion"><svg viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="19" cy="36" rx="9" ry="6" strokeWidth="1.2" transform="rotate(-20 19 36)" /><ellipse cx="38" cy="26" rx="8" ry="5.5" strokeWidth="1.2" transform="rotate(12 38 26)" /><ellipse cx="44" cy="42" rx="9" ry="5.5" strokeWidth="1.2" transform="rotate(-8 44 42)" /><ellipse cx="26" cy="20" rx="6" ry="4" strokeWidth="1" transform="rotate(25 26 20)" /><ellipse cx="15" cy="48" rx="5" ry="3.5" strokeWidth=".9" transform="rotate(-10 15 48)" /></svg></div><div className="arch-inner"><h3 className="arch-title">Ditch the stilettos</h3><p className="arch-text">Gravel and pebbles aren&apos;t heel-friendly territory. Think chic but comfy &mdash; you&apos;ll thank us at 1am.</p></div></div>
          </div></div>
        </div>
      </section>

      <section id="timeline">
        <div className="timeline-parallax-bg" id="timelineParallaxBg"></div>
        <div className="timeline-parallax-overlay"></div>
        <div className="carpet-bg" id="carpetBg"></div><div className="carpet-corner carpet-corner-tl" id="carpetCornerTL"></div><div className="carpet-corner carpet-corner-tr" id="carpetCornerTR"></div><div className="carpet-corner carpet-corner-br" id="carpetCornerBR"></div><div className="carpet-corner carpet-corner-bl" id="carpetCornerBL"></div><div className="carpet-border-top" id="carpetBorderTop"></div><div className="carpet-border-bottom" id="carpetBorderBottom"></div>
        <span className="section-eyebrow reveal" style={{ position: "relative", zIndex: 2 }}>Saturday, 20 June 2026</span>
        <div className="tl-schedule-label reveal" style={{ position: "relative", zIndex: 2 }}>Schedule</div>
        <h2 className="section-title reveal d1" style={{ position: "relative", zIndex: 2 }}>What&apos;s the Plan?</h2>
        <div className="gold-rule reveal d2" style={{ position: "relative", zIndex: 2 }}></div>
        <div className="tl-wrap"><div className="tl-spine"></div>
          <div className="tl-item tl-left">
            <p className="tl-time reveal-left">18:00</p><div className="tl-dot reveal"></div><div className="tl-empty"></div>
            <div className="tl-body reveal-left"><p className="tl-event">Wedding Ceremony</p><p className="tl-desc">Together with you, we mark the beginning of a new chapter filled with love, gratitude, and shared happiness. Plan to arrive 10 minutes early to allow time for golf carts to transport you.</p></div><div className="tl-empty"></div><div className="tl-empty"></div>
          </div>
          <div className="tl-item tl-right">
            <div className="tl-empty"></div><div className="tl-dot reveal"></div><p className="tl-time reveal-right">19:00</p>
            <div className="tl-empty"></div><div className="tl-empty"></div><div className="tl-body reveal-right"><p className="tl-event">Welcome Drink</p><p className="tl-desc">Drinks, smiles, and warm reunions before the evening unfolds.</p></div>
          </div>
          <div className="tl-item tl-left">
            <p className="tl-time reveal-left">20:00</p><div className="tl-dot reveal"></div><div className="tl-empty"></div>
            <div className="tl-body reveal-left"><p className="tl-event">Reception &amp; Dinner</p><p className="tl-desc">We celebrate love through food, music, and togetherness.</p></div><div className="tl-empty"></div><div className="tl-empty"></div>
          </div>
          <div className="tl-item tl-right">
            <div className="tl-empty"></div><div className="tl-dot reveal"></div><p className="tl-time reveal-right">00:30</p>
            <div className="tl-empty"></div><div className="tl-empty"></div><div className="tl-body reveal-right"><p className="tl-event">The After!</p><p className="tl-desc">The music rises and the dancing carries on for those who wish to linger a little longer.</p></div>
          </div>
        </div>
      </section>

      <section id="dresscode">
        <div className="dresscode-parallax-bg" id="dresscodeBg"></div>
        <div className="dresscode-parallax-overlay"></div>
        <div className="dresscode-content">
          <span className="section-eyebrow reveal">Look the part</span>
          <h2 className="section-title reveal d1">Dress Code</h2>
          <div className="gold-rule reveal d2"></div>
          <div className="tassel-wrap">
            <img src="/tassels-new.jpg" alt="Dress code colour tassels" className="tassel-img reveal d3" />
          </div>
          <p className="dresscode-tip">Dress freely, celebrate fully.<br />Earthy and amber tones are always a yes.</p>
        </div>
      </section>

      <section id="travel">
        <div className="travel-pin"><div className="travel-parallax-bg" id="travelBg"></div><div className="travel-parallax-overlay"></div><div className="travel-warm-texture"></div><div className="mashrabiya-bg" style={{ zIndex: 2, display: "none" }}></div>
          <div className="travel-header-pin">
            <span className="section-eyebrow reveal">A little guide</span>
            <h2 className="section-title reveal d1">Travel, Stay, Celebrate</h2>
            <div className="gold-rule reveal d2"></div>
            <div className="travel-progress-wrap"><div className="travel-progress-bar" id="travelProgress"></div></div>
          </div>
          <div className="travel-stage" id="travelStage">
            <div className="travel-card" data-tc="0" data-from="left"><span className="tc-corner-tr"></span><span className="tc-corner-bl"></span>
              <div className="tc-icon"><svg viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M30 6 L32 24 L52 36 L52 40 L32 34 L32 44 L38 48 L38 51 L30 49 L22 51 L22 48 L28 44 L28 34 L8 40 L8 36 L28 24 Z" /></svg></div>
              <div className="tc-body"><h3 className="tc-title">Arrive by air</h3><p className="tc-sub">Beirut &middot; BEY</p>
                <p className="tc-text">Arrive through Beirut&ndash;Rafic Hariri International Airport (BEY). Check visa requirements well ahead of your trip.</p>
                <p className="tc-meta">~1 hour drive to the venue</p>
              </div></div>
            <div className="travel-card" data-tc="1" data-from="right"><span className="tc-corner-tr"></span><span className="tc-corner-bl"></span>
              <div className="tc-icon"><svg viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 38 L12 28 L18 22 L42 22 L48 28 L52 38 L52 44 L48 44 L48 42 L12 42 L12 44 L8 44 Z" /><circle cx="18" cy="44" r="3" /><circle cx="42" cy="44" r="3" /><rect x="26" y="14" width="8" height="3" strokeWidth=".8" /></svg></div>
              <div className="tc-body"><h3 className="tc-title">Moving around</h3><p className="tc-sub">Allo Taxi &middot; 1213</p>
                <p className="tc-text">We recommend Allo Taxi &mdash; app, web, or call 1213 locally / +961 1 517070. Pre-book for the airport.</p>
                <p className="tc-meta">Pre-book your airport pickup</p>
              </div></div>
            <div className="travel-card" data-tc="2" data-from="left"><span className="tc-corner-tr"></span><span className="tc-corner-bl"></span>
              <div className="tc-icon"><svg viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 50 L10 25 L30 12 L50 25 L50 50 Z" /><path d="M22 50 L22 36 L38 36 L38 50" /><line x1="30" y1="36" x2="30" y2="50" strokeWidth=".8" /><circle cx="30" cy="22" r="2" strokeWidth=".8" /></svg></div>
              <div className="tc-body"><h3 className="tc-title">Where to lay your head</h3><p className="tc-sub">Boutique &amp; local</p>
                <p className="tc-text">We&apos;ve carefully curated a selection of boutique hotels and charming traditional Lebanese Airbnbs for your stay. A downloadable list will be available soon.</p>
                <p className="tc-meta">Our curated list arriving soon</p>
              </div></div>
            <div className="travel-card" data-tc="3" data-from="right"><span className="tc-corner-tr"></span><span className="tc-corner-bl"></span>
              <div className="tc-icon"><svg viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="14" cy="20" r="3" /><circle cx="46" cy="44" r="3" /><path d="M14 23 Q14 38,30 38 Q46 38,46 41" strokeDasharray="2 3" /><path d="M40 14 L50 20 L40 26" /></svg></div>
              <div className="tc-body"><h3 className="tc-title">On the wedding day</h3><p className="tc-sub">Beirut <span className="tc-arrow">&#x2194;&#xFE0E;</span> Skylodge</p>
                <p className="tc-text">We&apos;re working on shuttle arrangements between Beirut and the venue (50 min). Let us know in your RSVP.</p>
                <p className="tc-meta">RSVP to reserve your spot</p>
              </div></div>
          </div>
        </div>
      </section>

      <section id="rsvp">
        <div className="rsvp-card reveal">
          <h2 className="rsvp-card-title">RSVP</h2>
          <p className="rsvp-card-sub">Please confirm your attendance by June 1, 2026</p>
          <div className="rsvp-form" id="rsvpForm">
            <div>
              <p className="rsvp-col-label">Will you be joining us?</p>
              <label className="rsvp-radio"><input type="radio" name="rsvp" value="accept" id="rsvpAccept" /><span className="radio-circle"></span>Gladly Accept</label>
              <label className="rsvp-radio"><input type="radio" name="rsvp" value="decline" id="rsvpDecline" /><span className="radio-circle"></span>Regretfully Decline</label>
            </div>
            <div>
              <p className="rsvp-col-label">Your Details</p>
              <input className="rsvp-input" type="text" placeholder="Full Name" id="rsvpName" />
              <input className="rsvp-input" type="email" placeholder="Email Address" id="rsvpEmail" />
              <input className="rsvp-input" type="tel" placeholder="Phone Number *" id="rsvpPhone" />
            </div>
            <div className="rsvp-row-full"><input className="rsvp-input" type="text" placeholder="Message (Optional)" id="rsvpMsg" /></div>
            <div className="rsvp-row-full rsvp-guest-section">
              <p className="rsvp-guest-divider">For families, couples, and companions, kindly add accompanying guests below</p>
              <div id="guestList"></div>
              <button className="rsvp-add-guest" id="addGuestBtn" type="button">+ Add Another Guest</button>
              <p className="rsvp-decline-note" id="declineNote" style={{ display: "none" }}>Additional guests cannot be added when declining.</p>
            </div>
            <div className="rsvp-row-full" style={{ textAlign: "center" }}>
              <button className="rsvp-submit" type="button" id="rsvpSubmitBtn">Send RSVP</button>
              <p id="rsvpStatus" style={{ fontFamily: "var(--sans)", fontSize: ".78rem", color: "var(--gold)", marginTop: "1.5rem", opacity: "0", transition: "opacity .5s" }}></p>
            </div>
          </div>
        </div>
      </section>

      {showRegistry && <section id="registry">
        <div className="registry-bg"></div>
        <div className="registry-inner">
          <h2 className="registry-title">Registry</h2>
          <p className="registry-sub">Your presence is the gift.<br />Should you wish to leave a thoughtful gesture, kindly find the details below</p>
          <div className="registry-cols">
            <div>
              <p className="reg-col-title">Lebanon</p>
              <p className="reg-note" style={{ opacity: ".7", fontSize: ".82rem", marginBottom: ".8rem" }}>NEO by Bank Audi</p>
              <div className="reg-row"><span className="reg-label">Account Name:</span><span className="reg-value">AMINE KHALIL AZAR</span></div>
              <div className="reg-row"><span className="reg-label">Account No:</span><span className="reg-value">50185982-0002</span></div>
              <div className="reg-row"><span className="reg-label">IBAN:</span><span className="reg-value">LB91005699840103501859820002</span></div>
              <div className="reg-row"><span className="reg-label">SWIFT:</span><span className="reg-value">AUDBLBBX</span></div>
              <div className="reg-or">&mdash; or &mdash;</div>
              <p className="reg-note"><strong>WHISH</strong></p>
              <div className="reg-row"><span className="reg-label">Account ID:</span><span className="reg-value">20760263-03</span></div>
              <div className="reg-row"><span className="reg-label">Account Name:</span><span className="reg-value">Amine &amp; Lamya</span></div>
            </div>
            <div className="registry-divider"></div>
            <div>
              <p className="reg-col-title">Liberia</p>
              <p className="reg-note" style={{ opacity: ".7", fontSize: ".82rem", marginBottom: ".8rem" }}>Ecobank</p>
              <div className="reg-row"><span className="reg-label">Account Name:</span><span className="reg-value">AMINE AZAR</span></div>
              <div className="reg-row"><span className="reg-label">Account No:</span><span className="reg-value">6101949442</span></div>
              <div className="reg-row"><span className="reg-label">SWIFT:</span><span className="reg-value">ECOCLRLM</span></div>
            </div>
          </div>
        </div>
      </section>}

      <footer><img src="/hero-title-white.png" className="footer-names-img footer-title-img" alt="Amine &amp; Lamya" /><p className="footer-date">20 &middot; 06 &middot; 2026 &nbsp;&middot;&nbsp; Skylodge, Feytroun, Lebanon</p></footer>
    </>
  );
}
