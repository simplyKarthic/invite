/* ========================================
   Wedding Invitation – Multi-Page with Swipe
   ======================================== */

// ── Decorations ──────────────────────────────────────────────────────────────
// Shared SVG decorations injected into every page so they're defined once here.

const PETALS = [0,30,60,90,120,150,180,210,240,270,300,330]
  .map(r => `<ellipse cx="0" cy="-28" rx="7" ry="18" fill="${r%60===0?'#F4C430':r%90===0?'#DAA520':'#E8B820'}" transform="rotate(${r})"/>`)
  .join('');

const SUNFLOWER_CENTER = `<circle cx="0" cy="0" r="13" fill="#8B6914"/><circle cx="0" cy="0" r="10" fill="#6B4F12"/>`;

function sunflower(tx, ty, leaves) {
  return `<g transform="translate(${tx},${ty})">${leaves}${PETALS}${SUNFLOWER_CENTER}</g>`;
}

const CORNER_SVGS = {
  'top-left':     sunflower(60,  60,  `<ellipse cx="-40" cy="30" rx="18" ry="40" fill="#4A7C3F" transform="rotate(-30 -40 30)" opacity="0.85"/>
                                        <ellipse cx="40" cy="-30" rx="14" ry="35" fill="#5A8C4F" transform="rotate(20 40 -30)" opacity="0.8"/>
                                        <ellipse cx="-30" cy="-35" rx="12" ry="30" fill="#3D6B33" transform="rotate(-50 -30 -35)" opacity="0.7"/>`),
  'top-right':    sunflower(140, 60,  `<ellipse cx="40" cy="30" rx="18" ry="40" fill="#4A7C3F" transform="rotate(30 40 30)" opacity="0.85"/>
                                        <ellipse cx="-40" cy="-30" rx="14" ry="35" fill="#5A8C4F" transform="rotate(-20 -40 -30)" opacity="0.8"/>
                                        <ellipse cx="30" cy="-35" rx="12" ry="30" fill="#3D6B33" transform="rotate(50 30 -35)" opacity="0.7"/>`),
  'bottom-left':  sunflower(60,  140, `<ellipse cx="-40" cy="-30" rx="18" ry="40" fill="#4A7C3F" transform="rotate(30 -40 -30)" opacity="0.85"/>
                                        <ellipse cx="40" cy="30" rx="14" ry="35" fill="#5A8C4F" transform="rotate(-20 40 30)" opacity="0.8"/>`),
  'bottom-right': sunflower(140, 140, `<ellipse cx="40" cy="-30" rx="18" ry="40" fill="#4A7C3F" transform="rotate(-30 40 -30)" opacity="0.85"/>
                                        <ellipse cx="-40" cy="30" rx="14" ry="35" fill="#5A8C4F" transform="rotate(20 -40 30)" opacity="0.8"/>`),
};

const BOKEH_HTML = `
  <div class="bokeh-lights">
    <div class="bokeh" style="top:30%;left:70%;width:80px;height:80px;animation-delay:0s"></div>
    <div class="bokeh" style="top:55%;right:15%;width:60px;height:60px;animation-delay:1.5s"></div>
    <div class="bokeh" style="top:20%;left:40%;width:50px;height:50px;animation-delay:3s"></div>
    <div class="bokeh" style="top:70%;left:20%;width:70px;height:70px;animation-delay:2s"></div>
    <div class="bokeh" style="top:45%;left:80%;width:40px;height:40px;animation-delay:4s"></div>
  </div>`;

const VINE_LEFT  = `<svg viewBox="0 0 60 600" xmlns="http://www.w3.org/2000/svg"><path d="M30 0 C25 100, 15 150, 20 250 S35 400, 25 500 S15 550, 20 600" fill="none" stroke="#5A8C4F" stroke-width="2" opacity="0.4"/><ellipse cx="15" cy="120" rx="6" ry="16" fill="#5A8C4F" transform="rotate(-30 15 120)" opacity="0.5"/><ellipse cx="35" cy="220" rx="6" ry="16" fill="#4A7C3F" transform="rotate(20 35 220)" opacity="0.5"/><ellipse cx="12" cy="350" rx="5" ry="14" fill="#C4A944" transform="rotate(-40 12 350)" opacity="0.45"/><ellipse cx="30" cy="470" rx="6" ry="16" fill="#5A8C4F" transform="rotate(15 30 470)" opacity="0.5"/></svg>`;
const VINE_RIGHT = `<svg viewBox="0 0 60 600" xmlns="http://www.w3.org/2000/svg"><path d="M30 0 C35 100, 45 150, 40 250 S25 400, 35 500 S45 550, 40 600" fill="none" stroke="#5A8C4F" stroke-width="2" opacity="0.4"/><ellipse cx="45" cy="120" rx="6" ry="16" fill="#5A8C4F" transform="rotate(30 45 120)" opacity="0.5"/><ellipse cx="25" cy="220" rx="6" ry="16" fill="#4A7C3F" transform="rotate(-20 25 220)" opacity="0.5"/><ellipse cx="48" cy="350" rx="5" ry="14" fill="#C4A944" transform="rotate(40 48 350)" opacity="0.45"/><ellipse cx="30" cy="470" rx="6" ry="16" fill="#5A8C4F" transform="rotate(-15 30 470)" opacity="0.5"/></svg>`;

