/* ========================================
   Wedding Invitation – Scene Engine
   ======================================== */

// ── State ──
let currentScene = 0;
let totalScenes = 0;
let isTransitioning = false;
let hasInteracted = false;
let audioStartScene = 6; // Scene index where audio starts (Calling Transition)

const app = document.getElementById('app');
const audio = document.getElementById('bg-audio');
const soundToggle = document.getElementById('sound-toggle');



// ── Audio Manager ──
const AudioManager = {
  enabled: false,

  init() {
    soundToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggle();
    });
  },

  play() {
    if (!audio) return;
    audio.volume = 0.3;
    const p = audio.play();
    if (p) p.catch(() => {});
    this.enabled = true;
    soundToggle.classList.add('playing');
  },

  pause() {
    if (!audio) return;
    audio.pause();
    this.enabled = false;
    soundToggle.classList.remove('playing');
  },

  toggle() {
    if (this.enabled) {
      this.pause();
    } else {
      this.play();
    }
  },

  tryAutoStart() {
    if (!this.enabled && hasInteracted) {
      this.play();
    }
  }
};

// ── Scene Definitions ──
const scenes = [
  createIntroScene,
  createChatScene,
  createNeverCalledScene,
  createLifeHappenedScene,
  createTheCallScene,
  createFirstCallScene,
  createCallingTransition,
  createStillTalkingScene,
  createWeddingRevealScene,
  createEventDetailsScene,
  createFinalScene,
];

// ── Initialization ──
function init() {
  totalScenes = scenes.length;
  scenes.forEach((createFn, i) => {
    const el = createFn(i);
    el.dataset.scene = i;
    app.appendChild(el);
  });

  AudioManager.init();
  activateScene(0);

  // Global tap/click handler
  let usedTouch = false;

  app.addEventListener('touchend', (e) => {
    usedTouch = true;
    // Let interactive elements handle their own events
    if (e.target.closest('.call-btn, .final-btn, .intro-name, .sound-toggle, a[href]')) return;
    e.preventDefault();
    handleTap(e);
  });

  app.addEventListener('click', (e) => {
    // Skip if already handled by touchend (prevents double-fire)
    if (usedTouch) { usedTouch = false; return; }
    handleTap(e);
  });
}

function handleTap(e) {
  if (!hasInteracted) hasInteracted = true;

  // Don't advance for interactive elements
  if (e.target.closest('.call-btn, .final-btn, .sound-toggle')) return;

  // Scene-specific tap handling
  const activeEl = app.querySelector('.scene.active');
  if (!activeEl) return;
  const idx = parseInt(activeEl.dataset.scene);

  // Chat scene: advance messages, not scenes
  if (idx === 1) {
    if (advanceChatMessage()) return;
  }

  // The Call scene: don't advance by tap (must use call button)
  if (idx === 4) return;

  // Tooltip on intro scene names
  if (idx === 0 && e.target.closest('.intro-name')) {
    toggleTooltip(e.target.closest('.intro-name'));
    return;
  }

  goNext();
}

function goNext() {
  if (isTransitioning || currentScene >= totalScenes - 1) return;
  isTransitioning = true;

  const oldScene = app.querySelector(`.scene[data-scene="${currentScene}"]`);
  currentScene++;
  const newScene = app.querySelector(`.scene[data-scene="${currentScene}"]`);

  // GSAP exit animation on old scene
  if (oldScene) {
    gsap.to(oldScene, {
      opacity: 0,
      scale: 0.92,
      filter: 'blur(8px)',
      duration: 0.7,
      ease: 'power2.inOut',
      onComplete: () => {
        oldScene.classList.remove('active');
        gsap.set(oldScene, { clearProps: 'all' });
      }
    });
  }

  // GSAP enter animation on new scene
  if (newScene) {
    newScene.classList.add('active');
    gsap.fromTo(newScene,
      { opacity: 0, scale: 1.06, filter: 'blur(6px)' },
      { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.8, ease: 'power2.out', delay: 0.15 }
    );
  }

  // Start audio at the right scene
  if (currentScene >= audioStartScene) {
    AudioManager.tryAutoStart();
  }

  // Trigger scene-specific animations
  setTimeout(() => {
    const animFn = sceneAnimations[currentScene];
    if (animFn && newScene) animFn(newScene);
  }, 200);

  setTimeout(() => { isTransitioning = false; }, 900);
}

