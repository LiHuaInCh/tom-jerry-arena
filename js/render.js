/* 猫鼠大作战 — Canvas 渲染层 */
(function () {
  const TJ = (window.TJ = window.TJ || {});
  const D = TJ.DATA;
  const TAU = Math.PI * 2;
  const OUT = '#33211A';
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const FONT = '"Microsoft YaHei","PingFang SC","Noto Sans SC",system-ui,sans-serif';

  function rr(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function ellipse(ctx, x, y, rx, ry, rot) {
    ctx.beginPath();
    ctx.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot || 0, 0, TAU);
  }

  /* ---------------- 静态背景 ---------------- */
  function buildBackground() {
    const BG_SCALE = D.W > 3000 ? 0.5 : 1;
    const c = document.createElement('canvas');
    c.width = Math.round(D.W * BG_SCALE); c.height = Math.round(D.H * BG_SCALE);
    const x = c.getContext('2d');
    x.scale(BG_SCALE, BG_SCALE);
    let seed = 20240501;
    const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);

    x.fillStyle = '#E9D3B0';
    x.fillRect(0, 0, D.W, D.H);
    const rowH = 96;
    for (let row = 0, y = 0; y < D.H; y += rowH, row++) {
      x.fillStyle = row % 2 ? '#E5CDA7' : '#EAD5B3';
      x.fillRect(0, y, D.W, rowH);
      x.strokeStyle = 'rgba(122,85,50,0.20)';
      x.lineWidth = 2;
      x.beginPath(); x.moveTo(0, y); x.lineTo(D.W, y); x.stroke();
      const off = (row % 3) * 260;
      for (let px = -off; px < D.W; px += 520) {
        x.beginPath(); x.moveTo(px, y); x.lineTo(px, y + rowH); x.stroke();
      }
    }
    for (let i = 0; i < 2600; i++) {
      x.fillStyle = 'rgba(120,80,45,' + (0.02 + rnd() * 0.05) + ')';
      x.fillRect(rnd() * D.W, rnd() * D.H, 8 + rnd() * 40, 1.5);
    }

    const cx = D.W / 2, cy = D.H / 2 + 20;
    x.save();
    x.translate(cx, cy);
    x.rotate(-0.02);
    ellipse(x, 0, 0, 470, 330);
    x.fillStyle = 'rgba(90,45,30,0.18)'; x.fill();
    ellipse(x, 0, -8, 470, 330);
    x.fillStyle = '#C4574A'; x.fill();
    x.lineWidth = 22; x.strokeStyle = '#E8C48F'; x.stroke();
    ellipse(x, 0, -8, 400, 268);
    x.lineWidth = 5; x.strokeStyle = 'rgba(255,240,210,0.55)'; x.stroke();
    x.globalAlpha = 0.20;
    x.strokeStyle = '#7C2F27'; x.lineWidth = 3;
    for (let r = 60; r < 300; r += 62) { ellipse(x, 0, -8, r * 1.28, r); x.stroke(); }
    x.globalAlpha = 1;
    x.restore();

    const g = x.createLinearGradient(0, 0, 0, 90);
    g.addColorStop(0, 'rgba(64,38,22,0.55)');
    g.addColorStop(1, 'rgba(64,38,22,0)');
    x.fillStyle = g; x.fillRect(0, 0, D.W, 90);
    const g2 = x.createLinearGradient(0, D.H, 0, D.H - 90);
    g2.addColorStop(0, 'rgba(64,38,22,0.5)');
    g2.addColorStop(1, 'rgba(64,38,22,0)');
    x.fillStyle = g2; x.fillRect(0, D.H - 90, D.W, 90);
    x.strokeStyle = '#6B4A32'; x.lineWidth = 26; x.strokeRect(8, 8, D.W - 16, D.H - 16);
    x.strokeStyle = '#8A6444'; x.lineWidth = 6; x.strokeRect(22, 22, D.W - 44, D.H - 44);

    for (let i = 0; i < 26; i++) {
      const px = 120 + rnd() * (D.W - 240), py = 120 + rnd() * (D.H - 240);
      x.save(); x.translate(px, py); x.rotate(rnd() * TAU);
      x.fillStyle = 'rgba(120,80,45,0.10)';
      ellipse(x, 0, 0, 9, 7); x.fill();
      for (let k = 0; k < 4; k++) { ellipse(x, -9 + k * 6, -10, 3, 4); x.fill(); }
      x.restore();
    }
    for (let i = 0; i < 20; i++) {
      x.fillStyle = 'rgba(230,170,50,0.35)';
      const px = 300 + rnd() * 1200, py = 300 + rnd() * 800;
      x.beginPath(); x.moveTo(px, py); x.lineTo(px + 9, py + 4); x.lineTo(px + 3, py + 9); x.closePath(); x.fill();
    }
    return c;
  }

  /* ---------------- 场景道具 ---------------- */
  function drawObstacles(ctx, g) {
    for (const o of g.obstacles) {
      ctx.save();
      if (o.type === 'rect') {
        ctx.fillStyle = 'rgba(74,44,24,0.20)';
        rr(ctx, o.x + 10, o.y + 14, o.w, o.h, 16); ctx.fill();
        if (o.kind === 'table') {
          rr(ctx, o.x, o.y, o.w, o.h, 16);
          ctx.fillStyle = '#B07A48'; ctx.fill();
          ctx.strokeStyle = '#774B27'; ctx.lineWidth = 4; ctx.stroke();
          rr(ctx, o.x + 12, o.y + 12, o.w - 24, o.h - 24, 10);
          ctx.fillStyle = '#C9915B'; ctx.fill();
          ctx.strokeStyle = 'rgba(110,68,35,0.5)'; ctx.lineWidth = 2;
          for (let i = 1; i < 5; i++) {
            ctx.beginPath(); ctx.moveTo(o.x + 20, o.y + 12 + i * (o.h - 24) / 5);
            ctx.lineTo(o.x + o.w - 20, o.y + 12 + i * (o.h - 24) / 5); ctx.stroke();
          }
          ctx.fillStyle = '#F4EBDC'; ellipse(ctx, o.x + o.w * 0.3, o.y + o.h * 0.45, 40, 25); ctx.fill();
          ctx.strokeStyle = '#CDBFA8'; ctx.lineWidth = 3; ctx.stroke();
          ctx.fillStyle = '#E9C04B'; ellipse(ctx, o.x + o.w * 0.3, o.y + o.h * 0.45, 19, 11); ctx.fill();
          ctx.fillStyle = '#D96C5B'; ellipse(ctx, o.x + o.w * 0.72, o.y + o.h * 0.55, 17, 17); ctx.fill();
          ctx.fillStyle = '#7FBF6A'; ellipse(ctx, o.x + o.w * 0.72, o.y + o.h * 0.3, 6, 6); ctx.fill();
        } else if (o.kind === 'sofa') {
          rr(ctx, o.x, o.y, o.w, o.h, 22);
          ctx.fillStyle = '#6E93AC'; ctx.fill();
          ctx.strokeStyle = '#4B6C82'; ctx.lineWidth = 4; ctx.stroke();
          rr(ctx, o.x + 14, o.y + 14, o.w / 2 - 22, o.h - 28, 14);
          ctx.fillStyle = '#87A9C0'; ctx.fill(); ctx.strokeStyle = '#5B7E95'; ctx.lineWidth = 3; ctx.stroke();
          rr(ctx, o.x + o.w / 2 + 8, o.y + 14, o.w / 2 - 22, o.h - 28, 14);
          ctx.fillStyle = '#7FA1B7'; ctx.fill(); ctx.stroke();
        } else if (o.kind === 'crate') {
          rr(ctx, o.x, o.y, o.w, o.h, 10);
          ctx.fillStyle = '#C08B52'; ctx.fill();
          ctx.strokeStyle = '#7E552A'; ctx.lineWidth = 5; ctx.stroke();
          ctx.lineWidth = 7; ctx.strokeStyle = '#9C6C38';
          ctx.beginPath(); ctx.moveTo(o.x + 14, o.y + 14); ctx.lineTo(o.x + o.w - 14, o.y + o.h - 14);
          ctx.moveTo(o.x + o.w - 14, o.y + 14); ctx.lineTo(o.x + 14, o.y + o.h - 14); ctx.stroke();
        } else if (o.kind === 'bookshelf') {
          rr(ctx, o.x, o.y, o.w, o.h, 8);
          ctx.fillStyle = '#8A5B33'; ctx.fill();
          ctx.strokeStyle = '#5E3A1D'; ctx.lineWidth = 4; ctx.stroke();
          rr(ctx, o.x + 7, o.y + 7, o.w - 14, o.h - 14, 4);
          ctx.fillStyle = '#3E2715'; ctx.fill();
          const cols = ['#C4574A', '#4E7F52', '#E9C04B', '#4B7DA8', '#B06BE0', '#D96C5B'];
          for (let s = 0; s < 4; s++) {
            const sy = o.y + 14 + s * (o.h - 28) / 4;
            ctx.fillStyle = '#6B4426';
            ctx.fillRect(o.x + 8, sy + (o.h - 28) / 4 - 6, o.w - 16, 4);
            for (let b = 0; b < 5; b++) {
              ctx.fillStyle = cols[(s * 5 + b) % cols.length];
              const bw = (o.w - 20) / 5 - 3;
              ctx.fillRect(o.x + 11 + b * ((o.w - 20) / 5), sy + 2 + (b % 2) * 3, bw, (o.h - 28) / 4 - 12);
            }
          }
        } else if (o.kind === 'chair') {
          rr(ctx, o.x - 6, o.y - 16, o.w + 12, o.h + 16, 14);
          ctx.fillStyle = '#8A5B33'; ctx.fill();
          ctx.strokeStyle = '#5E3A1D'; ctx.lineWidth = 4; ctx.stroke();
          rr(ctx, o.x + 4, o.y + 8, o.w - 8, o.h - 8, 10);
          ctx.fillStyle = '#D2A06B'; ctx.fill();
          ctx.strokeStyle = '#8A5B33'; ctx.lineWidth = 3; ctx.stroke();
        } else if (o.kind === 'blocks') {
          const cols = ['#E4572E', '#4B7DA8', '#E9C04B', '#4E7F52'];
          for (let i = 0; i < 4; i++) {
            const bx = o.x + (i % 2) * 66, by = o.y + Math.floor(i / 2) * 44;
            rr(ctx, bx, by, 58, 38, 6);
            ctx.fillStyle = cols[i]; ctx.fill();
            ctx.strokeStyle = 'rgba(50,30,15,.5)'; ctx.lineWidth = 3; ctx.stroke();
          }
        } else {
          rr(ctx, o.x, o.y, o.w, o.h, 14);
          ctx.fillStyle = '#A9764B'; ctx.fill();
          ctx.strokeStyle = '#6F4826'; ctx.lineWidth = 4; ctx.stroke();
          rr(ctx, o.x + 10, o.y + 10, o.w - 20, o.h - 20, 8);
          ctx.fillStyle = '#CEA06C'; ctx.fill();
          ctx.strokeStyle = 'rgba(110,68,35,0.45)'; ctx.lineWidth = 2;
          for (let i = 1; i < 4; i++) {
            ctx.beginPath(); ctx.moveTo(o.x + 14, o.y + 10 + i * (o.h - 20) / 4);
            ctx.lineTo(o.x + o.w - 14, o.y + 10 + i * (o.h - 20) / 4); ctx.stroke();
          }
        }
      } else {
        ctx.fillStyle = 'rgba(74,44,24,0.20)';
        ellipse(ctx, o.x + 8, o.y + 12, o.r * 1.02, o.r * 0.9); ctx.fill();
        if (o.kind === 'cheese') {
          ellipse(ctx, o.x, o.y, o.r, o.r * 0.92);
          ctx.fillStyle = '#F2C33C'; ctx.fill();
          ctx.strokeStyle = '#B8891C'; ctx.lineWidth = 4; ctx.stroke();
          ellipse(ctx, o.x, o.y - 4, o.r * 0.7, o.r * 0.62);
          ctx.fillStyle = '#FFD966'; ctx.fill();
          ctx.fillStyle = '#D9A521';
          for (let i = 0; i < 5; i++) {
            const a = i * 1.3;
            ellipse(ctx, o.x + Math.cos(a) * o.r * 0.45, o.y + Math.sin(a) * o.r * 0.4, 7, 5); ctx.fill();
          }
        } else if (o.kind === 'plant') {
          ellipse(ctx, o.x, o.y + 6, o.r * 0.62, o.r * 0.62);
          ctx.fillStyle = '#B5623E'; ctx.fill();
          ctx.strokeStyle = '#7E3F26'; ctx.lineWidth = 3; ctx.stroke();
          ctx.fillStyle = '#4E7F52';
          for (let i = 0; i < 7; i++) {
            const a = (i / 7) * TAU;
            ellipse(ctx, o.x + Math.cos(a) * o.r * 0.42, o.y - 14 + Math.sin(a) * o.r * 0.34, o.r * 0.36, o.r * 0.2, a);
            ctx.fill();
          }
        } else if (o.kind === 'bucket') {
          ellipse(ctx, o.x, o.y, o.r, o.r * 0.92);
          ctx.fillStyle = '#8FA3B8'; ctx.fill();
          ctx.strokeStyle = '#546B80'; ctx.lineWidth = 5; ctx.stroke();
          ellipse(ctx, o.x, o.y, o.r * 0.72, o.r * 0.66);
          ctx.fillStyle = '#C9D6E2'; ctx.fill();
          ctx.strokeStyle = '#6E8296'; ctx.lineWidth = 3; ctx.stroke();
          ctx.strokeStyle = '#546B80'; ctx.lineWidth = 4;
          ctx.beginPath(); ctx.arc(o.x, o.y, o.r * 0.86, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
        } else if (o.kind === 'ball') {
          ellipse(ctx, o.x, o.y, o.r, o.r);
          ctx.fillStyle = '#E4572E'; ctx.fill();
          ctx.strokeStyle = '#7A2A12'; ctx.lineWidth = 3; ctx.stroke();
          ctx.save();
          ctx.beginPath(); ctx.arc(o.x, o.y, o.r, 0, TAU); ctx.clip();
          ctx.fillStyle = '#F2C14E';
          ctx.fillRect(o.x - o.r, o.y - o.r * 0.3, o.r * 2, o.r * 0.3);
          ctx.fillStyle = '#4B7DA8';
          ctx.fillRect(o.x - o.r, o.y + o.r * 0.25, o.r * 2, o.r * 0.25);
          ctx.restore();
        } else {
          ellipse(ctx, o.x, o.y, o.r, o.r * 0.94);
          ctx.fillStyle = '#A9744A'; ctx.fill();
          ctx.strokeStyle = '#6F4826'; ctx.lineWidth = 4; ctx.stroke();
          ellipse(ctx, o.x, o.y, o.r * 0.7, o.r * 0.66);
          ctx.fillStyle = '#C79A67'; ctx.fill();
          ctx.strokeStyle = '#8A5C34'; ctx.lineWidth = 3; ctx.stroke();
        }
      }
      ctx.restore();
    }
  }

  /* ---------------- 官方立绘精灵 ---------------- */
  const spriteImg = {};
  const spriteTint = {};

  // 按需加载：57 个角色不会在开局全部下载
  function getSprite(id) {
    let im = spriteImg[id];
    if (!im) {
      im = new Image();
      im.src = 'assets/sprites/' + id + '.png';
      spriteImg[id] = im;
    }
    return im;
  }

  function makeTint(img) {
    const c = document.createElement('canvas');
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    const x = c.getContext('2d');
    x.drawImage(img, 0, 0);
    x.globalCompositeOperation = 'source-in';
    x.fillStyle = '#FF8A7A';
    x.fillRect(0, 0, c.width, c.height);
    return c;
  }

  function drawMouseSprite(ctx, m, char, img) {
    const r = m.r;
    const walk = m.walk || 0;
    const bob = Math.sin(walk) * r * 0.05;
    const h = r * 3.8;
    const w = h * img.naturalWidth / img.naturalHeight;
    const flip = Math.cos(m.facing || 0) < -0.05;

    ctx.save();
    ctx.translate(m.x, m.y + bob);
    ctx.fillStyle = 'rgba(70,40,20,0.22)';
    ellipse(ctx, 2, r * 0.96 - bob, r * 1.05, r * 0.36);
    ctx.fill();

    ctx.save();
    ctx.translate(0, r * 0.95);
    if (flip) ctx.scale(-1, 1);
    ctx.drawImage(img, -w / 2, -h, w, h);
    ctx.restore();

    if (m.hitFlash > 0) {
      if (!spriteTint[char.id]) spriteTint[char.id] = makeTint(img);
      ctx.globalAlpha = Math.min(0.85, m.hitFlash * 3);
      ctx.save();
      ctx.translate(0, r * 0.95);
      if (flip) ctx.scale(-1, 1);
      ctx.drawImage(spriteTint[char.id], -w / 2, -h, w, h);
      ctx.restore();
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }

  /* ---------------- 近身环绕武器 ---------------- */
  const orbitImgs = {};
  function orbitImg(url) {
    if (!url) return null;
    if (!orbitImgs[url]) {
      const im = new Image();
      im.src = url;
      orbitImgs[url] = im;
    }
    const im = orbitImgs[url];
    return im.complete && im.naturalWidth ? im : null;
  }

  function drawOrbit(ctx, m) {
    const w = D.weapons[m.weapon];
    if (!w || w.kind !== 'orbit') return;
    const n = (w.orbitN || 2) + (m.orbitBonus || 0);
    const R = (w.orbitR || 78) + (m.orbitRBonus || 0);
    const a0 = m.orbitA || 0;
    const img = orbitImg(w.iconImg);
    const size = 34;
    ctx.save();
    for (let i = 0; i < n; i++) {
      const a = a0 + i * Math.PI * 2 / n;
      const x = m.x + Math.cos(a) * R;
      const y = m.y + Math.sin(a) * R;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(a + Math.PI / 2);
      ctx.shadowColor = w.color || '#FFD34D';
      ctx.shadowBlur = 10;
      if (img) {
        ctx.drawImage(img, -size / 2, -size / 2, size, size);
      } else {
        ctx.fillStyle = w.color || '#C0392B';
        ctx.strokeStyle = '#3A2418';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -14);
        ctx.quadraticCurveTo(8, -6, 5, 10);
        ctx.quadraticCurveTo(0, 14, -5, 10);
        ctx.quadraticCurveTo(-8, -6, 0, -14);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
      ctx.globalAlpha = 0.18;
      ctx.fillStyle = w.color || '#FFD34D';
      ctx.beginPath();
      ctx.arc(x, y, size * 0.62, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }

  /* ---------------- 角色：老鼠 ---------------- */
  function drawMouse(ctx, m, char) {
    if (m.shieldT > 0) {
      ctx.save();
      ctx.strokeStyle = 'rgba(127,209,255,0.95)';
      ctx.lineWidth = 3;
      ellipse(ctx, m.x, m.y, m.r * 1.7, m.r * 1.25); ctx.stroke();
      ctx.restore();
    }
    if (m.growthT > 0) {
      ctx.save();
      ctx.strokeStyle = 'rgba(255,154,60,0.9)';
      ctx.lineWidth = 3;
      ellipse(ctx, m.x, m.y, m.r * 1.55, m.r * 1.15); ctx.stroke();
      ctx.restore();
    }
    if (m.invisT > 0) {
      ctx.save();
      ctx.strokeStyle = 'rgba(185,167,255,0.9)';
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 6]);
      ellipse(ctx, m.x, m.y, m.r * 1.6, m.r * 1.2); ctx.stroke();
      ctx.restore();
    }
    if (m.weapon && D.weapons[m.weapon] && D.weapons[m.weapon].kind === 'orbit') drawOrbit(ctx, m);
    if (m.subWeapon && D.weapons[m.subWeapon] && D.weapons[m.subWeapon].kind === 'orbit') {
      drawOrbit(ctx, { x: m.x, y: m.y, weapon: m.subWeapon, orbitA: m.subOrbitA || 0, orbitBonus: -(D.weapons[m.subWeapon].orbitN || 2) + 1, orbitRBonus: -26 });
    }
    const img = getSprite(char.id);
    if (img && img.complete && img.naturalWidth > 0) {
      drawMouseSprite(ctx, m, char, img);
      return;
    }
    const r = m.r;
    const walk = m.walk || 0;
    const bob = Math.sin(walk) * r * 0.05;
    ctx.save();
    ctx.translate(m.x, m.y + bob);

    ctx.fillStyle = 'rgba(70,40,20,0.22)';
    ellipse(ctx, 2, r * 0.94 - bob, r * 1.16, r * 0.4); ctx.fill();

    // 长尾巴（画在身体后面，向左侧甩出）
    ctx.strokeStyle = char.furDark;
    ctx.lineWidth = Math.max(2, r * 0.15);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-r * 0.62, r * 0.52);
    ctx.bezierCurveTo(-r * 1.45, r * 0.85, -r * 2.0, r * 0.25, -r * 1.72, -r * 0.42);
    ctx.stroke();

    // 脚
    const step = Math.sin(walk * 2) * r * 0.14;
    ctx.fillStyle = char.furDark;
    ellipse(ctx, -r * 0.4, r * 0.86 + step, r * 0.3, r * 0.17); ctx.fill();
    ellipse(ctx, r * 0.4, r * 0.86 - step, r * 0.3, r * 0.17); ctx.fill();

    // 身体
    ctx.save();
    ctx.rotate(Math.sin(walk) * 0.04);
    ellipse(ctx, 0, r * 0.2, r * 0.86, r * 0.96);
    ctx.fillStyle = char.fur; ctx.fill();
    ctx.strokeStyle = OUT; ctx.lineWidth = Math.max(2.5, r * 0.13); ctx.stroke();
    ellipse(ctx, 0, r * 0.32, r * 0.5, r * 0.58);
    ctx.fillStyle = char.belly; ctx.globalAlpha = 0.9; ctx.fill(); ctx.globalAlpha = 1;

    // 小手
    ctx.fillStyle = char.fur;
    ellipse(ctx, -r * 0.86, r * 0.1, r * 0.2, r * 0.28, -0.3); ctx.fill();
    ctx.strokeStyle = OUT; ctx.lineWidth = Math.max(1.5, r * 0.07); ctx.stroke();
    ellipse(ctx, r * 0.86, r * 0.1, r * 0.2, r * 0.28, 0.3); ctx.fill(); ctx.stroke();

    // 耳朵（大圆耳，先画在头后）
    for (const s of [-1, 1]) {
      ellipse(ctx, s * r * 0.62, -r * 0.94, r * 0.42, r * 0.44);
      ctx.fillStyle = char.fur; ctx.fill();
      ctx.strokeStyle = OUT; ctx.lineWidth = Math.max(2, r * 0.11); ctx.stroke();
      ellipse(ctx, s * r * 0.62, -r * 0.92, r * 0.24, r * 0.26);
      ctx.fillStyle = char.ear; ctx.fill();
    }

    // 头
    ellipse(ctx, 0, -r * 0.44, r * 0.78, r * 0.7);
    ctx.fillStyle = char.fur; ctx.fill();
    ctx.strokeStyle = OUT; ctx.lineWidth = Math.max(2.5, r * 0.13); ctx.stroke();

    // 眼睛
    const fx = Math.cos(m.facing || 0), fy = Math.sin(m.facing || 0);
    for (const s of [-1, 1]) {
      ellipse(ctx, s * r * 0.29, -r * 0.56, r * 0.2, r * 0.24);
      ctx.fillStyle = '#FFFDF4'; ctx.fill();
      ctx.strokeStyle = OUT; ctx.lineWidth = Math.max(1.4, r * 0.06); ctx.stroke();
      ellipse(ctx, s * r * 0.29 + fx * r * 0.06, -r * 0.56 + fy * r * 0.055, r * 0.095, r * 0.12);
      ctx.fillStyle = OUT; ctx.fill();
      ellipse(ctx, s * r * 0.29 + fx * r * 0.06 - r * 0.03, -r * 0.6 + fy * r * 0.05, r * 0.03, r * 0.035);
      ctx.fillStyle = '#FFFFFF'; ctx.fill();
    }

    // 口鼻
    ellipse(ctx, 0, -r * 0.18, r * 0.4, r * 0.29);
    ctx.fillStyle = char.belly; ctx.fill();
    ellipse(ctx, 0, -r * 0.31, r * 0.1, r * 0.075);
    ctx.fillStyle = '#47281B'; ctx.fill();
    ctx.strokeStyle = 'rgba(55,32,18,0.75)'; ctx.lineWidth = Math.max(1.2, r * 0.045);
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.24);
    ctx.lineTo(0, -r * 0.14);
    ctx.moveTo(-r * 0.09, -r * 0.13);
    ctx.quadraticCurveTo(0, -r * 0.06, r * 0.09, -r * 0.13);
    ctx.stroke();
    for (const s of [-1, 1]) {
      for (let k = 0; k < 2; k++) {
        ctx.beginPath();
        ctx.moveTo(s * r * 0.1, -r * 0.22 + k * r * 0.09);
        ctx.lineTo(s * r * 0.58, -r * 0.3 + k * r * 0.14);
        ctx.stroke();
      }
    }

    // 服装：按官方立绘还原
    if (char.id === 'swordsman') {
      ctx.fillStyle = '#3F6FB5';
      ellipse(ctx, 0, r * 0.62, r * 0.72, r * 0.46); ctx.fill();
      ctx.strokeStyle = '#27497F'; ctx.lineWidth = Math.max(2, r * 0.06); ctx.stroke();
      ctx.fillStyle = '#F4F7FB';
      ellipse(ctx, 0, r * 0.5, r * 0.15, r * 0.19); ctx.fill();
      ctx.fillStyle = '#6B4A2A';
      ctx.fillRect(-r * 0.68, r * 0.6, r * 1.36, r * 0.1);
      ctx.save(); ctx.rotate(-0.55);
      ctx.fillStyle = '#B9C6D2'; ctx.fillRect(-r * 0.05, -r * 0.1, r * 0.1, r * 0.9);
      ctx.fillStyle = '#6B4A2A'; ctx.fillRect(-r * 0.16, r * 0.72, r * 0.32, r * 0.1);
      ctx.restore();
      ctx.fillStyle = '#7B3F8C';
      ellipse(ctx, 0, -r * 1.0, r * 0.7, r * 0.16); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-r * 0.52, -r * 1.02);
      ctx.quadraticCurveTo(-r * 0.2, -r * 1.68, r * 0.48, -r * 1.06);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#5A2A68'; ctx.lineWidth = Math.max(1.5, r * 0.05); ctx.stroke();
      ctx.strokeStyle = '#FBF6EA'; ctx.lineWidth = Math.max(2, r * 0.06);
      ctx.beginPath();
      ctx.moveTo(-r * 0.7, -r * 1.06);
      ctx.quadraticCurveTo(-r * 1.24, -r * 1.52, -r * 1.32, -r * 0.9);
      ctx.stroke();
    } else if (char.id === 'robin') {
      ctx.fillStyle = '#3F7A46';
      ellipse(ctx, 0, r * 0.64, r * 0.68, r * 0.44); ctx.fill();
      ctx.strokeStyle = '#2C5733'; ctx.lineWidth = Math.max(2, r * 0.06); ctx.stroke();
      ctx.fillStyle = '#6B4A2A';
      ctx.fillRect(-r * 0.62, r * 0.62, r * 1.24, r * 0.1);
      ctx.fillStyle = '#E8C24A';
      ctx.beginPath();
      ctx.moveTo(-r * 0.86, -r * 0.92);
      ctx.quadraticCurveTo(-r * 0.1, -r * 1.95, r * 0.62, -r * 1.0);
      ctx.quadraticCurveTo(r * 0.1, -r * 1.24, -r * 0.86, -r * 0.92);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#B08A2E'; ctx.lineWidth = Math.max(2, r * 0.06); ctx.stroke();
      ctx.strokeStyle = '#E4572E'; ctx.lineWidth = Math.max(2, r * 0.05);
      ctx.beginPath();
      ctx.moveTo(r * 0.42, -r * 1.5);
      ctx.quadraticCurveTo(r * 1.2, -r * 2.0, r * 1.42, -r * 1.34);
      ctx.stroke();
    } else if (char.id === 'detective') {
      ctx.fillStyle = '#6B6257';
      ellipse(ctx, 0, r * 0.66, r * 0.58, r * 0.42); ctx.fill();
      ctx.strokeStyle = '#4A443C'; ctx.lineWidth = Math.max(2, r * 0.05); ctx.stroke();
      ctx.fillStyle = '#F4EFE6';
      ctx.beginPath();
      ctx.moveTo(0, r * 0.34); ctx.lineTo(-r * 0.16, r * 0.62); ctx.lineTo(r * 0.16, r * 0.62);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#6B6257';
      ellipse(ctx, 0, -r * 0.96, r * 0.7, r * 0.15); ctx.fill();
      ellipse(ctx, 0, -r * 1.08, r * 0.38, r * 0.22); ctx.fill();
      ctx.strokeStyle = '#4A443C'; ctx.lineWidth = Math.max(1.5, r * 0.05); ctx.stroke();
      ctx.strokeStyle = '#C9A24A'; ctx.lineWidth = Math.max(1.5, r * 0.05);
      ctx.beginPath();
      ctx.arc(r * 0.95, r * 0.1, r * 0.2, 0, TAU); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(r * 1.08, r * 0.24); ctx.lineTo(r * 1.28, r * 0.44); ctx.stroke();
    } else if (char.id === 'tuffy') {
      ctx.fillStyle = '#FBF7EE';
      ellipse(ctx, 0, r * 0.68, r * 0.56, r * 0.34); ctx.fill();
      ctx.strokeStyle = '#D9CDBB'; ctx.lineWidth = Math.max(1.4, r * 0.04); ctx.stroke();
      ctx.fillStyle = '#F08AA8';
      ellipse(ctx, -r * 0.2, -r * 1.12, r * 0.15, r * 0.1, -0.4); ctx.fill();
      ellipse(ctx, r * 0.2, -r * 1.12, r * 0.15, r * 0.1, 0.4); ctx.fill();
      ctx.fillStyle = '#E06A8C';
      ellipse(ctx, 0, -r * 1.12, r * 0.07, r * 0.07); ctx.fill();
    }

    if (m.hitFlash > 0) {
      ctx.globalAlpha = Math.min(0.75, m.hitFlash * 3);
      ctx.fillStyle = '#FF8A7A';
      ellipse(ctx, 0, 0, r * 1.08, r * 1.16); ctx.fill();
      ctx.globalAlpha = 1;
    }
    ctx.restore();
    ctx.restore();
  }

  /* ---------------- 角色：猫 ---------------- */
  function drawCat(ctx, e) {
    const r = e.r, def = e.def;
    const walk = e.walk || 0;
    const bob = Math.sin(walk) * r * 0.04;
    ctx.save();
    ctx.translate(e.x, e.y + bob);

    if (e.elite) {
      ctx.strokeStyle = e.mod === 'shield' ? '#7FD1FF' : e.mod === 'swift' ? '#FFE08A' : '#FF9BC1';
      ctx.lineWidth = 3;
      ellipse(ctx, 0, 0, r * 1.55, r * 1.15); ctx.stroke();
    }

    ctx.fillStyle = 'rgba(70,40,20,0.22)';
    ellipse(ctx, 2, r * 0.98 - bob, r * 1.1, r * 0.38); ctx.fill();

    if (def.boss) {
      ctx.save();
      ctx.strokeStyle = 'rgba(220,70,45,0.45)';
      ctx.lineWidth = Math.max(3, r * 0.07);
      ctx.setLineDash([r * 0.35, r * 0.25]);
      ctx.beginPath(); ctx.ellipse(0, r * 0.9, r * 1.35, r * 0.5, 0, 0, TAU); ctx.stroke();
      ctx.restore();
    }

    // 尾巴（短而卷）
    ctx.save();
    ctx.strokeStyle = def.furDark;
    ctx.lineWidth = Math.max(2, r * 0.11);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-r * 0.8, r * 0.78);
    ctx.bezierCurveTo(-r * 1.35, r * 0.8, -r * 1.55, r * 0.35, -r * 1.3, r * 0.05);
    ctx.stroke();
    ctx.restore();

    // 脚
    ctx.fillStyle = def.furDark;
    ellipse(ctx, -r * 0.44, r * 0.92, r * 0.3, r * 0.17); ctx.fill();
    ellipse(ctx, r * 0.44, r * 0.92, r * 0.3, r * 0.17); ctx.fill();

    // 身体（更低更宽）
    ellipse(ctx, 0, r * 0.3, r * 1.0, r * 0.86);
    ctx.fillStyle = def.fur; ctx.fill();
    ctx.strokeStyle = OUT; ctx.lineWidth = Math.max(2.5, r * 0.1); ctx.stroke();
    ellipse(ctx, 0, r * 0.46, r * 0.4, r * 0.36);
    ctx.fillStyle = def.belly; ctx.globalAlpha = 0.8; ctx.fill(); ctx.globalAlpha = 1;

    // 前爪
    ctx.fillStyle = def.fur;
    ellipse(ctx, -r * 0.76, r * 0.5, r * 0.18, r * 0.28, -0.2); ctx.fill();
    ctx.strokeStyle = OUT; ctx.lineWidth = Math.max(1.5, r * 0.06); ctx.stroke();
    ellipse(ctx, r * 0.76, r * 0.5, r * 0.18, r * 0.28, 0.2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#FFF8E7';
    for (const s of [-1, 1]) {
      for (let k = 0; k < 3; k++) {
        ellipse(ctx, s * r * 0.8 + (k - 1) * r * 0.07, r * 0.32, r * 0.03, r * 0.045); ctx.fill();
      }
    }

    // 耳朵
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(s * r * 0.3, -r * 1.02);
      ctx.quadraticCurveTo(s * r * 0.85, -r * 1.68, s * r * 0.98, -r * 0.9);
      ctx.closePath();
      ctx.fillStyle = def.fur; ctx.fill();
      ctx.strokeStyle = OUT; ctx.lineWidth = Math.max(2, r * 0.085); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(s * r * 0.48, -r * 1.0);
      ctx.quadraticCurveTo(s * r * 0.8, -r * 1.42, s * r * 0.84, -r * 0.95);
      ctx.closePath();
      ctx.fillStyle = '#E8A2A2'; ctx.fill();
    }

    // 头
    ellipse(ctx, 0, -r * 0.64, r * 0.8, r * 0.6);
    ctx.fillStyle = def.fur; ctx.fill();
    ctx.strokeStyle = OUT; ctx.lineWidth = Math.max(2.5, r * 0.1); ctx.stroke();

    // 虎斑
    ctx.strokeStyle = def.furDark; ctx.globalAlpha = 0.5;
    ctx.lineWidth = Math.max(2, r * 0.055);
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(i * r * 0.3, -r * 1.18);
      ctx.quadraticCurveTo(i * r * 0.32, -r * 1.04, i * r * 0.26, -r * 0.94);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // 眼睛
    for (const s of [-1, 1]) {
      ellipse(ctx, s * r * 0.3, -r * 0.7, r * 0.19, r * 0.15);
      ctx.fillStyle = '#F2C14E'; ctx.fill();
      ctx.strokeStyle = OUT; ctx.lineWidth = Math.max(1.4, r * 0.05); ctx.stroke();
      ellipse(ctx, s * r * 0.3, -r * 0.7, r * 0.05, r * 0.12);
      ctx.fillStyle = '#241309'; ctx.fill();
      ellipse(ctx, s * r * 0.3 - r * 0.05, -r * 0.75, r * 0.028, r * 0.028);
      ctx.fillStyle = '#FFF6E0'; ctx.fill();
      ctx.strokeStyle = OUT; ctx.lineWidth = Math.max(2.2, r * 0.08); ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(s * r * 0.12, -r * 0.9);
      ctx.lineTo(s * r * 0.46, -r * 0.82);
      ctx.stroke();
    }

    // 口鼻
    ctx.fillStyle = def.belly;
    ellipse(ctx, -r * 0.14, -r * 0.42, r * 0.17, r * 0.13); ctx.fill();
    ellipse(ctx, r * 0.14, -r * 0.42, r * 0.17, r * 0.13); ctx.fill();
    ctx.fillStyle = '#E88C8C';
    ctx.beginPath();
    ctx.moveTo(-r * 0.07, -r * 0.55); ctx.lineTo(r * 0.07, -r * 0.55); ctx.lineTo(0, -r * 0.47);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(60,35,20,.55)'; ctx.lineWidth = Math.max(1, r * 0.03);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(50,30,20,0.8)'; ctx.lineWidth = Math.max(1.2, r * 0.04);
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.47); ctx.lineTo(0, -r * 0.37);
    ctx.moveTo(-r * 0.12, -r * 0.37);
    ctx.quadraticCurveTo(-r * 0.06, -r * 0.31, 0, -r * 0.37);
    ctx.quadraticCurveTo(r * 0.06, -r * 0.31, r * 0.12, -r * 0.37);
    ctx.stroke();
    for (const s of [-1, 1]) {
      for (let k = 0; k < 3; k++) {
        ctx.beginPath();
        ctx.moveTo(s * r * 0.26, -r * 0.46 + k * r * 0.06);
        ctx.lineTo(s * r * 0.72, -r * 0.58 + k * r * 0.12);
        ctx.stroke();
      }
    }
    ctx.fillStyle = '#FFFFFF';
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(s * r * 0.12, -r * 0.34); ctx.lineTo(s * r * 0.05, -r * 0.34); ctx.lineTo(s * r * 0.085, -r * 0.22);
      ctx.closePath(); ctx.fill();
    }

    if (def.boss) {
      ctx.strokeStyle = '#C0392B'; ctx.lineWidth = r * 0.12;
      ctx.beginPath(); ctx.arc(0, -r * 0.24, r * 0.66, 0.12 * Math.PI, 0.88 * Math.PI); ctx.stroke();
      ctx.fillStyle = '#FFD34D';
      ellipse(ctx, 0, r * 0.4, r * 0.14, r * 0.14); ctx.fill();
      ctx.strokeStyle = '#8A6A1B'; ctx.lineWidth = 2; ctx.stroke();
    }

    if (e.flash > 0) {
      ctx.globalAlpha = Math.min(0.8, e.flash * 6);
      ctx.fillStyle = '#FFFFFF';
      ellipse(ctx, 0, 0, r * 1.0, r * 1.05); ctx.fill();
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }

  /* ---------------- 角色：狗 ---------------- */
  function drawDog(ctx, e) {
    const r = e.r, def = e.def;
    const bob = Math.sin(e.walk) * r * 0.03;
    ctx.save();
    ctx.translate(e.x, e.y + bob);
    ctx.fillStyle = 'rgba(70,40,20,0.22)';
    ellipse(ctx, 2, r * 0.95, r * 1.12, r * 0.4); ctx.fill();

    ctx.strokeStyle = def.furDark; ctx.lineWidth = r * 0.14; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-r * 0.8, r * 0.2); ctx.quadraticCurveTo(-r * 1.5, -r * 0.2, -r * 1.25, -r * 0.7); ctx.stroke();

    ctx.fillStyle = def.furDark;
    ellipse(ctx, -r * 0.45, r * 0.86, r * 0.32, r * 0.19); ctx.fill();
    ellipse(ctx, r * 0.45, r * 0.86, r * 0.32, r * 0.19); ctx.fill();

    ellipse(ctx, 0, r * 0.12, r * 1.0, r * 1.0);
    ctx.fillStyle = def.fur; ctx.fill();
    ctx.strokeStyle = OUT; ctx.lineWidth = Math.max(2.5, r * 0.09); ctx.stroke();
    ellipse(ctx, 0, r * 0.3, r * 0.58, r * 0.6);
    ctx.fillStyle = def.belly; ctx.globalAlpha = 0.9; ctx.fill(); ctx.globalAlpha = 1;

    for (const s of [-1, 1]) {
      ellipse(ctx, s * r * 0.8, -r * 0.5, r * 0.26, r * 0.46, s * 0.18);
      ctx.fillStyle = def.furDark; ctx.fill();
      ctx.strokeStyle = OUT; ctx.lineWidth = Math.max(2, r * 0.08); ctx.stroke();
    }
    ellipse(ctx, 0, -r * 0.48, r * 0.8, r * 0.7);
    ctx.fillStyle = def.fur; ctx.fill();
    ctx.strokeStyle = OUT; ctx.lineWidth = Math.max(2.5, r * 0.09); ctx.stroke();

    for (const s of [-1, 1]) {
      ellipse(ctx, s * r * 0.3, -r * 0.6, r * 0.17, r * 0.18);
      ctx.fillStyle = '#FFF8E7'; ctx.fill();
      ctx.strokeStyle = OUT; ctx.lineWidth = 1.6; ctx.stroke();
      ellipse(ctx, s * r * 0.3, -r * 0.6, r * 0.07, r * 0.09);
      ctx.fillStyle = OUT; ctx.fill();
      ctx.strokeStyle = OUT; ctx.lineWidth = r * 0.07;
      ctx.beginPath();
      ctx.moveTo(s * r * 0.12, -r * 0.78); ctx.lineTo(s * r * 0.46, -r * 0.73); ctx.stroke();
    }
    ellipse(ctx, 0, -r * 0.16, r * 0.42, r * 0.32);
    ctx.fillStyle = def.belly; ctx.fill();
    ellipse(ctx, 0, -r * 0.28, r * 0.14, r * 0.1);
    ctx.fillStyle = '#2B1B12'; ctx.fill();
    ctx.strokeStyle = 'rgba(45,28,18,.75)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, -r * 0.2); ctx.lineTo(0, -r * 0.08);
    ctx.moveTo(-r * 0.14, -r * 0.08); ctx.quadraticCurveTo(0, r * 0.02, r * 0.14, -r * 0.08); ctx.stroke();
    ctx.fillStyle = '#FFFFFF';
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(s * r * 0.15, -r * 0.06); ctx.lineTo(s * r * 0.07, -r * 0.06); ctx.lineTo(s * r * 0.11, r * 0.06);
      ctx.closePath(); ctx.fill();
    }
    ctx.strokeStyle = '#C0392B'; ctx.lineWidth = r * 0.11;
    ctx.beginPath(); ctx.arc(0, -r * 0.05, r * 0.78, 0.18 * Math.PI, 0.82 * Math.PI); ctx.stroke();
    ctx.fillStyle = '#FFD34D';
    ellipse(ctx, 0, r * 0.6, r * 0.15, r * 0.15); ctx.fill();

    if (e.flash > 0) {
      ctx.globalAlpha = Math.min(0.8, e.flash * 6);
      ctx.fillStyle = '#FFFFFF'; ellipse(ctx, 0, 0, r * 1.02, r * 1.05); ctx.fill();
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }

  /* ---------------- 弹道 / 拾取 / 特效 ---------------- */
  function drawProjectile(ctx, pr) {
    ctx.save();
    ctx.translate(pr.x, pr.y);
    const a = Math.atan2(pr.vy, pr.vx);
    if (pr.kind !== 'ring') {
      const glow = pr.tint || (pr.from === 'player' ? '#FFE08A' : '#FF9A8A');
      ctx.globalAlpha = 0.22;
      ctx.fillStyle = glow;
      ellipse(ctx, 0, 0, pr.r * 2.4, pr.r * 2.4); ctx.fill();
      ctx.globalAlpha = 0.28;
      ctx.strokeStyle = glow;
      ctx.lineWidth = pr.r * 0.9;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-pr.vx * 0.028, -pr.vy * 0.028);
      ctx.lineTo(0, 0);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    if (pr.kind === 'arrow') {
      ctx.rotate(a);
      ctx.strokeStyle = '#6B4423'; ctx.lineWidth = 3; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(10, 0); ctx.stroke();
      ctx.fillStyle = '#E4572E';
      ctx.beginPath(); ctx.moveTo(16, 0); ctx.lineTo(7, -5); ctx.lineTo(7, 5); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#F2D6A8'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(-18, -5); ctx.moveTo(-14, 0); ctx.lineTo(-18, 5); ctx.stroke();
    } else if (pr.kind === 'rocket') {
      ctx.rotate(a);
      ctx.fillStyle = '#FFB347';
      ctx.beginPath(); ctx.moveTo(-12, -3); ctx.lineTo(-22 - Math.random() * 6, 0); ctx.lineTo(-12, 3); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#E4572E';
      rr(ctx, -13, -6, 24, 12, 5); ctx.fill();
      ctx.fillStyle = '#F4E1C1';
      ctx.beginPath(); ctx.moveTo(11, -6); ctx.lineTo(19, 0); ctx.lineTo(11, 6); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#B33B24'; ctx.fillRect(-13, -9, 7, 18);
    } else if (pr.kind === 'shuriken') {
      ctx.rotate(pr.life * 26);
      ctx.fillStyle = '#5C6B7A';
      for (let i = 0; i < 4; i++) {
        ctx.rotate(Math.PI / 2);
        ctx.beginPath(); ctx.moveTo(0, -3); ctx.lineTo(11, 0); ctx.lineTo(0, 3); ctx.closePath(); ctx.fill();
      }
      ctx.fillStyle = '#93A3B3'; ellipse(ctx, 0, 0, 3, 3); ctx.fill();
    } else if (pr.kind === 'plate') {
      ctx.rotate(pr.life * 17);
      ctx.fillStyle = '#F4F9FF';
      ellipse(ctx, 0, 0, 11, 10); ctx.fill();
      ctx.strokeStyle = '#7FA8C9'; ctx.lineWidth = 2.5; ctx.stroke();
      ctx.strokeStyle = 'rgba(127,168,201,.65)'; ctx.lineWidth = 1.5;
      ellipse(ctx, 0, 0, 7, 6); ctx.stroke();
      ctx.fillStyle = '#DCEBF7'; ellipse(ctx, -1, -1, 4, 3); ctx.fill();
    } else if (pr.kind === 'fork') {
      ctx.rotate(a);
      ctx.strokeStyle = '#C9D6E2'; ctx.lineWidth = 3; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-12, 0); ctx.lineTo(6, 0); ctx.stroke();
      ctx.strokeStyle = '#E8F1F8'; ctx.lineWidth = 2;
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath(); ctx.moveTo(6, i * 3); ctx.lineTo(15, i * 3.4); ctx.stroke();
      }
      ctx.strokeStyle = '#8FA3B8'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-12, -3); ctx.lineTo(-12, 3); ctx.stroke();
    } else if (pr.kind === 'orb') {
      const c = pr.color || '#7FD1FF';
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = c;
      ellipse(ctx, 0, 0, 14, 14); ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = c;
      ellipse(ctx, 0, 0, 8, 8); ctx.fill();
      ctx.fillStyle = '#FFF6E0';
      ellipse(ctx, -2.5, -2.5, 3, 3); ctx.fill();
    } else if (pr.kind === 'lid') {
      ctx.rotate(pr.life * 15);
      ctx.fillStyle = '#8FA3B8';
      ellipse(ctx, 0, 0, 11, 10); ctx.fill();
      ctx.strokeStyle = '#546B80'; ctx.lineWidth = 2.5; ctx.stroke();
      ctx.fillStyle = '#C9D6E2';
      ellipse(ctx, -2, -2, 6, 4); ctx.fill();
      ctx.strokeStyle = '#546B80'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(9, -3); ctx.lineTo(14, -7); ctx.stroke();
    } else if (pr.kind === 'bubble') {
      ctx.fillStyle = 'rgba(191,233,255,0.35)';
      ellipse(ctx, 0, 0, 11, 11); ctx.fill();
      ctx.strokeStyle = 'rgba(120,200,255,0.9)'; ctx.lineWidth = 2.2; ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ellipse(ctx, -3, -4, 3.2, 2.4, -0.5); ctx.fill();
    } else if (pr.kind === 'pan') {
      ctx.rotate(pr.life * 12);
      ctx.strokeStyle = '#3B3B3B'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(-22, 0); ctx.stroke();
      ctx.fillStyle = '#4C4C4C';
      ellipse(ctx, 0, 0, 12, 10); ctx.fill();
      ctx.strokeStyle = '#2A2A2A'; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = '#7A7A7A'; ellipse(ctx, -2, -2, 6, 4); ctx.fill();
    } else if (pr.kind === 'fishbone') {
      ctx.rotate(a);
      ctx.strokeStyle = '#E8E0F2'; ctx.lineWidth = 3; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(8, 0); ctx.stroke();
      for (let i = -6; i <= 6; i += 4) {
        ctx.beginPath(); ctx.moveTo(i, -4); ctx.lineTo(i, 4); ctx.stroke();
      }
      ctx.fillStyle = '#E8E0F2'; ellipse(ctx, 10, 0, 3, 3); ctx.fill();
    } else if (pr.kind === 'ring') {
      ctx.strokeStyle = pr.color; ctx.globalAlpha = Math.max(0, pr.life / 0.55);
      ctx.lineWidth = 6;
      ctx.beginPath(); ctx.arc(0, 0, pr.r, 0, TAU); ctx.stroke();
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }

  const fxImgs = {};
  function fxImg(src) {
    if (!src) return null;
    if (!fxImgs[src]) { const im = new Image(); im.src = src; fxImgs[src] = im; }
    const im = fxImgs[src];
    return im.complete && im.naturalWidth ? im : null;
  }

  const itemImgs = {};
  function itemIconImg(src) {
    if (!src) return null;
    if (!itemImgs[src]) { const im = new Image(); im.src = src; itemImgs[src] = im; }
    const im = itemImgs[src];
    return im.complete && im.naturalWidth ? im : null;
  }

  function drawTrap(ctx, tr, t) {
    const m = { clamp: ['夹', '#FFB4A2'], ice: ['冰', '#9FE7FF'], bottle: ['瓶', '#D9B3FF'] }[tr.kind] || ['?', '#FFD34D'];
    const iconSrc = (D.itemIcons || {})[tr.kind];
    const iconImg = itemIconImg(iconSrc);
    if (iconImg) {
      ctx.save();
      ctx.translate(tr.x, tr.y);
      ctx.globalAlpha = tr.arm > 0 ? 0.6 : 1;
      ctx.fillStyle = 'rgba(255,246,224,0.85)';
      ellipse(ctx, 0, 0, 19, 19); ctx.fill();
      ctx.drawImage(iconImg, -17, -17, 34, 34);
      ctx.restore();
      return;
    }
    ctx.save();
    ctx.translate(tr.x, tr.y);
    ctx.globalAlpha = tr.arm > 0 ? 0.6 : 1;
    ctx.fillStyle = 'rgba(255,246,224,0.92)';
    ellipse(ctx, 0, 0, 16, 16); ctx.fill();
    ctx.strokeStyle = m[1]; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = m[1];
    ctx.font = 'bold 16px "Microsoft YaHei",sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(m[0], 0, 1);
    ctx.restore();
  }

  function drawPickup(ctx, pk, t) {
    ctx.save();
    ctx.translate(pk.x, pk.y + Math.sin(t * 4 + pk.x) * 2);
    if (pk.kind.indexOf('item_') === 0) {
      const key = pk.kind.slice(5);
      const image = itemIconImg((D.itemIcons || {})[key]);
      if (image) {
        ctx.fillStyle = 'rgba(255,246,224,0.9)';
        ellipse(ctx, 0, 0, 17, 17); ctx.fill();
        ctx.drawImage(image, -15, -15, 30, 30);
        ctx.restore();
        return;
      }
      const m = { item_shield: ['盾', '#7FD1FF'], item_invis: ['隐', '#B9A7FF'], item_farsight: ['视', '#FFE08A'], item_growth: ['大', '#FF9A3C'], item_random: ['?', '#FF7AD9'] }[pk.kind] || ['?', '#FFD34D'];
      ctx.fillStyle = 'rgba(255,246,224,0.92)';
      ellipse(ctx, 0, 0, 14, 14); ctx.fill();
      ctx.strokeStyle = m[1]; ctx.lineWidth = 3; ctx.stroke();
      ctx.fillStyle = m[1];
      ctx.font = 'bold 15px "Microsoft YaHei",sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(m[0], 0, 1);
      ctx.restore();
      return;
    }
    if (pk.kind === 'xp') {
      ctx.fillStyle = 'rgba(255,210,80,0.25)';
      ellipse(ctx, 0, 0, 11, 11); ctx.fill();
      ctx.fillStyle = '#FFD34D';
      ctx.beginPath(); ctx.moveTo(0, -6); ctx.lineTo(6, 0); ctx.lineTo(0, 6); ctx.lineTo(-6, 0); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#C9971B'; ctx.lineWidth = 1.5; ctx.stroke();
    } else if (pk.kind === 'magnet') {
      ctx.fillStyle = 'rgba(127,209,255,0.22)';
      ellipse(ctx, 0, 0, 14, 14); ctx.fill();
      ctx.strokeStyle = '#5B8FD6'; ctx.lineWidth = 5; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(0, 1, 8, 0, Math.PI, false); ctx.stroke();
      ctx.strokeStyle = '#E4572E'; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(-8, 1); ctx.lineTo(-8, -4); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(8, 1); ctx.lineTo(8, -4); ctx.stroke();
    } else if (pk.kind === 'heart') {
      ctx.fillStyle = '#FF7A8A';
      ctx.beginPath();
      ctx.moveTo(0, 6);
      ctx.bezierCurveTo(-12, -2, -7, -11, 0, -5);
      ctx.bezierCurveTo(7, -11, 12, -2, 0, 6);
      ctx.fill();
      ctx.strokeStyle = '#B33B4A'; ctx.lineWidth = 1.5; ctx.stroke();
    } else {
      ctx.fillStyle = '#F2C33C';
      ctx.beginPath(); ctx.moveTo(-8, 6); ctx.lineTo(8, 6); ctx.lineTo(8, -2); ctx.lineTo(2, -2); ctx.lineTo(2, -6); ctx.lineTo(-8, -6); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#A87A12'; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.fillStyle = '#D9A521';
      ellipse(ctx, -2, 2, 2.2, 2.2); ctx.fill();
      ellipse(ctx, 4, 3, 1.6, 1.6); ctx.fill();
    }
    ctx.restore();
  }

  function drawFighterRing(ctx, f) {
    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = f.color;
    ellipse(ctx, f.x, f.y + f.r * 0.95, f.r * 1.05, f.r * 0.42); ctx.fill();
    ctx.globalAlpha = 0.9;
    ctx.strokeStyle = f.color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(f.x, f.y + f.r * 0.95, f.r * 1.05, f.r * 0.42, 0, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }

  function drawFighterTag(ctx, f) {
    const ty = f.y - f.r * 2.95;
    ctx.save();
    ctx.font = '800 11px ' + FONT;
    ctx.textAlign = 'center';
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = 'rgba(30,18,10,.85)';
    ctx.strokeText(f.name, f.x, ty);
    ctx.fillStyle = f.id === 0 ? '#FFE9B8' : '#FBF1DC';
    ctx.fillText(f.name, f.x, ty);

    const w = 42, h = 5, bx = f.x - w / 2, by = ty + 4;
    ctx.fillStyle = 'rgba(20,10,5,.65)';
    ctx.fillRect(bx, by, w, h);
    ctx.fillStyle = f.color;
    ctx.fillRect(bx, by, w * Math.max(0, f.hp / f.maxHp), h);
    ctx.strokeStyle = 'rgba(0,0,0,.45)';
    ctx.lineWidth = 1;
    ctx.strokeRect(bx, by, w, h);
    ctx.restore();
  }

  function drawEffect(ctx, e) {
    if (TJ.lowFx && (e.kind === 'tex' || e.kind === 'spark')) return;
    const k = e.life / e.max;
    if (e.kind === 'ring') {
      ctx.save();
      ctx.globalAlpha = k * 0.9;
      ctx.strokeStyle = e.color || '#fff';
      ctx.lineWidth = 3 + 6 * k;
      ctx.beginPath(); ctx.arc(e.x, e.y, e.r + (e.maxR - e.r) * (1 - k), 0, TAU); ctx.stroke();
      ctx.restore();
    } else if (e.kind === 'slash') {
      ctx.save();
      ctx.translate(e.x, e.y);
      ctx.rotate(e.ang);
      const rr2 = e.range * (1.05 - 0.25 * (1 - k));
      ctx.globalAlpha = k;
      ctx.strokeStyle = '#FFF3D6';
      ctx.lineWidth = 9 * k + 4;
      ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(0, 0, rr2 * 0.82, -e.arc / 2, e.arc / 2); ctx.stroke();
      ctx.globalAlpha = k * 0.5;
      ctx.strokeStyle = '#FFD34D'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(0, 0, rr2 * 0.62, -e.arc / 2, e.arc / 2); ctx.stroke();
      ctx.restore();
    } else if (e.kind === 'tex') {
      const im = fxImg(e.src);
      if (im) {
        const k = Math.max(0, e.life / e.max);
        ctx.save();
        ctx.globalAlpha = (e.alpha != null ? e.alpha : 1) * k;
        ctx.translate(e.x, e.y);
        if (e.rot) ctx.rotate(e.rot + (1 - k) * (e.spin || 0));
        const s = (e.s0 || 12) + ((e.s1 || 40) - (e.s0 || 12)) * (1 - k);
        ctx.drawImage(im, -s / 2, -s / 2, s, s);
        ctx.restore();
      }
    } else if (e.kind === 'spark') {
      const k = e.life / e.max;
      const n = e.n || 8;
      ctx.save();
      ctx.translate(e.x, e.y);
      ctx.globalAlpha = k;
      ctx.strokeStyle = e.color || '#FFE08A';
      ctx.lineWidth = e.width || 3;
      ctx.lineCap = 'round';
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + (e.rot || 0);
        const r0 = e.r0 || 6;
        const r1 = (e.r1 || 34) * (0.4 + 0.6 * (1 - k));
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * r0, Math.sin(a) * r0);
        ctx.lineTo(Math.cos(a) * r1, Math.sin(a) * r1);
        ctx.stroke();
      }
      ctx.restore();
    } else if (e.kind === 'flash') {
      const k = e.life / e.max;
      ctx.save();
      ctx.globalAlpha = 0.35 * k;
      ctx.fillStyle = e.color || '#FFF6E0';
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.restore();
    } else if (e.kind === 'beam') {
      const k = e.life / e.max;
      ctx.save();
      ctx.globalAlpha = k;
      ctx.strokeStyle = e.color || '#FFD34D';
      ctx.lineWidth = 16 * k;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(e.x, e.y);
      ctx.lineTo(e.x + Math.cos(e.ang) * e.len, e.y + Math.sin(e.ang) * e.len);
      ctx.stroke();
      ctx.strokeStyle = '#FFF6E0';
      ctx.lineWidth = 6 * k;
      ctx.stroke();
      ctx.restore();
    } else if (e.kind === 'chain') {
      const k = e.life / e.max;
      ctx.save();
      ctx.globalAlpha = k;
      ctx.strokeStyle = e.color || '#FFE08A';
      ctx.lineWidth = 4;
      ctx.lineJoin = 'round';
      ctx.beginPath();
      for (let i = 0; i < e.pts.length; i++) {
        const p = e.pts[i];
        if (i === 0) ctx.moveTo(p.x, p.y);
        else {
          const prev = e.pts[i - 1];
          const mx = (prev.x + p.x) / 2 + (i % 2 ? 8 : -8);
          const my = (prev.y + p.y) / 2 + (i % 2 ? -8 : 8);
          ctx.quadraticCurveTo(mx, my, p.x, p.y);
        }
      }
      ctx.stroke();
      ctx.strokeStyle = '#FFF6E0';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      for (const p of e.pts) { ellipse(ctx, p.x, p.y, 5, 5); ctx.fillStyle = e.color || '#FFE08A'; ctx.fill(); }
      ctx.restore();
    } else if (e.kind === 'target') {
      ctx.save();
      ctx.globalAlpha = 0.35 + 0.3 * Math.sin(e.life * 40);
      ctx.fillStyle = '#FF5A3C';
      ctx.beginPath(); ctx.arc(e.x, e.y, e.r, 0, TAU); ctx.fill();
      ctx.globalAlpha = 0.9;
      ctx.strokeStyle = '#FF8A6A'; ctx.lineWidth = 4; ctx.setLineDash([12, 10]);
      ctx.beginPath(); ctx.arc(e.x, e.y, e.r, 0, TAU); ctx.stroke();
      ctx.restore();
    }
  }

  /* ---------------- 主渲染器 ---------------- */
  TJ.Renderer = function (canvas) {
    const ctx = canvas.getContext('2d');
    const largeMap = D.W > 3000;
    const bg = largeMap ? null : buildBackground();
    let floorPattern = null;
    function makeFloorTile(variant) {
      const PAL = [['#E9D3B0', '#E5CDA7', '#EAD5B3'], ['#E6CDA6', '#E1C69C', '#E8D0AA'], ['#EBD6B6', '#E6CDA9', '#EDD8BA'], ['#E4C9A0', '#DFC294', '#E6CDA6']][(variant || 0) % 4];
      const t = document.createElement('canvas');
      t.width = 512; t.height = 512;
      const c = t.getContext('2d');
      c.fillStyle = PAL[0]; c.fillRect(0, 0, 512, 512);
      for (let y = 0; y < 512; y += 64) {
        c.fillStyle = (y / 64) % 2 ? PAL[1] : PAL[2];
        c.fillRect(0, y, 512, 64);
        c.strokeStyle = 'rgba(122,85,50,0.20)'; c.lineWidth = 2;
        c.beginPath(); c.moveTo(0, y); c.lineTo(512, y); c.stroke();
        for (let px = ((y / 64) % 3) * 80; px < 512; px += 160) {
          c.beginPath(); c.moveTo(px, y); c.lineTo(px, y + 64); c.stroke();
        }
      }
      return t;
    }
    let cw = 0, ch = 0, dpr = 1;

    function resize(w, h, d) {
      dpr = d || 1;
      cw = w; ch = h;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
    }

    function drawZones(ctx, g) {
      const zones = [
        { name: '厨房', x: 0, y: 0, w: 0.5, h: 0.5, color: '#E8A85C' },
        { name: '客厅', x: 0.5, y: 0, w: 0.5, h: 0.5, color: '#6FA8D8' },
        { name: '花园', x: 0, y: 0.5, w: 0.5, h: 0.5, color: '#7FC08A' },
        { name: '地窖', x: 0.5, y: 0.5, w: 0.5, h: 0.5, color: '#8A6BB0' }
      ];
      ctx.save();
      ctx.globalAlpha = 0.10;
      for (const z of zones) {
        ctx.fillStyle = z.color;
        ctx.fillRect(z.x * g.W, z.y * g.H, z.w * g.W, z.h * g.H);
      }
      ctx.globalAlpha = 0.30;
      ctx.font = '900 54px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (const z of zones) {
        ctx.fillStyle = z.color;
        ctx.fillText(z.name, (z.x + z.w / 2) * g.W, (z.y + z.h / 2) * g.H);
      }
      ctx.globalAlpha = 0.18;
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#3A2418';
      ctx.strokeRect(g.W * 0.5 - 3, 0, 6, g.H);
      ctx.strokeRect(0, g.H * 0.5 - 3, g.W, 6);
      ctx.restore();
    }

    function draw(g, t) {
      let zoomMul = 1.05;
      try { const z = localStorage.getItem('tj_zoom'); if (z) zoomMul = parseFloat(z); } catch (e) {}
      const zoom = clamp(Math.min(cw, ch) / 560, 0.56, 1.15) * 0.9;
      const vw = cw / zoom, vh = ch / zoom;
      let camX = g.cam.x, camY = g.cam.y;
      camX = vw >= D.W ? D.W / 2 : clamp(camX, vw / 2, D.W - vw / 2);
      camY = vh >= D.H ? D.H / 2 : clamp(camY, vh / 2, D.H - vh / 2);

      const shake = g.shake;
      const sx = (Math.random() - 0.5) * shake, sy = (Math.random() - 0.5) * shake;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cw, ch);
      ctx.fillStyle = '#2B1B12';
      ctx.fillRect(0, 0, cw, ch);

      ctx.save();
      ctx.translate(cw / 2 + sx, ch / 2 + sy);
      ctx.scale(zoom, zoom);
      ctx.translate(-camX, -camY);

      if (largeMap) {
        if (!floorPattern) floorPattern = ctx.createPattern(makeFloorTile((g.seed || 0) % 4), 'repeat');
        ctx.fillStyle = floorPattern;
        ctx.fillRect(camX - vw / 2 - 80, camY - vh / 2 - 80, vw + 160, vh + 160);
      } else {
        ctx.drawImage(bg, 0, 0, D.W, D.H);
      }
      drawZones(ctx, g);
      if (g.escort) {
        const e = g.escort;
        ctx.save();
        ctx.fillStyle = '#F2D4A8';
        ctx.beginPath(); ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#8A6A52'; ctx.lineWidth = 3; ctx.stroke();
        ctx.fillStyle = '#E4572E';
        ctx.beginPath(); ctx.arc(e.x - 6, e.y - 6, 4, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(e.x + 6, e.y - 6, 4, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
      if (g.decor) {
        for (const d of g.decor) {
          ctx.save();
          ctx.globalAlpha = 0.85;
          if (d.k === 0) {
            ctx.fillStyle = '#C9A16B'; ctx.fillRect(d.x - d.s / 2, d.y - d.s / 2, d.s, d.s);
            ctx.strokeStyle = '#8A6A52'; ctx.lineWidth = 2; ctx.strokeRect(d.x - d.s / 2, d.y - d.s / 2, d.s, d.s);
          } else if (d.k === 1) {
            ctx.fillStyle = '#7FA36B'; ctx.beginPath(); ctx.arc(d.x, d.y, d.s / 2, 0, Math.PI * 2); ctx.fill();
          } else {
            ctx.fillStyle = '#B8926A'; ctx.beginPath(); ctx.arc(d.x, d.y, d.s / 2.4, 0, Math.PI * 2); ctx.fill();
          }
          ctx.restore();
        }
      }
      if (g.holes) {
        for (const h of g.holes) {
          ctx.save();
          ctx.fillStyle = '#2B1B12';
          ctx.beginPath(); ctx.ellipse(h.x, h.y, 34, 26, 0, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = '#8A6A52'; ctx.lineWidth = 5; ctx.stroke();
          ctx.restore();
        }
      }
      drawObstacles(ctx, g);

      for (const pk of g.pickups) drawPickup(ctx, pk, t);
    for (const tr of (g.traps || [])) drawTrap(ctx, tr, t);

      const list = [];
      if (g.mode === 'arena') {
        for (const f of g.fighters) if (f.alive) list.push({ y: f.y, e: f, kind: 'fighter' });
      } else {
        for (const e of g.enemies) list.push({ y: e.y, e, kind: 'enemy' });
        list.push({ y: g.player.y, e: g.player, kind: 'player' });
      }
      list.sort((a, b) => a.y - b.y);

      for (const it of list) {
        if (it.kind === 'fighter') {
          drawFighterRing(ctx, it.e);
          if (it.e.invisT > 0) { ctx.save(); ctx.globalAlpha = 0.35; }
            drawMouse(ctx, it.e, it.e.char);
            if (it.e.invisT > 0) ctx.restore();
          drawFighterTag(ctx, it.e);
          continue;
        }
        if (it.kind === 'enemy' && it.e.spawnT > 0) {
          const k = 1 - it.e.spawnT / 0.35;
          ctx.save();
          ctx.globalAlpha = 0.5 * (1 - k);
          ctx.strokeStyle = '#FF9A6A';
          ctx.lineWidth = 3;
          ctx.setLineDash([8, 8]);
          ctx.beginPath(); ctx.arc(it.e.x, it.e.y, it.e.r * (2.2 - k * 1.2), 0, TAU); ctx.stroke();
          ctx.restore();
        }
        if (it.kind === 'player') {
          if (it.e.invisT > 0) { ctx.save(); ctx.globalAlpha = 0.35; }
          drawMouse(ctx, it.e, it.e.char);
          if (it.e.invisT > 0) ctx.restore();
        } else if (it.e.kind === 'spike') drawDog(ctx, it.e);
        else drawCat(ctx, it.e);
      }

      for (const pr of g.projectiles) drawProjectile(ctx, pr);
      for (const e of g.effects) drawEffect(ctx, e);

      for (const p of g.particles) {
        const a = Math.max(0, p.life / p.max);
        ctx.globalAlpha = a;
        ctx.fillStyle = p.color;
        ellipse(ctx, p.x, p.y, p.size * a + 1, p.size * a + 1); ctx.fill();
      }
      ctx.globalAlpha = 1;

      for (const tx of g.texts) {
        const a = Math.min(1, tx.life / tx.max * 2);
        ctx.globalAlpha = a;
        ctx.font = '900 ' + tx.size + 'px ' + FONT;
        ctx.textAlign = 'center';
        ctx.lineWidth = 4;
        ctx.strokeStyle = 'rgba(40,22,14,0.85)';
        ctx.strokeText(tx.text, tx.x, tx.y);
        ctx.fillStyle = tx.color;
        ctx.fillText(tx.text, tx.x, tx.y);
      }
      ctx.globalAlpha = 1;
      ctx.restore();

      const vg = ctx.createRadialGradient(cw / 2, ch / 2, Math.min(cw, ch) * 0.42, cw / 2, ch / 2, Math.max(cw, ch) * 0.78);
      vg.addColorStop(0, 'rgba(30,15,8,0)');
      vg.addColorStop(1, 'rgba(30,15,8,0.42)');
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, cw, ch);

      const p = g.player;
      if (p.hp / p.maxHp < 0.35) {
        const a = 0.18 + 0.12 * Math.sin(t * 6);
        const rg = ctx.createRadialGradient(cw / 2, ch / 2, Math.min(cw, ch) * 0.3, cw / 2, ch / 2, Math.max(cw, ch) * 0.72);
        rg.addColorStop(0, 'rgba(200,30,20,0)');
        rg.addColorStop(1, 'rgba(200,30,20,' + a + ')');
        ctx.fillStyle = rg;
        ctx.fillRect(0, 0, cw, ch);
      }
    }

    return { resize, draw };
  };

  TJ.drawPortrait = function (canvas, char, size) {
    const c = canvas.getContext('2d');
    const d = size || 64;
    canvas.width = d * 2; canvas.height = d * 2;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, canvas.width, canvas.height);
    c.scale(2, 2);
    c.save();
    c.translate(d / 2, d / 2 + d * 0.1);
    drawMouse(c, { x: 0, y: 0, r: d * 0.32, facing: -Math.PI / 2, walk: 0, hitFlash: 0 }, char);
    c.restore();
  };

  // 供标题主视觉 / 图标等宣传图复用的角色绘制
  TJ.art = {
    mouse: function (ctx, char, x, y, r, facing, walk) {
      drawMouse(ctx, {
        x: x, y: y, r: r,
        facing: facing == null ? -Math.PI / 2 : facing,
        walk: walk || 0, hitFlash: 0
      }, char);
    },
    cat: function (ctx, kind, x, y, r, walk, alpha) {
      const def = D.enemies[kind] || D.enemies.kitten;
      const e = { x: x, y: y, r: r, def: def, walk: walk || 0, flash: 0, kind: kind };
      ctx.save();
      if (alpha != null) ctx.globalAlpha = alpha;
      if (kind === 'spike') drawDog(ctx, e); else drawCat(ctx, e);
      ctx.restore();
    }
  };
})();
