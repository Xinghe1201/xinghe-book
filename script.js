// 页面初始化标志（提前声明，供 renderPage 使用）
let galaxyInitialized = false;
let roseInitialized = false;
let gardenInitialized = false;
let chronicleInitialized = false;
// =====================
// Supabase 初始化
// =====================
const SUPABASE_URL = 'https://tvvtwbbfmafzxoocidwi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2dnR3YmJmbWFmenhvb2NpZHdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg4NjM2MDksImV4cCI6MjEwNDQzOTYwOX0.cbqWvTrBIXHzuZhkGcSPGR6HoRJ60pXyjd-iT2kEZ4g';

let supabaseClient = null;
try {
  if (window.supabase) {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('Supabase 连接成功');
  } else {
    console.warn('Supabase CDN 未加载');
  }
} catch (err) {
  console.error('Supabase 初始化失败:', err);
}

// =====================
// 浏览器指纹
// =====================
function getDeviceFingerprint() {
  let fp = localStorage.getItem('xinghe_device_fp');
  if (fp) return fp;

  const canvas = document.createElement('canvas');
  canvas.width = 200;
  canvas.height = 50;
  const ctx = canvas.getContext('2d');
  ctx.textBaseline = 'top';
  ctx.font = '14px Arial';
  ctx.fillStyle = '#f60';
  ctx.fillRect(0, 0, 200, 50);
  ctx.fillStyle = '#069';
  ctx.fillText('星河 ✦', 10, 15);
  const canvasData = canvas.toDataURL();

  const raw = [
    canvasData,
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
  ].join('|');

  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash << 5) - hash) + raw.charCodeAt(i);
    hash |= 0;
  }

  fp = 'fp_' + Math.abs(hash).toString(36) + '_' + Math.random().toString(36).slice(2, 8);
  localStorage.setItem('xinghe_device_fp', fp);
  return fp;
}

// =====================
// 翻书逻辑
// =====================
let pageElement;
let backBtn;

const pages = ['cover', 'rose', 'galaxy', 'garden', 'forum'];
const templates = {
  cover: document.getElementById('template-cover'),
  rose: document.getElementById('template-rose'),
  galaxy: document.getElementById('template-galaxy'),
  garden: document.getElementById('template-garden'),
  forum: document.getElementById('template-forum'),
};

let currentPage = 0;
let isAnimating = false;

function renderPage() {
  const pageName = pages[currentPage];
  const template = templates[pageName];
  if (!template) {
    console.warn('找不到模板:', pageName);
    return;
  }
  const content = template.content.cloneNode(true);

  pageElement.innerHTML = '';
  pageElement.appendChild(content);

  if (pageName === 'cover') {
    pageElement.style.background = 'linear-gradient(145deg, #1e2a4a, #3a4a6b 50%, #8c9bb5)';
  } else if (pageName === 'rose') {
    pageElement.style.background = 'linear-gradient(135deg, #1a2440, #2c3e5e)';
  } else if (pageName === 'galaxy') {
    pageElement.style.background = 'linear-gradient(135deg, #0a1020, #1c2a44)';
  } else if (pageName === 'garden') {
    pageElement.style.background = 'linear-gradient(135deg, #16202e, #233a52)';
  } else if (pageName === 'forum') {
    pageElement.style.background = 'linear-gradient(135deg, #1c2838, #2e4058)';
  }

  if (currentPage === 0) {
    backBtn.classList.add('hidden');
  } else {
    backBtn.classList.remove('hidden');
  }
  // 每次翻页都重置初始化标志，让 canvas 重新绘制
  if (pageName === 'galaxy') {
    galaxyInitialized = false;
    setTimeout(initGalaxy, 100);
  } else if (pageName === 'rose') {
    roseInitialized = false;
    setTimeout(initRose, 100);
  } else if (pageName === 'garden') {
    gardenInitialized = false;
    setTimeout(initGarden, 100);
  } else if (pageName === 'forum') {
    chronicleInitialized = false;
    setTimeout(initChronicle, 100);
  }
}

function nextPage() {
  if (isAnimating || currentPage >= pages.length - 1) return;
  isAnimating = true;

  pageElement.classList.add('flipping');

  setTimeout(() => {
    currentPage++;
    renderPage();
    pageElement.classList.remove('flipping');
    pageElement.animate(
      [
        { transform: 'rotateY(25deg) translateX(40px)', opacity: 0.3 },
        { transform: 'rotateY(0deg) translateX(0)', opacity: 1 }
      ],
      { duration: 600, easing: 'cubic-bezier(0.25, 0.8, 0.3, 1)' }
    );
    isAnimating = false;
  }, 400);
}

function prevPage() {
  if (isAnimating || currentPage <= 0) return;
  isAnimating = true;

  pageElement.classList.add('flipping-back');

  setTimeout(() => {
    currentPage--;
    renderPage();
    pageElement.classList.remove('flipping-back');
    pageElement.animate(
      [
        { transform: 'rotateY(-25deg) translateX(-40px)', opacity: 0.3 },
        { transform: 'rotateY(0deg) translateX(0)', opacity: 1 }
      ],
      { duration: 600, easing: 'cubic-bezier(0.25, 0.8, 0.3, 1)' }
    );
    isAnimating = false;
  }, 400);
}


document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') {
    nextPage();
  } else if (e.key === 'ArrowLeft') {
    prevPage();
  }
});

let touchStartX = 0;
document.addEventListener('touchstart', (e) => {
  touchStartX = e.touches[0].clientX;
});

document.addEventListener('touchend', (e) => {
  const touchEndX = e.changedTouches[0].clientX;
  const diff = touchStartX - touchEndX;

  if (Math.abs(diff) > 50) {
    if (diff > 0) {
      nextPage();
    } else {
      prevPage();
    }
  }
});