function activateScene(idx) {
  const el = app.querySelector(`.scene[data-scene="${idx}"]`);
  if (!el) return;
  el.classList.add('active');

  // Trigger scene-specific animations
  setTimeout(() => {
    const animFn = sceneAnimations[idx];
    if (animFn) animFn(el);
  }, 100);
}

// ── Scene Animation Triggers ──
const sceneAnimations = {};

// ── Helper: GSAP stagger fade-in lines ──
function staggerLines(container, selector, staggerDelay = 0.5, startDelay = 0.3) {
  const lines = container.querySelectorAll(selector);
  if (!lines.length) return;
  gsap.fromTo(lines,
    { opacity: 0, y: 24, filter: 'blur(6px)', scale: 0.96 },
    {
      opacity: 1, y: 0, filter: 'blur(0px)', scale: 1,
      duration: 0.9,
      ease: 'power3.out',
      stagger: staggerDelay,
      delay: startDelay,
    }
  );
}

// ========================================
// SCENE 1 – INTRO
// ========================================
function createIntroScene(idx) {
  const el = document.createElement('div');
  el.className = 'scene scene-intro';

  // Particles with drift
  let particlesHTML = '<div class="particles">';
  for (let i = 0; i < 30; i++) {
    const left = Math.random() * 100;
    const dur = 6 + Math.random() * 10;
    const delay = Math.random() * 8;
    const size = 2 + Math.random() * 4;
    const drift = i % 3 === 0 ? ' drift' : '';
    particlesHTML += `<div class="particle${drift}" style="left:${left}%;width:${size}px;height:${size}px;animation-duration:${dur}s;animation-delay:${delay}s"></div>`;
  }
  particlesHTML += '</div>';

  el.innerHTML = `
    ${particlesHTML}
    <div class="intro-text">
      <div class="fade-line intro-line">"Same company."</div>
      <div class="fade-line intro-line">"Same time."</div>
      <div class="fade-line intro-line">"Different stories."</div>
      <div class="intro-names fade-line">
        <span class="intro-name" data-tooltip="Writes code by day, texts novels by night 💻">Karthic
          <span class="shimmer-bar" style="animation-delay:0s"></span>
          <span class="tooltip">Writes code by day, texts novels by night 💻</span>
        </span>
        <span class="intro-name" data-tooltip="Friendly… but observant 👀">Prathyusha
          <span class="shimmer-bar" style="animation-delay:0.5s"></span>
          <span class="tooltip">Friendly… but observant 👀</span>
        </span>
      </div>
    </div>
    <div class="tap-hint">tap anywhere to continue</div>
  `;

  sceneAnimations[idx] = (scene) => {
    const tl = gsap.timeline();
    const lines = scene.querySelectorAll('.intro-line');
    const names = scene.querySelector('.intro-names');

    tl.fromTo(lines,
      { opacity: 0, y: 30, filter: 'blur(8px)' },
      { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1, ease: 'power3.out', stagger: 0.7 }
    )
    .fromTo(names,
      { opacity: 0, y: 20, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'back.out(1.4)' },
      '-=0.2'
    );
  };

  return el;
}

function toggleTooltip(nameEl) {
  const tooltip = nameEl.querySelector('.tooltip');
  if (!tooltip) return;

  // Hide all other tooltips first
  document.querySelectorAll('.tooltip.show').forEach(t => {
    if (t !== tooltip) t.classList.remove('show');
  });

  tooltip.classList.toggle('show');
}

// ========================================
// SCENE 2 – CHAT
// ========================================
let chatMsgIndex = 0;
const chatMessages = [
  { sender: 'karthic', text: 'Reached home?' },
  { sender: 'prathyusha', text: 'Yes 😄 you?' },
  { sender: 'karthic', text: 'Still in cab… long day' },
  { sender: 'prathyusha', text: 'Same here' },
  { type: 'gap' },
  { sender: 'karthic', text: "Let's sleep early today?" },
  { type: 'timestamp', text: '— Much later —' },
  { sender: 'prathyusha', text: 'You also said the same 😄', time: '2:03 AM' },
];