function injectDecorations() {
  document.querySelectorAll('.pages-container .page').forEach(page => {
    // Corner sunflowers
    ['top-left', 'top-right', 'bottom-left', 'bottom-right'].forEach(pos => {
      const div = document.createElement('div');
      div.className = `corner-decor ${pos}`;
      div.innerHTML = `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">${CORNER_SVGS[pos]}</svg>`;
      page.prepend(div);
    });
    // Bokeh lights
    page.insertAdjacentHTML('afterbegin', BOKEH_HTML);
    // Side vines
    const leftVine  = document.createElement('div');
    const rightVine = document.createElement('div');
    leftVine.className  = 'side-vine left-vine';
    rightVine.className = 'side-vine right-vine';
    leftVine.innerHTML  = VINE_LEFT;
    rightVine.innerHTML = VINE_RIGHT;
    page.append(leftVine, rightVine);
  });
}

let currentPage = 1; // Start on Invite (Reception)
const totalPages = 3;
let touchStart = 0;
let touchEnd = 0;

document.addEventListener('DOMContentLoaded', () => {
  injectDecorations();
  initUpload();
  initKnotTimer();

  // Initialize first animation
  initPage(currentPage);

  // Navigation menu
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const newPage = parseInt(e.target.dataset.page);
      goToPage(newPage);
    });
  });

  // Swipe nav cards on Invite page
  document.querySelectorAll('.swipe-nav-card').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = parseInt(btn.dataset.goto);
      goToPage(target);
    });
  });

  // Swipe detection
  const container = document.querySelector('.pages-container');
  container.addEventListener('touchstart', (e) => {
    touchStart = e.changedTouches[0].screenX;
  });

  container.addEventListener('touchend', (e) => {
    touchEnd = e.changedTouches[0].screenX;
    handleSwipe();
  });

  // GSAP entrance animations
  animatePageEnter();
});

function handleSwipe() {
  const diff = touchStart - touchEnd;
  const threshold = 50; // minimum swipe distance

  if (diff > threshold) {
    // Swiped left → next page
    if (currentPage < totalPages - 1) goToPage(currentPage + 1);
  } else if (diff < -threshold) {
    // Swiped right → previous page
    if (currentPage > 0) goToPage(currentPage - 1);
  }
}

function goToPage(newPage) {
  if (newPage === currentPage || newPage < 0 || newPage >= totalPages) return;

  // Hide current
  const oldPage = document.querySelector(`.page[data-page="${currentPage}"]`);
  gsap.to(oldPage, {
    opacity: 0,
    duration: 0.3,
    ease: 'power2.inOut',
    onComplete: () => {
      oldPage.classList.remove('active');
      gsap.set(oldPage, { opacity: 1 }); // reset for next time

      // Show new after old is hidden
      const newPageEl = document.querySelector(`.page[data-page="${newPage}"]`);
      newPageEl.classList.add('active');
      gsap.fromTo(newPageEl,
        { opacity: 0 },
        { opacity: 1, duration: 0.4, ease: 'power2.out' }
      );
      animatePageEnter();
    }
  });

  currentPage = newPage;

  // Scroll back to top
  window.scrollTo(0, 0);

  // Update nav
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.classList.remove('active');
    if (parseInt(btn.dataset.page) === newPage) {
      btn.classList.add('active');
    }
  });
}

function initPage(page) {
  const pageEl = document.querySelector(`.page[data-page="${page}"]`);
  pageEl.classList.add('active');

  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.classList.remove('active');
    if (parseInt(btn.dataset.page) === page) {
      btn.classList.add('active');
    }
  });

  animatePageEnter();
}