// =====================
// 星空页
// =====================
let galaxyCtx = null;
let galaxyCanvas = null;
let userStars = [];
let backgroundStars = [];
let shootingStars = [];
let mouseX = -999;
let mouseY = -999;
let hoveredStar = null;
let activeBubble = null;
let meteorShowerActive = false;
let meteorQueue = [];
let activeMeteors = [];

function initGalaxy() {
  if (galaxyInitialized) return;
  galaxyInitialized = true;

  // ★ 清空旧数据，避免重复累加
  userStars = [];
  backgroundStars = [];
  shootingStars = [];
  activeMeteors = [];
  hoveredStar = null;
  activeBubble = null;

  galaxyCanvas = document.getElementById('galaxyCanvas');
  if (!galaxyCanvas) return;

  const container = galaxyCanvas.parentElement;
  galaxyCanvas.width = container.clientWidth;
  galaxyCanvas.height = container.clientHeight;
  galaxyCtx = galaxyCanvas.getContext('2d');

  generateBackgroundStars();
  updateGalaxyStatus();
  bindGalaxyInput();
  loadStarsFromDatabase();
  galaxyLoop();

  galaxyCanvas.addEventListener('mousemove', (e) => {
    const rect = galaxyCanvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;

    let found = null;
    for (const star of userStars) {
      const dx = mouseX - star.x;
      const dy = mouseY - star.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < Math.max(star.r + 10, 14)) {
        found = star;
        break;
      }
    }

    hoveredStar = found;
    galaxyCanvas.style.cursor = found ? 'pointer' : 'default';
  });

  galaxyCanvas.addEventListener('mouseleave', () => {
    mouseX = -999;
    mouseY = -999;
    hoveredStar = null;
    galaxyCanvas.style.cursor = 'default';
  });

  let lastBlankClickTime = 0;

  galaxyCanvas.addEventListener('click', (e) => {
    if (hoveredStar) {
      e.stopPropagation();
      showStarBubble(hoveredStar);
      lastBlankClickTime = 0;
      return;
    }
    hideStarBubble();
    const now = Date.now();
    if (now - lastBlankClickTime < 600) {
      lastBlankClickTime = 0;
    } else {
      lastBlankClickTime = now;
      e.stopPropagation();
    }
  });

  window.addEventListener('resize', () => {
    if (galaxyCanvas && galaxyCanvas.parentElement) {
      galaxyCanvas.width = galaxyCanvas.parentElement.clientWidth;
      galaxyCanvas.height = galaxyCanvas.parentElement.clientHeight;
      generateBackgroundStars();
    }
  });
}

function generateBackgroundStars() {
  backgroundStars = [];
  const count = Math.floor(galaxyCanvas.width * galaxyCanvas.height / 1800);
  for (let i = 0; i < count; i++) {
    backgroundStars.push({
      x: Math.random() * galaxyCanvas.width,
      y: Math.random() * galaxyCanvas.height,
      r: Math.random() * 1.2 + 0.3,
      alpha: Math.random() * 0.5 + 0.2,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      twinklePhase: Math.random() * Math.PI * 2,
      tint: Math.random() > 0.7 ? 'rgba(180, 200, 255, ' : 'rgba(220, 230, 255, '
    });
  }
}

function bindGalaxyInput() {
  const input = document.getElementById('galaxyInput');
  const submitBtn = document.getElementById('galaxySubmit');
  if (!input || !submitBtn) return;

   async function submitMessage() {
    const message = input.value.trim();
    if (!message) return;

    // 检查是否在收集期
    const now = new Date();
    const month = now.getMonth() + 1;
    const isCollecting = (month === 10 || month === 11);
    if (!isCollecting) {
      showGalaxyToast('现在不是收集期，暂时不能留言哦');
      return;
    }
    if (!supabaseClient) {
      createRisingStar(message);
      input.value = '';
      return;
    }

    const deviceId = getDeviceFingerprint();
    const currentYear = new Date().getFullYear();

    try {
      const { data: existing, error: queryError } = await supabaseClient
        .from('star_messages')
        .select('id')
        .eq('device_id', deviceId)
        .eq('year', currentYear);

      if (queryError) {
        console.error('查询失败:', queryError);
        return;
      }

      if (existing && existing.length > 0) {
        showGalaxyToast('你已经留过一颗星星了，明年再来吧 ✦');
        return;
      }

      const { data, error } = await supabaseClient
        .from('star_messages')
        .insert([{ device_id: deviceId, message: message, year: currentYear }]);

      if (error) {
        console.error('写入失败:', error);
        showGalaxyToast('写入失败，请稍后再试');
        return;
      }

      createRisingStar(message);
      input.value = '';
      console.log('写入成功:', data);
    } catch (err) {
      console.error('连接出错:', err);
    }
  }

  submitBtn.addEventListener('click', submitMessage);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') submitMessage();
  });
}

async function loadStarsFromDatabase() {
  if (!supabaseClient) return;
  try {
    const currentYear = new Date().getFullYear();
    const { data, error } = await supabaseClient
      .from('star_messages')
      .select('*')
      .eq('year', currentYear)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('读取留言失败:', error);
      return;
    }
    if (data && data.length > 0) {
      data.forEach(record => addExistingStar(record.message));
      console.log('已加载', data.length, '条历史留言');
    }
  } catch (err) {
    console.error('加载星星出错:', err);
  }
}

