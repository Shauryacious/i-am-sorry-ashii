// ░░ scene controller ░░
const scenes = [...document.querySelectorAll('.scene')];
let current = 1;
function go(n) {
  if (n === current) return;
  document.getElementById('scene-' + current)?.classList.remove('active');
  current = n;
  const next = document.getElementById('scene-' + n);
  next?.classList.add('active');
  if (n === 2) rainName();
  if (n === 5) typeLetter();
  if (n === 6) burstPetals(80);
}

document.querySelectorAll('[data-next]').forEach(b =>
  b.addEventListener('click', () => go(+b.dataset.next))
);

// ░░ SCENE 1: door ░░
const door = document.getElementById('door');
door.addEventListener('click', () => {
  door.classList.add('opening');
  navigator.vibrate?.(15);
  setTimeout(() => go(2), 700);
});

// ░░ SCENE 2: name rain ░░
function rainName() {
  const host = document.getElementById('rainName');
  if (host.dataset.done) return;
  host.dataset.done = '1';
  const letters = 'Ashii';
  [...letters].forEach((ch, i) => {
    const s = document.createElement('span');
    s.textContent = ch;
    host.appendChild(s);
    setTimeout(() => s.classList.add('drop'), 180 * i + 200);
  });
}

// ░░ SCENE 3: runaway no-button ░░
const noBtn = document.getElementById('noBtn');
const yesBtn = document.getElementById('yesBtn');
const arena = noBtn.parentElement;
const noHint = document.getElementById('noHint');
let dodgeCount = 0;

function dodge() {
  const a = arena.getBoundingClientRect();
  const padX = 60, padY = 40;
  const x = padX + Math.random() * Math.max(0, a.width - padX * 2);
  const y = padY + Math.random() * Math.max(0, a.height - padY * 2);
  noBtn.style.left = x + 'px';
  noBtn.style.top = y + 'px';
  dodgeCount++;
  if (dodgeCount === 2) noHint.textContent = '(it really doesn\'t want to be pressed)';
  if (dodgeCount === 4) noHint.textContent = '(neither do i, honestly)';
  if (dodgeCount >= 6) {
    noBtn.style.opacity = '0.2';
    noBtn.style.pointerEvents = 'none';
    noHint.textContent = '(ok, fine — there\'s only one option)';
    yesBtn.classList.add('grow');
  }
  navigator.vibrate?.(8);
}
noBtn.addEventListener('mouseenter', dodge);
noBtn.addEventListener('touchstart', e => { if (e.cancelable) e.preventDefault(); dodge(); }, { passive: false });
noBtn.addEventListener('click', e => { e.preventDefault(); dodge(); });

yesBtn.addEventListener('click', () => {
  burstPetals(40);
  navigator.vibrate?.([10, 40, 10]);
  setTimeout(() => go(4), 350);
});

// ░░ SCENE 4: swipe cards ░░
const stack = document.getElementById('cardStack');

function poseStack() {
  const remaining = [...stack.querySelectorAll('.card')];
  // first child = visually on top. don't touch pointer-events here:
  // parent .scene controls interactivity via .active. inline auto would leak.
  remaining.forEach((c, i) => {
    c.style.transform = `translateY(${i * 6}px) scale(${1 - i * 0.03})`;
    c.style.zIndex = remaining.length - i;
  });
}
poseStack();

let startX = 0, startY = 0, dx = 0, dy = 0, dragging = false, lockedAxis = null, activeCard = null;

function topCard() { return stack.firstElementChild; }

function onStart(e) {
  const card = topCard();
  if (!card) return;
  if (e.target.closest && !e.target.closest('.card')) return;
  // only respond if the touched element is or is inside the top card
  if (!card.contains(e.target)) return;
  activeCard = card;
  dragging = true;
  lockedAxis = null;
  const t = e.touches?.[0] ?? e;
  startX = t.clientX; startY = t.clientY; dx = 0; dy = 0;
  activeCard.style.transition = 'none';
}
function onMove(e) {
  if (!dragging || !activeCard) return;
  const t = e.touches?.[0] ?? e;
  dx = t.clientX - startX;
  dy = t.clientY - startY;
  if (!lockedAxis && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) {
    lockedAxis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
  }
  if (lockedAxis === 'x') {
    if (e.cancelable) e.preventDefault();
    activeCard.style.transform = `translateX(${dx}px) rotate(${dx * 0.05}deg)`;
  }
}
function onEnd() {
  if (!dragging || !activeCard) { dragging = false; return; }
  dragging = false;
  const card = activeCard;
  activeCard = null;
  card.style.transition = '';
  if (lockedAxis === 'x' && Math.abs(dx) > 90) {
    card.classList.add(dx > 0 ? 'gone' : 'gone-left');
    navigator.vibrate?.(10);
    setTimeout(() => {
      card.remove();
      if (topCard()) {
        poseStack();
      } else {
        setTimeout(() => go(5), 350);
      }
    }, 450);
  } else {
    card.style.transform = '';
    poseStack();
  }
  dx = dy = 0; lockedAxis = null;
}