function createChatScene(idx) {
  const el = document.createElement('div');
  el.className = 'scene scene-chat';

  let msgsHTML = '';
  chatMessages.forEach((msg, i) => {
    if (msg.type === 'timestamp') {
      msgsHTML += `<div class="chat-timestamp" data-msg-idx="${i}">${msg.text}</div>`;
    } else if (msg.type === 'gap') {
      // just a spacer
      msgsHTML += `<div style="height:12px" data-msg-idx="${i}"></div>`;
    } else {
      const side = msg.sender === 'karthic' ? 'self' : 'other';
      const timeHTML = msg.time ? `<div class="msg-time">${msg.time}</div>` : '';
      msgsHTML += `<div class="msg ${side}" data-msg-idx="${i}">${msg.text}${timeHTML}</div>`;
    }
  });

  el.innerHTML = `
    <div class="chat-header">
      <div class="chat-avatar">K&P</div>
      <div>
        <div class="chat-name">Karthic & Prathyusha</div>
      </div>
    </div>
    <div class="chat-messages">
      ${msgsHTML}
      <div class="typing-indicator">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    </div>
    <div class="tap-hint">tap to reveal messages</div>
  `;

  sceneAnimations[idx] = () => {
    chatMsgIndex = 0;
  };

  return el;
}

function advanceChatMessage() {
  if (chatMsgIndex >= chatMessages.length) return false;

  const chatScene = app.querySelector('.scene[data-scene="1"]');
  const typingEl = chatScene.querySelector('.typing-indicator');
  const msgEl = chatScene.querySelector(`[data-msg-idx="${chatMsgIndex}"]`);

  if (!msgEl) {
    chatMsgIndex++;
    return advanceChatMessage();
  }

  const isChat = msgEl.classList.contains('msg');
  const isSelf = msgEl.classList.contains('self');
  if (isChat) {
    gsap.to(typingEl, { opacity: 1, duration: 0.2 });
    setTimeout(() => {
      gsap.to(typingEl, { opacity: 0, duration: 0.15 });
      gsap.fromTo(msgEl,
        { opacity: 0, x: isSelf ? 30 : -30, scale: 0.85 },
        { opacity: 1, x: 0, scale: 1, duration: 0.5, ease: 'back.out(1.7)' }
      );
      chatMsgIndex++;
    }, 450);
  } else {
    gsap.to(msgEl, { opacity: 1, duration: 0.4 });
    chatMsgIndex++;
  }

  return true;
}

// ========================================
// SCENE 3 – NEVER CALLED
// ========================================
function createNeverCalledScene(idx) {
  const el = document.createElement('div');
  el.className = 'scene scene-nevercalled';

  el.innerHTML = `
    <div class="phone-frame">
      <div class="phone-notch"></div>
      <div class="call-log-empty">
        <div class="call-log-empty-icon">📵</div>
        <div class="call-log-empty-text">No recent calls</div>
      </div>
    </div>
    <div class="never-text">
      <div class="fade-line never-line">Endless chats…</div>
      <div class="fade-line never-line">But not a single call.</div>
    </div>
    <div class="tap-hint">tap to continue</div>
  `;

  sceneAnimations[idx] = (scene) => {
    const frame = scene.querySelector('.phone-frame');
    const tl = gsap.timeline();
    tl.fromTo(frame,
      { opacity: 0, y: 40, scale: 0.9, rotateX: 15 },
      { opacity: 1, y: 0, scale: 1, rotateX: 0, duration: 1, ease: 'power3.out' }
    );
    staggerLines(scene, '.never-line', 0.8, 1.2);
  };

  return el;
}