function createRisingStar(message) {
  const canvas = galaxyCanvas;
  const targetX = Math.random() * canvas.width * 0.8 + canvas.width * 0.1;
  const targetY = Math.random() * canvas.height * 0.55 + canvas.height * 0.08;
  userStars.push({
    x: canvas.width / 2,
    y: canvas.height + 20,
    targetX, targetY,
    r: 2.2 + Math.random() * 1.5,
    message, alpha: 0, rising: true, progress: 0,
    riseDuration: 120 + Math.random() * 80,
    glowPulse: Math.random() * Math.PI * 2
  });
}

function addExistingStar(message) {
  const canvas = galaxyCanvas;
  userStars.push({
    x: Math.random() * canvas.width * 0.8 + canvas.width * 0.1,
    y: Math.random() * canvas.height * 0.55 + canvas.height * 0.08,
    targetX: 0, targetY: 0,
    r: 2.2 + Math.random() * 1.5,
    message, alpha: 1, rising: false, progress: 1,
    riseDuration: 0,
    glowPulse: Math.random() * Math.PI * 2
  });
}

function showStarBubble(star) {
  hideStarBubble();
  const container = galaxyCanvas.parentElement;
  const bubble = document.createElement('div');
  bubble.className = 'star-bubble';
  bubble.textContent = star.message;
  const canvasRect = galaxyCanvas.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();
  bubble.style.left = (canvasRect.left - containerRect.left + star.x) + 'px';
  bubble.style.top = (canvasRect.top - containerRect.top + star.y - 10) + 'px';
  container.appendChild(bubble);
  requestAnimationFrame(() => bubble.classList.add('show'));
  activeBubble = bubble;
  setTimeout(hideStarBubble, 4000);
}

function hideStarBubble() {
  if (activeBubble && activeBubble.parentElement) activeBubble.remove();
  activeBubble = null;
}

function showGalaxyToast(text) {
  const container = galaxyCanvas.parentElement;
  const existing = container.querySelector('.galaxy-toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = 'galaxy-toast';
  toast.textContent = text;
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

function drawGalaxy() {
  const ctx = galaxyCtx;
  const w = galaxyCanvas.width;
  const h = galaxyCanvas.height;

  const gradient = ctx.createLinearGradient(0, 0, 0, h);
  gradient.addColorStop(0, '#04070f');
  gradient.addColorStop(0.45, '#091225');
  gradient.addColorStop(0.75, '#0e1a32');
  gradient.addColorStop(1, '#131f3a');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);

  drawNebula(ctx, w * 0.25, h * 0.3, 120, 'rgba(60, 90, 160, 0.06)');
  drawNebula(ctx, w * 0.7, h * 0.6, 150, 'rgba(100, 120, 200, 0.05)');

  backgroundStars.forEach(star => {
    const twinkle = Math.sin(star.twinklePhase) * 0.3 + 0.7;
    const alpha = star.alpha * twinkle;
    star.twinklePhase += star.twinkleSpeed;
    ctx.fillStyle = star.tint + alpha + ')';
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
    ctx.fill();
  });

  userStars.forEach(star => {
    if (star.rising) {
      star.progress += 1 / star.riseDuration;
      if (star.progress >= 1) { star.progress = 1; star.rising = false; }
      const eased = 1 - Math.pow(1 - star.progress, 3);
      star.x = star.x + (star.targetX - star.x) * eased;
      star.y = star.y + (star.targetY - star.y) * eased;
      star.alpha = eased;
    }
    star.glowPulse += 0.02;
    const dx = mouseX - star.x, dy = mouseY - star.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const hoverProximity = Math.max(0, 1 - dist / 30);
    const isHovered = (star === hoveredStar);
    const hoverScale = 1 + hoverProximity * 0.6 + (isHovered ? 0.3 : 0);
    const pulse = Math.sin(star.glowPulse) * 0.25 + 0.75;
    const baseAlpha = star.alpha;
    const glowRadius = star.r * hoverScale * 4 * pulse + 6;
    const glow = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, glowRadius);
    glow.addColorStop(0, 'rgba(210, 225, 255, ' + (0.45 * baseAlpha) + ')');
    glow.addColorStop(0.4, 'rgba(150, 175, 220, ' + (0.15 * baseAlpha) + ')');
    glow.addColorStop(1, 'rgba(150, 175, 220, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(star.x, star.y, glowRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(235, 242, 255, ' + baseAlpha + ')';
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.r * hoverScale, 0, Math.PI * 2);
    ctx.fill();
  });

  if (Math.random() < 0.003 && shootingStars.length < 2) {
    shootingStars.push({
      x: Math.random() * w * 0.6 + w * 0.2,
      y: Math.random() * h * 0.2,
      vx: -3 - Math.random() * 3,
      vy: 1.5 + Math.random() * 2,
      life: 0,
      maxLife: 60 + Math.random() * 30
    });
  }

  shootingStars.forEach((meteor, index) => {
    meteor.x += meteor.vx;
    meteor.y += meteor.vy;
    meteor.life++;
    if (meteor.life > meteor.maxLife) { shootingStars.splice(index, 1); return; }
    const lifeRatio = 1 - meteor.life / meteor.maxLife;
    const tailX = meteor.x - meteor.vx * 8;
    const tailY = meteor.y - meteor.vy * 8;
    const meteorGradient = ctx.createLinearGradient(meteor.x, meteor.y, tailX, tailY);
    meteorGradient.addColorStop(0, 'rgba(255, 255, 255, ' + lifeRatio + ')');
    meteorGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.strokeStyle = meteorGradient;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(meteor.x, meteor.y);
    ctx.lineTo(tailX, tailY);
    ctx.stroke();
  });
}