function animatePageEnter() {
  const activeEl = document.querySelector('.page.active');
  if (!activeEl) return;

  // Names
  const names = activeEl.querySelectorAll('.name');
  const ampersand = activeEl.querySelector('.ampersand');
  const heart = activeEl.querySelector('.heart-ornament');

  gsap.fromTo(names[0],
    { opacity: 0, y: 30, scale: 0.9 },
    { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'power3.out', delay: 0.2 }
  );

  if (ampersand) {
    gsap.fromTo(ampersand,
      { opacity: 0, scale: 0.5 },
      { opacity: 0.8, scale: 1, duration: 0.6, ease: 'back.out(2)', delay: 0.4 }
    );
  }

  if (names[1]) {
    gsap.fromTo(names[1],
      { opacity: 0, y: 30, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'power3.out', delay: 0.6 }
    );
  }

  if (heart) {
    gsap.fromTo(heart,
      { opacity: 0, scale: 0 },
      { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(2)', delay: 0.8 }
    );
  }

  // Invite message
  const message = activeEl.querySelector('.invite-message');
  if (message) {
    gsap.fromTo(message.querySelectorAll('p'),
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.7, stagger: 0.15, delay: 0.9, ease: 'power2.out' }
    );
  }

  // Event sections
  const sections = activeEl.querySelectorAll('.event-section');
  if (sections.length > 0) {
    gsap.fromTo(sections,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.3, delay: 1.2, ease: 'power3.out' }
    );
  }

  // Footer
  const footer = activeEl.querySelector('.footer-message');
  if (footer) {
    gsap.fromTo(footer,
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.7, delay: 1.5, ease: 'power2.out' }
    );
  }

  // Buttons
  const buttons = activeEl.querySelectorAll('.btn');
  if (buttons.length > 0) {
    gsap.fromTo(buttons,
      { opacity: 0, y: 10, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'back.out(1.4)', delay: 1.7 }
    );
  }

  // Calendar button
  const calendarBtn = activeEl.querySelector('#btn-calendar-engagement');
  if (calendarBtn) {
    calendarBtn.addEventListener('click', downloadCalendarEngagement);
  }
  const weddingCalBtn = activeEl.querySelector('#btn-calendar-wedding');
  if (weddingCalBtn) {
    weddingCalBtn.addEventListener('click', downloadCalendarWedding);
  }
}

function downloadIcs(content, filename) {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function downloadCalendarEngagement() {
  downloadIcs(`BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Wedding//Invite//EN
BEGIN:VEVENT
DTSTART:20260422T183000
DTEND:20260422T220000
SUMMARY:Karthic & Prathyusha - Engagement / Reception
LOCATION:Annalakshmi Banquet Hall, No. 6 Mayor Ramanathan Salai, Chetpet, Chennai
DESCRIPTION:Engagement & Reception of Karthic & Prathyusha
END:VEVENT
END:VCALENDAR`, 'karthic-prathyusha-engagement.ics');
}

function downloadCalendarWedding() {
  downloadIcs(`BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Wedding//Invite//EN
BEGIN:VEVENT
DTSTART:20260423T073000
DTEND:20260423T090000
SUMMARY:Karthic & Prathyusha - Wedding Ceremony
LOCATION:MA Murugan Temple Mandapam, Maduravoyal, Chennai
DESCRIPTION:Wedding Ceremony of Karthic & Prathyusha
END:VEVENT
BEGIN:VEVENT
DTSTART:20260423T080000
DTEND:20260423T110000
SUMMARY:Karthic & Prathyusha - Breakfast
LOCATION:AC Hall - Namma Veedu Vasanta Bhavan, Maduravoyal, Chennai
DESCRIPTION:Wedding Breakfast of Karthic & Prathyusha
END:VEVENT
END:VCALENDAR`, 'karthic-prathyusha-wedding.ics');
}

// ── Photo Upload (ImageKit unsigned upload) ───────────────────────────────────
// NOTE: Private key is NOT used here — only the public key.
// Enable "Unsigned Upload" in ImageKit dashboard:
//   Settings > Security > Unsigned image upload → ON

const IMAGEKIT_PUBLIC_KEY = 'public_fs7Itfx3nOgpmbTcRznGwnC0+1A=';
const IMAGEKIT_UPLOAD_URL = 'https://upload.imagekit.io/api/v1/files/upload';
const IMAGEKIT_FOLDER = '/wedding-memories-2026';

function initUpload() {
  const dropzone = document.getElementById('upload-dropzone');
  const input    = document.getElementById('photo-input');
  if (!dropzone || !input) return;

  dropzone.addEventListener('click', () => input.click());

  input.addEventListener('change', (e) => {
    [...e.target.files].forEach(uploadFile);
    input.value = '';
  });

  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  });
  dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    [...e.dataTransfer.files]
      .filter(f => f.type.startsWith('image/'))
      .forEach(uploadFile);
  });
}