stack.addEventListener('touchstart', onStart, { passive: true });
stack.addEventListener('touchmove', onMove, { passive: false });
stack.addEventListener('touchend', onEnd);
stack.addEventListener('touchcancel', onEnd);
stack.addEventListener('mousedown', onStart);
window.addEventListener('mousemove', onMove);
window.addEventListener('mouseup', onEnd);

// ░░ SCENE 5: typed letter ░░
const letterText =
`my ashii baby,

i'm not writing this to be forgiven —
i'm writing it because you deserve the words,
spelled out slow, no rushing, no excuses.

you are the softest part of every loud day.
you are the reason my chest forgets to be tired.
and i was careless with something sacred.

i see you. i'm learning you. i'm choosing you —
not just on the easy days, but especially the hard ones.

if you let me, i'll be gentler tomorrow,
and the day after, and the one after that.`;

function typeLetter() {
  const out = document.getElementById('letterBody');
  if (out.dataset.done) { document.getElementById('toFinale').classList.remove('hidden'); return; }
  out.dataset.done = '1';
  let i = 0;
  const tick = () => {
    out.textContent = letterText.slice(0, i);
    i++;
    if (i <= letterText.length) {
      const ch = letterText[i - 1];
      const delay = ch === '\n' ? 220 : ch === ',' || ch === '.' ? 90 : 28 + Math.random() * 28;
      setTimeout(tick, delay);
    } else {
      out.classList.add('done');
      document.getElementById('toFinale').classList.remove('hidden');
    }
  };
  tick();
}

// ░░ SCENE 6: forgive ░░
document.getElementById('forgiveBtn').addEventListener('click', () => {
  document.getElementById('forgiveBtn').classList.add('hidden');
  document.getElementById('forgivenMsg').classList.remove('hidden');
  burstPetals(160);
  navigator.vibrate?.([20, 50, 20, 50, 80]);
});

// ░░ ambient petal canvas ░░
const cvs = document.getElementById('petals');
const ctx = cvs.getContext('2d');
let W, H, petals = [];
function resize() { W = cvs.width = innerWidth * devicePixelRatio; H = cvs.height = innerHeight * devicePixelRatio; cvs.style.width = innerWidth + 'px'; cvs.style.height = innerHeight + 'px'; }
resize(); addEventListener('resize', resize);

function makePetal(burst) {
  return {
    x: Math.random() * W,
    y: burst ? H * 0.5 + (Math.random() - 0.5) * 100 * devicePixelRatio : -20,
    vx: (Math.random() - 0.5) * (burst ? 6 : 1) * devicePixelRatio,
    vy: (burst ? -Math.random() * 8 - 2 : 0.6 + Math.random() * 1.2) * devicePixelRatio,
    r: (4 + Math.random() * 6) * devicePixelRatio,
    a: Math.random() * Math.PI * 2,
    va: (Math.random() - 0.5) * 0.06,
    hue: 330 + Math.random() * 30,
    life: burst ? 240 : Infinity,
  };
}
for (let i = 0; i < 22; i++) petals.push(makePetal(false));

function burstPetals(n) { for (let i = 0; i < n; i++) petals.push(makePetal(true)); }

function loop() {
  ctx.clearRect(0, 0, W, H);
  petals = petals.filter(p => p.life > 0 && p.y < H + 40 * devicePixelRatio);
  for (const p of petals) {
    p.x += p.vx; p.y += p.vy; p.vy += 0.04 * devicePixelRatio; p.a += p.va;
    if (p.life !== Infinity) p.life--;
    ctx.save();
    ctx.translate(p.x, p.y); ctx.rotate(p.a);
    ctx.fillStyle = `hsla(${p.hue}, 80%, 75%, 0.85)`;
    ctx.beginPath();
    ctx.ellipse(0, 0, p.r, p.r * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  // keep ambient rain topped up
  while (petals.filter(p => p.life === Infinity).length < 22) petals.push(makePetal(false));
  requestAnimationFrame(loop);
}
loop();