// ========================================
// SCENE 4 – LIFE HAPPENED
// ========================================
function createLifeHappenedScene(idx) {
  const el = document.createElement('div');
  el.className = 'scene scene-life';

  // Fading bubbles
  let bubblesHTML = '<div class="fading-bubbles">';
  const bubbleData = [
    { w: 120, h: 30, top: '20%', left: '10%', delay: 0 },
    { w: 100, h: 28, top: '35%', left: '55%', delay: 0.5 },
    { w: 140, h: 32, top: '50%', left: '20%', delay: 1 },
    { w: 90, h: 26, top: '65%', left: '60%', delay: 1.5 },
    { w: 110, h: 30, top: '45%', left: '5%', delay: 0.8 },
  ];
  bubbleData.forEach(b => {
    bubblesHTML += `<div class="fading-bubble" style="width:${b.w}px;height:${b.h}px;top:${b.top};left:${b.left};animation-delay:${b.delay}s"></div>`;
  });
  bubblesHTML += '</div>';

  el.innerHTML = `
    ${bubblesHTML}
    <div class="life-text">
      <div class="fade-line life-line">Life had its own plans…</div>
      <div class="fade-line life-line">Different paths…</div>
      <div class="fade-line life-line">Different stories…</div>
    </div>
    <div class="tap-hint">tap to continue</div>
  `;

  sceneAnimations[idx] = (scene) => {
    // GSAP-driven bubble fade + drift
    const bubbles = scene.querySelectorAll('.fading-bubble');
    bubbles.forEach((b, i) => {
      gsap.fromTo(b,
        { opacity: 0.6, y: 0, scale: 1, filter: 'blur(0px)', rotation: 0 },
        {
          opacity: 0, y: -70, scale: 0.5, filter: 'blur(12px)', rotation: gsap.utils.random(-10, 10),
          duration: gsap.utils.random(3, 5),
          delay: i * 0.4,
          ease: 'power1.in',
        }
      );
    });
    staggerLines(scene, '.life-line', 1.0, 0.8);
  };

  return el;
}

// ========================================
// SCENE 5 – THE CALL
// ========================================
function createTheCallScene(idx) {
  const el = document.createElement('div');
  el.className = 'scene scene-thecall';

  el.innerHTML = `
    <div class="call-screen">
      <div class="call-prompt-text">
        <div class="fade-line call-prompt-line">One day…</div>
        <div class="fade-line call-prompt-line">I decided to take a chance.</div>
      </div>
      <div class="call-avatar-ring">P</div>
      <div class="call-contact-name">Prathyusha</div>
      <div class="call-label">Karthic calling…</div>
      <button class="call-btn" aria-label="Make call">
        <div class="call-btn-pulse"></div>
        <svg viewBox="0 0 24 24"><path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/></svg>
      </button>
    </div>
    <div class="tap-hint" style="animation-delay:3s">tap to call</div>
  `;

  // Call button handler
  setTimeout(() => {
    const btn = el.querySelector('.call-btn');
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!hasInteracted) hasInteracted = true;
        handleCallAnswer(el);
      });
    }
  }, 0);

  sceneAnimations[idx] = (scene) => {
    const tl = gsap.timeline();
    const lines = scene.querySelectorAll('.call-prompt-line');
    const avatar = scene.querySelector('.call-avatar-ring');
    const name = scene.querySelector('.call-contact-name');
    const label = scene.querySelector('.call-label');
    const btn = scene.querySelector('.call-btn');

    tl.fromTo(lines,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.6 }
    )
    .fromTo(avatar,
      { opacity: 0, scale: 0.5 },
      { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.7)' },
      '-=0.3'
    )
    .fromTo([name, label],
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.2 },
      '-=0.2'
    )
    .fromTo(btn,
      { opacity: 0, scale: 0.3 },
      { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(2)' },
      '-=0.1'
    );
  };

  return el;
}

function handleCallAnswer(sceneEl) {
  const callScreen = sceneEl.querySelector('.call-screen');
  const tapHint = sceneEl.querySelector('.tap-hint');
  if (tapHint) gsap.to(tapHint, { opacity: 0, duration: 0.2 });

  // Shake + flash
  gsap.to(sceneEl, {
    x: -3, duration: 0.05, repeat: 7, yoyo: true,
    ease: 'power1.inOut',
    onComplete: () => gsap.set(sceneEl, { x: 0 })
  });

  // Brief flash overlay
  const flash = document.createElement('div');
  flash.style.cssText = 'position:absolute;inset:0;background:white;z-index:100;pointer-events:none';
  sceneEl.appendChild(flash);
  gsap.fromTo(flash, { opacity: 0.3 }, { opacity: 0, duration: 0.4, onComplete: () => flash.remove() });

  callScreen.innerHTML = `
    <div class="calling-state">
      <div class="call-avatar-ring">P</div>
      <div class="call-contact-name">Prathyusha</div>
      <div class="calling-text">Calling…</div>
      <div class="ring-circles">
        <div class="ring-circle"></div>
        <div class="ring-circle"></div>
        <div class="ring-circle"></div>
      </div>
    </div>
  `;

  // Animate calling state in
  const avatar = callScreen.querySelector('.call-avatar-ring');
  const cname = callScreen.querySelector('.call-contact-name');
  const ctext = callScreen.querySelector('.calling-text');
  gsap.fromTo([avatar, cname, ctext],
    { opacity: 0, scale: 0.8 },
    { opacity: 1, scale: 1, duration: 0.5, stagger: 0.15, ease: 'power2.out' }
  );

  setTimeout(() => goNext(), 2500);
}