function uploadFile(file) {
  const list = document.getElementById('upload-list');
  if (!list) return;

  const item     = document.createElement('div');  item.className = 'upload-item';
  const thumb    = document.createElement('img');  thumb.className = 'upload-item-thumb';
  thumb.src = URL.createObjectURL(file);

  const info     = document.createElement('div');  info.className = 'upload-item-info';
  const name     = document.createElement('div');  name.className = 'upload-item-name';
  name.textContent = file.name;

  const progWrap = document.createElement('div');  progWrap.className = 'upload-item-progress';
  const progBar  = document.createElement('div');  progBar.className = 'upload-item-bar';
  progWrap.appendChild(progBar);
  info.append(name, progWrap);

  const status   = document.createElement('span'); status.className = 'upload-item-status pending';
  status.textContent = '↑';

  item.append(thumb, info, status);
  list.appendChild(item);

  // Fetch auth params from serverless function (keeps private key off the client)
  fetch('/api/imagekit-auth')
    .then(r => r.json())
    .then(({ token, expire, signature }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', `memory_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`);
      formData.append('publicKey', IMAGEKIT_PUBLIC_KEY);
      formData.append('folder', IMAGEKIT_FOLDER);
      formData.append('token', token);
      formData.append('expire', expire);
      formData.append('signature', signature);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', IMAGEKIT_UPLOAD_URL);

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          progBar.style.width = `${Math.round((e.loaded / e.total) * 100)}%`;
        }
      });

      xhr.addEventListener('load', () => {
        progBar.style.width = '100%';
        URL.revokeObjectURL(thumb.src);
        if (xhr.status === 200) {
          status.textContent = '✓';
          status.className = 'upload-item-status done';
        } else {
          status.textContent = '✗';
          status.className = 'upload-item-status error';
          name.title = `Upload failed (${xhr.status})`;
        }
      });

      xhr.addEventListener('error', () => {
        status.textContent = '✗';
        status.className = 'upload-item-status error';
        URL.revokeObjectURL(thumb.src);
      });

      xhr.send(formData);
    })
    .catch(() => {
      status.textContent = '✗';
      status.className = 'upload-item-status error';
      URL.revokeObjectURL(thumb.src);
    });
}

// ── Knot Timer ────────────────────────────────────────────────────────────────
// Wedding ceremony: 23 April 2026, 07:30 AM IST (UTC+5:30)
const WEDDING_TIME = new Date('2026-04-23T07:30:00+05:30');

function initKnotTimer() {
  const timer = document.getElementById('knot-timer');
  const label = document.getElementById('knot-timer-label');
  const units = document.getElementById('knot-timer-units');
  if (!timer || !label || !units) return;

  function pad(n) { return String(n).padStart(2, '0'); }

  function unit(num, lbl, sep) {
    const wrap = document.createElement('div');
    wrap.className = 'knot-timer-unit';
    const numEl = document.createElement('span');
    numEl.className = 'knot-timer-num';
    numEl.textContent = pad(num);
    const lblEl = document.createElement('span');
    lblEl.className = 'knot-timer-lbl';
    lblEl.textContent = lbl;
    wrap.append(numEl, lblEl);
    if (sep) {
      const s = document.createElement('span');
      s.className = 'knot-timer-sep';
      s.textContent = ':';
      return [wrap, s];
    }
    return [wrap];
  }

  function render() {
    const now  = new Date();
    const diff = WEDDING_TIME - now;
    const past = diff <= 0;
    const abs  = Math.abs(diff);

    const totalSec = Math.floor(abs / 1000);
    const secs  = totalSec % 60;
    const mins  = Math.floor(totalSec / 60) % 60;
    const hours = Math.floor(totalSec / 3600) % 24;
    const days  = Math.floor(totalSec / 86400);

    units.innerHTML = '';

    if (past) {
      timer.classList.add('is-official');
      label.textContent = "It's official! 🎊 Married for";
    } else {
      timer.classList.remove('is-official');
      label.textContent = 'Knot tied in';
    }

    const parts = [];
    if (days > 0)  parts.push(...unit(days,  days  === 1 ? 'day'    : 'days',  true));
    parts.push(...unit(hours, hours === 1 ? 'hour'   : 'hours',  true));
    parts.push(...unit(mins,  mins  === 1 ? 'minute' : 'minutes', true));
    parts.push(...unit(secs,  secs  === 1 ? 'second' : 'seconds', false));

    parts.forEach(el => units.appendChild(el));
  }

  render();
  setInterval(render, 1000);
}