function drawNebula(ctx, x, y, radius, color) {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function galaxyLoop() {
  if (!galaxyInitialized) return;
  drawGalaxy();
  requestAnimationFrame(galaxyLoop);
}

function updateGalaxyStatus() {
  const status = document.getElementById('galaxyStatus');
  if (!status) return;

  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();

  let season = 'idle';

  // 12月1日~7日：流星雨回看期
  if (month === 12 && day >= 1 && day <= 7) {
    season = 'meteor';
  }
  // 10月1日~11月30日：收集期
  else if (month === 10 || month === 11) {
    season = 'collecting';
  }
  // 其他：沉寂
  else {
    season = 'idle';
  }

  const inputWrap = document.getElementById('galaxyInputWrap');

  if (season === 'collecting') {
    status.textContent = '留言收集期 · 写下你的星光';
    if (inputWrap) inputWrap.classList.remove('hidden');
  } else if (season === 'meteor') {
    status.textContent = '✦ 流星雨进行中 ✦';
    if (inputWrap) inputWrap.classList.add('hidden');
  } else {
    status.textContent = '静候下一次收集期';
    if (inputWrap) inputWrap.classList.add('hidden');
  }
}

// =====================
// 玫瑰页
// =====================
let roseCtx = null;
let roseCanvas = null;
let roseNodes = [];
let roseThorns = [];
let roseHoveredThorn = null;
let roseMouseX = -999;
let roseMouseY = -999;
let roseParticles = [];
let roseRotation = 0;

function initRose() {
  if (roseInitialized) return;
  roseInitialized = true;

  // ★ 清空旧数据
  roseParticles = [];
  roseThorns = [];
  roseHoveredThorn = null;

  roseCanvas = document.getElementById('roseCanvas');
  if (!roseCanvas) return;
  const container = roseCanvas.parentElement;
  roseCanvas.width = container.clientWidth;
  roseCanvas.height = container.clientHeight;
  roseCtx = roseCanvas.getContext('2d');
  generate3DRose();
  bindRoseEvents();
  loadRoseNodes().then(() => roseLoop());
}

function generate3DRose() {
  roseParticles = [];
  const w = roseCanvas.width;
  const h = roseCanvas.height;
  const centerX = w / 2;
  const centerY = h * 0.42;
  const baseScale = Math.min(w, h) * 0.26;
  const layerCount = 5;

  for (let layer = 0; layer < layerCount; layer++) {
    const layerRatio = layer / (layerCount - 1);
    const petalCount = 5 + layer;
    const rotationOffset = layer * 0.5;
    const layerScale = baseScale * (1 - layerRatio * 0.65);
    const layerYOffset = layerRatio * 0.1;
    const particlesPerLayer = 2400;

    for (let i = 0; i < particlesPerLayer; i++) {
      const petalIndex = Math.floor(Math.random() * petalCount);
      const petalAngleBase = (petalIndex / petalCount) * Math.PI * 2 + rotationOffset;
      const t = Math.pow(Math.random(), 0.65);
      const widthT = Math.random() * 2 - 1;
      const petalLength = 0.5 + (1 - layerRatio) * 0.3;
      const widthAtT = Math.sin(t * Math.PI) * 0.55 + 0.08;
      const lateral = widthT * widthAtT;
      const r = t * petalLength;
      const angle = petalAngleBase + lateral * 0.9;
      const x3d = Math.cos(angle) * r;
      const z3d = Math.sin(angle) * r;
      const curl = Math.pow(t, 1.6) * 0.55;
      const innerLift = layerRatio * 0.35;
      const y3d = curl * (1 - layerRatio * 0.3) + innerLift;

      roseParticles.push({
        x3d, y3d, z3d, x: 0, y: 0,
        r: 0.7 + Math.random() * 1.0,
        hue: 210 + Math.random() * 20,
        light: 62 + Math.random() * 25,
        alpha: 0.4 + Math.random() * 0.4,
        phase: Math.random() * Math.PI * 2,
        speed: 0.01 + Math.random() * 0.02,
        baseScale: layerScale,
        centerX, centerY: centerY - layerYOffset * layerScale,
      });
    }
  }

  const coreCount = 250;
  for (let i = 0; i < coreCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = Math.pow(Math.random(), 0.6) * 0.15;
    roseParticles.push({
      x3d: Math.sin(phi) * Math.cos(theta) * r,
      y3d: Math.cos(phi) * r + 0.1,
      z3d: Math.sin(phi) * Math.sin(theta) * r,
      x: 0, y: 0,
      r: 0.8 + Math.random() * 0.8,
      hue: 210 + Math.random() * 15,
      light: 82 + Math.random() * 15,
      alpha: 0.7 + Math.random() * 0.3,
      phase: Math.random() * Math.PI * 2,
      speed: 0.02 + Math.random() * 0.03,
      baseScale: baseScale * 0.4,
      centerX, centerY,
    });
  }
}

function project3D(p, rotation) {
  const cosR = Math.cos(rotation);
  const sinR = Math.sin(rotation);
  const x1 = p.x3d * cosR - p.z3d * sinR;
  const z1 = p.x3d * sinR + p.z3d * cosR;
  const y1 = p.y3d;
  const tiltX = -Math.PI / 4;
  const cosT = Math.cos(tiltX);
  const sinT = Math.sin(tiltX);
  const x2 = x1;
  const y2 = y1 * cosT - z1 * sinT;
  const z2 = y1 * sinT + z1 * cosT;
  const perspective = 1.8;
  const zDepth = 1.2 + z2 * 0.5;
  const projScale = perspective / Math.max(0.4, zDepth);
  return {
    x: p.centerX + x2 * p.baseScale * 0.85 * projScale,
    y: p.centerY - y2 * p.baseScale * 0.85 * projScale - z2 * p.baseScale * 0.1,
    scale: projScale,
    z: z2
  };
}

function layoutThorns() {
  if (!roseCanvas) return;
  const w = roseCanvas.width;
  const h = roseCanvas.height;
  const centerX = w / 2;
  const stemTop = h * 0.48;
  const stemBottom = h * 0.92;
  const thornCount = 5;
  roseThorns = [];

  for (let i = 0; i < thornCount; i++) {
    const t = (i + 0.5) / thornCount;
    const y = stemTop + (stemBottom - stemTop) * t;
    const side = i % 2 === 0 ? -1 : 1;
    const stemCurve = Math.sin(t * Math.PI) * 6;
    const stemX = centerX + stemCurve;
    const node = roseNodes[i] || { title: '待填写', content: '这个故事还没有被写下。' };
    roseThorns.push({
      x: stemX + side * 2,
      y,
      side,
      size: 7,
      node,
      index: i,
      pulse: Math.random() * Math.PI * 2
    });
  }
}

let roseNodesCache = null;
async function loadRoseNodes() {
  if (roseNodesCache) {
    roseNodes = roseNodesCache;
    layoutThorns();
    return;
  }
  if (!supabaseClient) { layoutThorns(); return; }
  try {
    const { data, error } = await supabaseClient
      .from('rose_nodes').select('*').order('position', { ascending: true });
    if (error) { console.error('读取玫瑰节点失败:', error); layoutThorns(); return; }
    if (data && data.length > 0) {
      roseNodes = data;
      roseNodesCache = data;
    }
    layoutThorns();
  } catch (err) {
    console.error('加载玫瑰节点出错:', err);
    layoutThorns();
  }
}

function bindRoseEvents() {
  roseCanvas.addEventListener('mousemove', (e) => {
    const rect = roseCanvas.getBoundingClientRect();
    roseMouseX = e.clientX - rect.left;
    roseMouseY = e.clientY - rect.top;
    let found = null;
    for (const thorn of roseThorns) {
      const dx = roseMouseX - thorn.x;
      const dy = roseMouseY - thorn.y;
      if (Math.sqrt(dx * dx + dy * dy) < 18) { found = thorn; break; }
    }
    roseHoveredThorn = found;
    roseCanvas.style.cursor = found ? 'pointer' : 'default';
  });

  roseCanvas.addEventListener('mouseleave', () => {
    roseMouseX = -999; roseMouseY = -999;
    roseHoveredThorn = null;
    roseCanvas.style.cursor = 'default';
  });

  let lastBlankTime = 0;
  roseCanvas.addEventListener('click', (e) => {
    if (roseHoveredThorn) {
      e.stopPropagation();
      showRoseCard(roseHoveredThorn);
      lastBlankTime = 0;
      return;
    }
    hideRoseCard();
    const now = Date.now();
    if (now - lastBlankTime < 600) {
      lastBlankTime = 0;
    } else {
      lastBlankTime = now;
      e.stopPropagation();
    }
  });
}

function showRoseCard(thorn) {
  hideRoseCard();
  const container = roseCanvas.parentElement;
  const card = document.createElement('div');
  card.className = 'rose-card';
  const title = document.createElement('h3');
  title.textContent = thorn.node.title || '无题';
  const content = document.createElement('p');
  content.textContent = thorn.node.content || '';
  card.appendChild(title);
  card.appendChild(content);
 

  // 垂直居中显示，避免被上下裁掉
  card.style.top = '50%';
  card.style.transform = 'translateY(-50%)';

  // 水平位置：刺在左 → 卡片在右；刺在右 → 卡片在左
  if (thorn.side === -1) {
    card.style.left = '55%';
  } else {
    card.style.left = '5%';
  }
  container.appendChild(card);
  requestAnimationFrame(() => card.classList.add('show'));
  setTimeout(() => { if (card.parentElement) card.remove(); }, 5000);
}

function hideRoseCard() {
  const container = roseCanvas.parentElement;
  if (!container) return;
  container.querySelectorAll('.rose-card').forEach(el => el.remove());
}

function drawRose() {
  const ctx = roseCtx;
  const w = roseCanvas.width;
  const h = roseCanvas.height;
  ctx.clearRect(0, 0, w, h);
  const centerX = w / 2;
  const stemTop = h * 0.48;
  const stemBottom = h * 0.92;

  // 花茎
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(centerX, stemTop);
  for (let y = stemTop; y <= stemBottom; y += 4) {
    const t = (y - stemTop) / (stemBottom - stemTop);
    ctx.lineTo(centerX + Math.sin(t * Math.PI) * 6, y);
  }
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(centerX, stemTop);
  for (let y = stemTop; y <= stemBottom; y += 4) {
    const t = (y - stemTop) / (stemBottom - stemTop);
    ctx.lineTo(centerX + Math.sin(t * Math.PI) * 6, y);
  }
  ctx.stroke();

  // 玫瑰粒子
  roseRotation += 0.003;
  const projected = roseParticles.map(p => {
    const proj = project3D(p, roseRotation);
    return { p, proj };
  }).sort((a, b) => a.proj.z - b.proj.z);

  projected.forEach(({ p, proj }) => {
    p.phase += p.speed;
    const breath = Math.sin(p.phase) * 0.3;
    const px = proj.x + Math.cos(p.phase * 0.7) * 0.8;
    const py = proj.y + Math.sin(p.phase * 0.5) * 0.8;
    const size = p.r * proj.scale * (1 + breath * 0.2);
    const depthAlpha = Math.min(1, Math.max(0.2, (proj.z + 0.5) / 1.5));
    const alpha = p.alpha * depthAlpha;
    ctx.fillStyle = 'hsla(' + p.hue + ', 70%, ' + p.light + '%, ' + (alpha * 0.2) + ')';
    ctx.beginPath();
    ctx.arc(px, py, size * 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'hsla(' + p.hue + ', 75%, ' + (p.light + 12) + '%, ' + alpha + ')';
    ctx.beginPath();
    ctx.arc(px, py, size, 0, Math.PI * 2);
    ctx.fill();
  });

  // 刺
  roseThorns.forEach(thorn => {
    thorn.pulse += 0.03;
    const isHovered = thorn === roseHoveredThorn;
    const glowScale = isHovered ? 1.8 : 1 + Math.sin(thorn.pulse) * 0.1;
    const glow = ctx.createRadialGradient(thorn.x, thorn.y, 0, thorn.x, thorn.y, 14 * glowScale);
    if (isHovered) {
      glow.addColorStop(0, 'rgba(255, 230, 180, 0.7)');
      glow.addColorStop(1, 'rgba(255, 230, 180, 0)');
    } else {
      glow.addColorStop(0, 'rgba(180, 210, 255, 0.18)');
      glow.addColorStop(1, 'rgba(180, 210, 255, 0)');
    }
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(thorn.x, thorn.y, 14 * glowScale, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(thorn.x, thorn.y);
    const len = thorn.size * 0.9;
    const wid = thorn.size * 0.18;
    const grad = ctx.createLinearGradient(0, 0, thorn.side * len, 0);
    if (isHovered) {
      grad.addColorStop(0, 'rgba(255, 245, 210, 0.9)');
      grad.addColorStop(1, 'rgba(255, 220, 160, 0.5)');
    } else {
      grad.addColorStop(0, 'rgba(220, 235, 255, 0.55)');
      grad.addColorStop(1, 'rgba(160, 190, 230, 0.2)');
    }
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(0, -wid);
    ctx.lineTo(thorn.side * len, 0);
    ctx.lineTo(0, wid);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  });
}

function roseLoop() {
  if (!roseInitialized) return;
  drawRose();
  requestAnimationFrame(roseLoop);
}

// =====================
// 花园页
// =====================
let gardenCanvas = null;
let gardenCtx = null;
let gardenFlowers = [];
let gardenProgress = { sunshine: 0, water: 0 };
let gardenBreath = 0;
let gardenActionLock = false;

function initGarden() {
  if (gardenInitialized) return;
  gardenInitialized = true;

  // ★ 清空旧数据
  gardenFlowers = [];
  gardenActionLock = false;

  gardenCanvas = document.getElementById('gardenCanvas');
  if (!gardenCanvas) return;
  const container = gardenCanvas.parentElement;
  gardenCanvas.width = container.clientWidth;
  gardenCanvas.height = container.clientHeight;
  gardenCtx = gardenCanvas.getContext('2d');
  loadGardenData();
  bindGardenEvents();
  updateGardenUI();
  gardenLoop();
  window.addEventListener('resize', () => {
    if (gardenCanvas && gardenCanvas.parentElement) {
      gardenCanvas.width = gardenCanvas.parentElement.clientWidth;
      gardenCanvas.height = gardenCanvas.parentElement.clientHeight;
    }
  });
}

function getTodayKey() {
  const d = new Date();
  return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
}

function hasActedToday() {
  // ★★★ 测试模式：true = 无限点，false = 一天一次 ★★★
  const GARDEN_TEST_MODE = false;
  if (GARDEN_TEST_MODE) return false;

  const key = 'garden_last_action_' + getDeviceFingerprint();
  const last = localStorage.getItem(key) || localStorage.getItem('garden_last_action');
  return last === getTodayKey();
}

function markActedToday() {
  const today = getTodayKey();
  localStorage.setItem('garden_last_action_' + getDeviceFingerprint(), today);
  localStorage.setItem('garden_last_action', today);
}

function updateGardenUI() {
  const btnSun = document.getElementById('btnSun');
  const btnWater = document.getElementById('btnWater');
  const status = document.getElementById('gardenStatus');
  const pSun = document.getElementById('progressSun');
  const pWater = document.getElementById('progressWater');

  if (pSun) pSun.textContent = '☀ ' + gardenProgress.sunshine + ' / 5';
  if (pWater) pWater.textContent = '💧 ' + gardenProgress.water + ' / 5';

  const acted = hasActedToday();

  // 单边满了就锁住那一边
  const sunLocked = acted || gardenProgress.sunshine >= 5;
  const waterLocked = acted || gardenProgress.water >= 5;

  if (btnSun) btnSun.disabled = sunLocked;
  if (btnWater) btnWater.disabled = waterLocked;

  if (status) {
    if (acted) {
      status.textContent = '今天已经贡献过啦，明天再来 ✦';
    } else if (gardenProgress.sunshine >= 5 && gardenProgress.water >= 5) {
      status.textContent = '花要开了...';
    } else if (gardenProgress.sunshine >= 5) {
      status.textContent = '阳光已经足够，再浇点水吧';
    } else if (gardenProgress.water >= 5) {
      status.textContent = '水已经足够，再来点阳光吧';
    } else {
      status.textContent = '选择今天为花做点什么';
    }
  }
}

async function loadGardenData() {
  if (!supabaseClient) return;
  try {
    const { data: flowers, error: err1 } = await supabaseClient
      .from('garden_plants').select('*').order('created_at', { ascending: true });

    if (err1) {
      console.error('读取花海失败:', err1);
    } else if (flowers && flowers.length > 0) {
      gardenFlowers = flowers.map((row, index) => ({
        id: row.id,
        plant_type: row.plant_type || 'blue',
        x: seededRandom(index * 7 + 1),
        y: seededRandom(index * 13 + 5),
        phase: Math.random() * Math.PI * 2,
        size: 0.85 + Math.random() * 0.3,
      }));
      console.log('已加载', gardenFlowers.length, '朵花');
    }

    const { data: progress, error: err2 } = await supabaseClient
      .from('garden_progress').select('*').order('id', { ascending: true }).limit(1);

    if (err2) {
      console.error('读取进度失败:', err2);
    } else if (progress && progress.length > 0) {
      gardenProgress.sunshine = progress[0].sunshine || 0;
      gardenProgress.water = progress[0].water || 0;
      gardenProgress.id = progress[0].id;
    }
  } catch (err) {
    console.error('加载花园出错:', err);
  }
  updateGardenUI();
}

function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function bindGardenEvents() {
  const btnSun = document.getElementById('btnSun');
  const btnWater = document.getElementById('btnWater');
  if (btnSun) {
    btnSun.addEventListener('click', async (e) => {
      e.stopPropagation();
      await contribute('sunshine');
    });
  }
  if (btnWater) {
    btnWater.addEventListener('click', async (e) => {
      e.stopPropagation();
      await contribute('water');
    });
  }
  let lastClick = 0;
  gardenCanvas.addEventListener('click', (e) => {
    const now = Date.now();
    if (now - lastClick < 600) {
      lastClick = 0;
    } else {
      lastClick = now;
      e.stopPropagation();
    }
  });
}

async function contribute(type) {
  if (gardenActionLock) return;
  if (hasActedToday()) { updateGardenUI(); return; }

  // 单边满了就拦截
  if (type === 'sunshine' && gardenProgress.sunshine >= 5) {
    updateGardenUI();
    return;
  }
  if (type === 'water' && gardenProgress.water >= 5) {
    updateGardenUI();
    return;
  }

  gardenActionLock = true;

  if (type === 'sunshine') gardenProgress.sunshine++;
  if (type === 'water') gardenProgress.water++;

  markActedToday();
  updateGardenUI();

  // ★ 本地立即判断开花，不等数据库
  if (gardenProgress.sunshine >= 5 && gardenProgress.water >= 5) {
    await bloomFlower();
    gardenActionLock = false;
    return;
  }

  // 数据库同步进度
  if (supabaseClient && gardenProgress.id) {
    try {
      const updates = {};
      updates[type] = gardenProgress[type];
      updates.updated_at = new Date().toISOString();
      await supabaseClient.from('garden_progress').update(updates).eq('id', gardenProgress.id);
    } catch (err) {
      console.error('进度同步失败:', err);
    }
  }

  gardenActionLock = false;
}

async function bloomFlower() {
  const r = Math.random();
  let color;
  if (r < 0.65) color = 'blue';
  else if (r < 0.82) color = 'white';
  else if (r < 0.94) color = 'purple';
  else color = 'yellow';

  // ★ 先本地开花 + 重置进度
  gardenFlowers.push({
    plant_type: color,
    x: Math.random(),
    y: Math.random(),
    phase: Math.random() * Math.PI * 2,
    size: 0.85 + Math.random() * 0.3,
  });
  gardenProgress.sunshine = 0;
  gardenProgress.water = 0;
  updateGardenUI();
  console.log('一朵新花绽放！颜色：', color);

  // 数据库同步（异步，失败也不影响本地显示）
  if (!supabaseClient) return;
  const currentYear = new Date().getFullYear();
  try {
    await supabaseClient.from('garden_plants').insert([{
      plant_type: color,
      growth_value: 1,
      stage: 1,
      year: currentYear,
      device_id: getDeviceFingerprint(),
    }]);

    if (gardenProgress.id) {
      await supabaseClient.from('garden_progress').update({
        sunshine: 0,
        water: 0,
        updated_at: new Date().toISOString()
      }).eq('id', gardenProgress.id);
    }
  } catch (err) {
    console.error('开花同步失败:', err);
  }
}

function gardenLoop() {
  if (!gardenInitialized) return;
  drawGarden();
  requestAnimationFrame(gardenLoop);
}

function drawGarden() {
  const ctx = gardenCtx;
  const w = gardenCanvas.width;
  const h = gardenCanvas.height;
  gardenBreath += 0.02;

  const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
  skyGrad.addColorStop(0, '#060a14');
  skyGrad.addColorStop(0.5, '#0c1526');
  skyGrad.addColorStop(1, '#101c32');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, w, h);

  for (let i = 0; i < 60; i++) {
    const sx = (i * 137.5) % w;
    const sy = (i * 73.3) % (h * 0.5);
    const alpha = 0.2 + Math.sin(gardenBreath * 0.5 + i) * 0.15;
    ctx.fillStyle = 'rgba(200, 220, 255, ' + alpha + ')';
    ctx.fillRect(sx, sy, 2, 2);
  }

  const flowerAreaTop = h * 0.3;
  const flowerAreaBottom = h * 0.95;

  gardenFlowers.forEach((flower, index) => {
    const fx = flower.x * w;
    const fy = flowerAreaTop + flower.y * (flowerAreaBottom - flowerAreaTop);
    drawGardenFlower(ctx, fx, fy, flower, index);
  });
}

function drawGardenFlower(ctx, x, y, flower, index) {
  const colorMap = {
    blue:   { core: '#88c8ff', glow: 'rgba(120, 180, 255, 0.5)', outer: '#4a88cc' },
    white:  { core: '#f0f5ff', glow: 'rgba(230, 240, 255, 0.6)', outer: '#b8c8e8' },
    purple: { core: '#c8a0ff', glow: 'rgba(180, 140, 255, 0.5)', outer: '#8866cc' },
    yellow: { core: '#ffe8a0', glow: 'rgba(255, 220, 140, 0.55)', outer: '#ccaa55' },
  };
  const c = colorMap[flower.plant_type] || colorMap.blue;
  const breath = Math.sin(gardenBreath + flower.phase) * 0.08;
  const scale = flower.size * (1 + breath);
  const petalCount = 5 + (index % 3);
  const petalLen = 10 * scale;
  const petalWid = 5 * scale;

  const glow = ctx.createRadialGradient(x, y, 0, x, y, petalLen * 2.2);
  glow.addColorStop(0, c.glow);
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, petalLen * 2.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = c.core;
  for (let i = 0; i < petalCount; i++) {
    const angle = (i / petalCount) * Math.PI * 2 + flower.phase * 0.3;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.ellipse(petalLen * 0.6, 0, petalLen * 0.5, petalWid * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.fillStyle = c.outer;
  ctx.beginPath();
  ctx.arc(x, y, petalWid * 0.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.beginPath();
  ctx.arc(x, y, petalWid * 0.3, 0, Math.PI * 2);
  ctx.fill();
}

// =====================
// 编年史页
// =====================

function initChronicle() {
  if (chronicleInitialized) return;
  chronicleInitialized = true;
  loadChronicleData();
}

async function loadChronicleData() {
  if (!supabaseClient) return;

  const currentYear = new Date().getFullYear();
  const timeline = document.getElementById('chronicleTimeline');
  const statStars = document.getElementById('statStars');
  const statFlowers = document.getElementById('statFlowers');
  const statNodes = document.getElementById('statNodes');

  try {
    const [starsRes, flowersRes, statsRes] = await Promise.all([
      supabaseClient.from('star_messages').select('*').eq('year', currentYear).order('created_at', { ascending: true }),
      supabaseClient.from('garden_plants').select('*').order('created_at', { ascending: true }),
      supabaseClient.from('site_stats').select('visit_count').eq('id', 1).single()
    ]);

    const stars = starsRes.data || [];
    const flowers = flowersRes.data || [];
    const visits = statsRes.data ? statsRes.data.visit_count : 0;

    if (statStars) statStars.textContent = stars.length;
    if (statFlowers) statFlowers.textContent = flowers.length;
    if (statNodes) statNodes.textContent = visits;

    const events = [];

    stars.slice(0, 8).forEach(star => {
      events.push({
        date: star.created_at,
        title: '一颗星星被点亮',
        content: '「' + star.message + '」',
        type: 'star'
      });
    });

    if (flowers.length > 0) {
      events.push({
        date: flowers[0].created_at,
        title: '花海里的第一朵花',
        content: '有人在这片花园里种下了第一朵花。',
        type: 'flower'
      });
    }
    if (flowers.length >= 10) {
      events.push({
        date: flowers[9].created_at,
        title: '第十朵花绽放',
        content: '花园已经长出 10 朵花。',
        type: 'flower'
      });
    }
    if (flowers.length >= 50) {
      events.push({
        date: flowers[49].created_at,
        title: '第五十朵花绽放',
        content: '花园变成了小花海。',
        type: 'flower'
      });
    }
    if (flowers.length >= 100) {
      events.push({
        date: flowers[99].created_at,
        title: '第一百朵花绽放',
        content: '一百朵花，一百份思念。',
        type: 'flower'
      });
    }

    events.sort((a, b) => new Date(a.date) - new Date(b.date));

    if (timeline) {
      if (events.length === 0) {
        timeline.innerHTML = '<div class="chronicle-loading">这一年才刚刚开始。</div>';
      } else {
        timeline.innerHTML = '';
        events.forEach(ev => {
          const div = document.createElement('div');
          div.className = 'chronicle-event type-' + ev.type;
          const d = new Date(ev.date);
          const dateStr = d.getFullYear() + '.' +
            String(d.getMonth() + 1).padStart(2, '0') + '.' +
            String(d.getDate()).padStart(2, '0');
          div.innerHTML =
            '<div class="chronicle-event-date">' + dateStr + '</div>' +
            '<div class="chronicle-event-title">' + ev.title + '</div>' +
            '<div class="chronicle-event-content">' + ev.content + '</div>';
          timeline.appendChild(div);
        });
      }
    }
  } catch (err) {
    console.error('编年史加载失败:', err);
    if (timeline) {
      timeline.innerHTML = '<div class="chronicle-loading">暂时无法翻开这段记忆。</div>';
    }
  }
}

// 启动
pageElement = document.getElementById('page');
backBtn = document.getElementById('backBtn');

renderPage();

// 记录一次访问
recordVisit();

async function recordVisit() {
  if (!supabaseClient) return;
  try {
    const { data } = await supabaseClient
      .from('site_stats')
      .select('visit_count')
      .eq('id', 1)
      .single();
    if (data) {
      await supabaseClient
        .from('site_stats')
        .update({ visit_count: (data.visit_count || 0) + 1 })
        .eq('id', 1);
    }
  } catch (err) {
    console.error('记录访问失败:', err);
  }
}

pageElement.addEventListener('click', (e) => {
  if (
    e.target.closest('#galaxyInputWrap') ||
    e.target.closest('#galaxyInput') ||
    e.target.closest('#galaxySubmit') ||
    e.target.closest('#btnSun') ||
    e.target.closest('#btnWater') ||
    e.target.closest('.garden-btn') ||
    e.target.closest('.rose-card') ||
    e.target.closest('.chronicle-container')
  ) {
    return;
  }
  nextPage();
});

backBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  prevPage();
});