// ========================================
// SCENE 6 – FIRST CALL (transition)
// ========================================
function createFirstCallScene(idx) {
  const el = document.createElement('div');
  el.className = 'scene scene-firstcall';

  el.innerHTML = `
    <div class="firstcall-text">
      <div class="fade-line firstcall-line">Hello…</div>
      <div class="fade-line firstcall-line">Hi…</div>
    </div>
    <div class="tap-hint">tap to continue</div>
  `;

  sceneAnimations[idx] = (scene) => {
    const lines = scene.querySelectorAll('.firstcall-line');
    gsap.fromTo(lines,
      { opacity: 0, y: 20, scale: 0.95, filter: 'blur(6px)' },
      {
        opacity: 1, y: 0, scale: 1, filter: 'blur(0px)',
        duration: 1.2, ease: 'power2.out', stagger: 1.5, delay: 0.5,
      }
    );
  };

  return el;
}

// ========================================
// SCENE 7 – CALLING TRANSITION
// ========================================
function createCallingTransition(idx) {
  const el = document.createElement('div');
  el.className = 'scene scene-firstcall';

  el.innerHTML = `
    <div class="firstcall-text">
      <div class="fade-line firstcall-line dim">And just like that…</div>
      <div class="fade-line firstcall-line">Something changed.</div>
    </div>
    <div class="tap-hint">tap to continue</div>
  `;

  sceneAnimations[idx] = (scene) => {
    const lines = scene.querySelectorAll('.firstcall-line');
    const tl = gsap.timeline();
    tl.fromTo(lines[0],
      { opacity: 0, y: 20, filter: 'blur(6px)' },
      { opacity: 0.7, y: 0, filter: 'blur(0px)', duration: 1.2, ease: 'power2.out', delay: 0.4 }
    )
    .fromTo(lines[1],
      { opacity: 0, y: 20, scale: 0.9, filter: 'blur(8px)' },
      { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 1.4, ease: 'power3.out' },
      '+=0.5'
    );
    AudioManager.tryAutoStart();
  };

  return el;
}

// ========================================
// SCENE 8 – STILL TALKING
// ========================================
let timerInterval = null;

function createStillTalkingScene(idx) {
  const el = document.createElement('div');
  el.className = 'scene scene-stilltalking';

  el.innerHTML = `
    <div class="timer-label">call duration</div>
    <div class="timer-display">00:00:00</div>
    <div class="still-text">
      <div class="fade-line still-line">That call…</div>
      <div class="fade-line still-line">never really ended.</div>
    </div>
    <div class="tap-hint">tap to continue</div>
  `;

  sceneAnimations[idx] = (scene) => {
    animateTimer(scene);
    staggerLines(scene, '.still-line', 1.0, 4.5);
  };

  return el;
}

function animateTimer(scene) {
  const display = scene.querySelector('.timer-display');
  const targets = [
    { h: 0, m: 5, s: 12 },
    { h: 12, m: 45, s: 33 },
    { h: 240, m: 12, s: 9 },
    { text: '∞' },
  ];

  const pad = (n, w = 2) => String(n).padStart(w, '0');
  let step = 0;

  function nextStep() {
    if (step >= targets.length) return;
    const t = targets[step];

    // Animate out
    gsap.to(display, {
      opacity: 0, scale: 0.8, y: -10, duration: 0.3, ease: 'power2.in',
      onComplete: () => {
        if (t.text) {
          display.textContent = t.text;
          display.style.fontSize = 'clamp(48px, 14vw, 80px)';
          display.classList.add('infinity');
        } else {
          display.textContent = `${pad(t.h)}:${pad(t.m)}:${pad(t.s)}`;
        }
        // Animate in
        gsap.fromTo(display,
          { opacity: 0, scale: 1.2, y: 10 },
          { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'back.out(1.4)' }
        );
      }
    });

    step++;
    if (step < targets.length) {
      setTimeout(nextStep, 1200);
    }
  }

  setTimeout(nextStep, 600);
}

// ========================================
// SCENE 9 – WEDDING REVEAL
// ========================================
function createWeddingRevealScene(idx) {
  const el = document.createElement('div');
  el.className = 'scene scene-reveal';

  // Confetti
  let confettiHTML = '<div class="confetti-container">';
  const colors = ['#FFD700', '#FF69B4', '#FFF', '#C9A84C', '#E8A0BF', '#FF6B6B', '#4ECDC4'];
  for (let i = 0; i < 40; i++) {
    const left = Math.random() * 100;
    const dur = 2 + Math.random() * 3;
    const delay = Math.random() * 4;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = 5 + Math.random() * 8;
    const shape = Math.random() > 0.5 ? '50%' : '2px';
    confettiHTML += `<div class="confetti-piece" style="left:${left}%;width:${size}px;height:${size}px;background:${color};border-radius:${shape};animation-duration:${dur}s;animation-delay:${delay}s"></div>`;
  }
  confettiHTML += '</div>';

  el.innerHTML = `
    ${confettiHTML}
    <div class="reveal-text">
      <div class="fade-line reveal-line">Now…</div>
      <div class="fade-line reveal-line">We're starting our forever.</div>
      <div class="fade-line reveal-names">Karthic <span class="heart">❤️</span> Prathyusha</div>
    </div>
    <div class="tap-hint" style="color:rgba(11,11,15,0.4)">tap to continue</div>
  `;

  sceneAnimations[idx] = (scene) => {
    const lines = scene.querySelectorAll('.reveal-text .fade-line');
    const tl = gsap.timeline();

    tl.fromTo(lines[0],
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.3 }
    )
    .fromTo(lines[1],
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
      '+=0.4'
    )
    .fromTo(lines[2],
      { opacity: 0, scale: 0.6, y: 20 },
      { opacity: 1, scale: 1, y: 0, duration: 1, ease: 'elastic.out(1, 0.5)' },
      '+=0.3'
    );

    // Sparkles burst after names reveal
    setTimeout(() => spawnSparkles(scene, 15), 2500);
  };

  return el;
}

// ========================================
// SCENE 10 – EVENT DETAILS
// ========================================
function createEventDetailsScene(idx) {
  const el = document.createElement('div');
  el.className = 'scene scene-events';

  el.innerHTML = `
    <div class="event-card" data-card="1">
      <div class="event-type">Reception</div>
      <div class="event-date">22 April 2026</div>
      <div class="event-time">6:30 PM – 10:00 PM</div>
      <div class="event-venue">Annalakshmi Banquet Hall</div>
      <div class="event-location">Chetpet, Chennai</div>
    </div>
    <div class="event-card" data-card="2">
      <div class="event-type">Wedding Ceremony</div>
      <div class="event-date">23 April 2026</div>
      <div class="event-time">7:30 AM – 9:00 AM</div>
      <div class="event-venue">MA Murugan Temple</div>
      <div class="event-location">Maduravoyal, Chennai</div>
    </div>
    <div class="tap-hint">tap to continue</div>
  `;

  sceneAnimations[idx] = (scene) => {
    const cards = scene.querySelectorAll('.event-card');
    gsap.fromTo(cards,
      { opacity: 0, y: 50, rotateX: 12, scale: 0.92 },
      {
        opacity: 1, y: 0, rotateX: 0, scale: 1,
        duration: 0.8, ease: 'power3.out',
        stagger: 0.35, delay: 0.3,
      }
    );
  };

  return el;
}

// ========================================
// SCENE 11 – FINAL
// ========================================
function createFinalScene(idx) {
  const el = document.createElement('div');
  el.className = 'scene scene-final';

  el.innerHTML = `
    <div class="final-text">
      <div class="fade-line final-line">We would love for you to join us<br>as we continue our story…</div>
    </div>
    <div class="final-buttons">
      <button class="final-btn primary" id="btn-replay">
        <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
        Replay Story
      </button>
      <a class="final-btn" id="btn-calendar" href="#" target="_blank">
        <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M10 14l2 2 4-4"/></svg>
        Add to Calendar
      </a>
      <a class="final-btn" id="btn-location-reception" href="https://maps.google.com/?q=Annalakshmi+Banquet+Hall+Chetpet+Chennai" target="_blank" rel="noopener">
        <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
        Reception Location
      </a>
      <a class="final-btn" id="btn-location-wedding" href="https://maps.google.com/?q=MA+Murugan+Temple+Maduravoyal+Chennai" target="_blank" rel="noopener">
        <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
        Wedding Location
      </a>
    </div>
  `;

  // Event handlers
  setTimeout(() => {
    el.querySelector('#btn-replay').addEventListener('click', (e) => {
      e.stopPropagation();
      replayStory();
    });

    el.querySelector('#btn-calendar').addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      downloadCalendar();
    });

    el.querySelectorAll('#btn-location-reception, #btn-location-wedding').forEach(btn => {
      btn.addEventListener('click', (e) => e.stopPropagation());
    });
  }, 0);

  sceneAnimations[idx] = (scene) => {
    const line = scene.querySelector('.final-line');
    const buttons = scene.querySelectorAll('.final-btn');
    const tl = gsap.timeline({ delay: 0.3 });

    tl.fromTo(line,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
    )
    .fromTo(buttons,
      { opacity: 0, y: 20, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'back.out(1.4)', stagger: 0.15 },
      '-=0.3'
    );
  };

  return el;
}

// ── Replay ──
function replayStory() {
  // Remove active from all
  app.querySelectorAll('.scene.active').forEach(s => s.classList.remove('active'));
  currentScene = 0;
  chatMsgIndex = 0;
  isTransitioning = false;

  // Reset chat messages visibility
  app.querySelectorAll('.msg, .chat-timestamp').forEach(m => m.classList.remove('visible'));
  // Reset all fade lines
  app.querySelectorAll('.fade-line').forEach(l => l.classList.remove('visible'));
  // Reset event cards
  app.querySelectorAll('.event-card').forEach(c => c.classList.remove('visible'));
  // Reset timer
  const timerDisplay = app.querySelector('.timer-display');
  if (timerDisplay) {
    timerDisplay.textContent = '00:00:00';
    timerDisplay.style.fontSize = '';
  }
  // Restore call scene
  const callScene = app.querySelector('.scene[data-scene="4"]');
  if (callScene) {
    const parent = callScene.parentNode;
    const newCall = createTheCallScene(4);
    newCall.dataset.scene = '4';
    parent.replaceChild(newCall, callScene);
  }

  activateScene(0);
}

// ── Calendar (.ics) ──
function downloadCalendar() {
  const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Wedding//Invite//EN
BEGIN:VEVENT
DTSTART:20260422T183000
DTEND:20260422T220000
SUMMARY:Karthic & Prathyusha - Reception
LOCATION:Annalakshmi Banquet Hall, Chetpet, Chennai
DESCRIPTION:Wedding Reception of Karthic & Prathyusha
END:VEVENT
BEGIN:VEVENT
DTSTART:20260423T073000
DTEND:20260423T090000
SUMMARY:Karthic & Prathyusha - Wedding Ceremony
LOCATION:MA Murugan Temple, Maduravoyal, Chennai
DESCRIPTION:Wedding Ceremony of Karthic & Prathyusha
END:VEVENT
END:VCALENDAR`;

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'karthic-prathyusha-wedding.ics';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── Sparkle Helper ──
function spawnSparkles(container, count = 8) {
  let sparkleContainer = container.querySelector('.sparkle-container');
  if (!sparkleContainer) {
    sparkleContainer = document.createElement('div');
    sparkleContainer.className = 'sparkle-container';
    container.appendChild(sparkleContainer);
  }
  for (let i = 0; i < count; i++) {
    const spark = document.createElement('div');
    spark.className = 'sparkle';
    const size = 3 + Math.random() * 5;
    spark.style.width = size + 'px';
    spark.style.height = size + 'px';
    spark.style.left = (10 + Math.random() * 80) + '%';
    spark.style.top = (10 + Math.random() * 80) + '%';
    sparkleContainer.appendChild(spark);

    gsap.fromTo(spark,
      { opacity: 0, scale: 0 },
      {
        opacity: 1, scale: 1, duration: 0.4,
        delay: i * 0.15,
        ease: 'back.out(3)',
        onComplete: () => {
          gsap.to(spark, {
            opacity: 0, scale: 0, y: -20, duration: 0.6,
            ease: 'power2.in',
            onComplete: () => spark.remove()
          });
        }
      }
    );
  }
}

// ── Start ──
document.addEventListener('DOMContentLoaded', init);
