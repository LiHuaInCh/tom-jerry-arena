/* 猫鼠大作战 — 静态数据：角色 / 武器 / 敌人 / 技能 / 场景 */
(function () {
  const TJ = (window.TJ = window.TJ || {});

  const BIG_MAP = (function () { try { return localStorage.getItem('tj_mapsize') === 'large'; } catch (e) { return false; } })();
  const W = BIG_MAP ? 7200 : 2600, H = BIG_MAP ? 5400 : 1950;

  const characters = (TJ.DATA_PARTS && TJ.DATA_PARTS.characters) || [];;

  const weapons = (TJ.DATA_PARTS && TJ.DATA_PARTS.weapons) || {};;

  const skills = {
    detective: { name: '隐身', kind: 'stealth', icon: '隐', dur: 2.5, cd: 9.6, iconImg: 'assets/skill-icons/detective.png' },
    jerry: { name: '鼓舞', kind: 'heal', icon: '鼓', pct: 0.34, cd: 12.11, iconImg: 'assets/skill-icons/jerry.png' },
    m01: { name: '魔镜召唤咒', kind: 'beam', icon: '魔', dmg: 54, len: 582, width: 26, cd: 9.2, iconImg: 'assets/skill-icons/m01.png' },
    m02: { name: '魔音贯耳', kind: 'haste', icon: '魔', dur: 3.14, mul: 1.46, cd: 9.13, iconImg: 'assets/skill-icons/m02.png' },
    m03: { name: '分身大师', kind: 'heal', icon: '分', pct: 0.32, cd: 11.99, iconImg: 'assets/skill-icons/m03.png' },
    m04: { name: '勇气冲刺', kind: 'blink', icon: '勇', dist: 197, cd: 5.33, iconImg: 'assets/skill-icons/m04.png' },
    m05: { name: '御风剑舞', kind: 'haste', icon: '御', dur: 2.99, mul: 1.44, cd: 9.53, iconImg: 'assets/skill-icons/m05.png' },
    m06: { name: '威严光盾', kind: 'shield', icon: '威', dur: 2.01, cd: 10.21, iconImg: 'assets/skill-icons/m06.png' },
    m07: { name: '天使祝福', kind: 'heal', icon: '天', pct: 0.32, cd: 11.8, iconImg: 'assets/skill-icons/m07.png' },
    m08: { name: '友情庇护', kind: 'shield', icon: '友', dur: 2.04, cd: 9.61, iconImg: 'assets/skill-icons/m08.png' },
    m09: { name: '灵活跳跃', kind: 'blink', icon: '灵', dist: 198, cd: 4.86, iconImg: 'assets/skill-icons/m09.png' },
    m10: { name: '立体机动', kind: 'heal', icon: '立', pct: 0.33, cd: 12.14, iconImg: 'assets/skill-icons/m10.png' },
    m11: { name: '地狱裂隙', kind: 'slow', icon: '地', radius: 182, dur: 2.72, cd: 10.82, iconImg: 'assets/skill-icons/m11.png' },
    m12: { name: '意念控制', kind: 'stealth', icon: '意', dur: 2.54, cd: 9.66, iconImg: 'assets/skill-icons/m12.png' },
    m13: { name: '比萨斜塔', kind: 'nova', icon: '比', dmg: 46, radius: 166, cd: 8.26, iconImg: 'assets/skill-icons/m13.png' },
    m14: { name: '丰收盛宴', kind: 'blink', icon: '丰', dist: 198, cd: 4.91, iconImg: 'assets/skill-icons/m14.png' },
    m15: { name: '强能灌注', kind: 'haste', icon: '强', dur: 3.04, mul: 1.45, cd: 9.58, iconImg: 'assets/skill-icons/m15.png' },
    m16: { name: '香甜梦境', kind: 'shield', icon: '香', dur: 2.03, cd: 9.59, iconImg: 'assets/skill-icons/m16.png' },
    m17: { name: '仙人掌', kind: 'heal', icon: '仙', pct: 0.34, cd: 12.16, iconImg: 'assets/skill-icons/m17.png' },
    m18: { name: '贵族礼仪', kind: 'slow', icon: '贵', radius: 182, dur: 2.71, cd: 9.77, iconImg: 'assets/skill-icons/m18.png' },
    m19: { name: '说出你的故事', kind: 'slow', icon: '说', radius: 180, dur: 2.68, cd: 9.79, iconImg: 'assets/skill-icons/m19.png' },
    m20: { name: '小情绪', kind: 'nova', icon: '小', dmg: 46, radius: 165, cd: 8.02, iconImg: 'assets/skill-icons/m20.png' },
    m21: { name: '弹力圆球', kind: 'nova', icon: '弹', dmg: 44, radius: 165, cd: 7.47, iconImg: 'assets/skill-icons/m21.png' },
    m22: { name: '飞翔金币', kind: 'blink', icon: '飞', dist: 196, cd: 4.84, iconImg: 'assets/skill-icons/m22.png' },
    m23: { name: '蓝图', kind: 'shield', icon: '蓝', dur: 2.09, cd: 9.87, iconImg: 'assets/skill-icons/m23.png' },
    m24: { name: '勇往直前', kind: 'heal', icon: '勇', pct: 0.32, cd: 12.55, iconImg: 'assets/skill-icons/m24.png' },
    m25: { name: '梦幻舞步', kind: 'haste', icon: '梦', dur: 3.04, mul: 1.45, cd: 9.11, iconImg: 'assets/skill-icons/m25.png' },
    m26: { name: '爱心之吻', kind: 'heal', icon: '爱', pct: 0.34, cd: 11.85, iconImg: 'assets/skill-icons/m26.png' },
    m27: { name: '滑步踢', kind: 'nova', icon: '滑', dmg: 44, radius: 166, cd: 8.25, iconImg: 'assets/skill-icons/m27.png' },
    m28: { name: '幻风礼服', kind: 'haste', icon: '幻', dur: 3.18, mul: 1.47, cd: 9.27, iconImg: 'assets/skill-icons/m28.png' },
    m29: { name: '闪亮营救', kind: 'blink', icon: '闪', dist: 198, cd: 5.16, iconImg: 'assets/skill-icons/m29.png' },
    m30: { name: '奇思妙想', kind: 'shield', icon: '奇', dur: 2, cd: 9.77, iconImg: 'assets/skill-icons/m30.png' },
    m31: { name: 'BOOM!!', kind: 'heal', icon: 'B', pct: 0.33, cd: 12.46, iconImg: 'assets/skill-icons/m31.png' },
    robin: { name: '二段跳', kind: 'blink', icon: '二', dist: 197, cd: 5.02, iconImg: 'assets/skill-icons/robin.png' },
    swordsman: { name: '剑与苹果', kind: 'stealth', icon: '剑', dur: 2.3, cd: 10.49, iconImg: 'assets/skill-icons/swordsman.png' },
    tuffy: { name: '圆滚滚', kind: 'nova', icon: '圆', dmg: 43, radius: 167, cd: 7.75, iconImg: 'assets/skill-icons/tuffy.png' },
    butch: { name: '横冲直撞', kind: 'blink', icon: '横', dist: 194, cd: 5.59, iconImg: 'assets/skill-icons/butch.png' },
    c01: { name: '警戒', kind: 'haste', icon: '警', dur: 2.92, mul: 1.43, cd: 9.49, iconImg: 'assets/skill-icons/c01.png' },
    c02: { name: '侦探锁定', kind: 'shield', icon: '侦', dur: 2.21, cd: 10.91, iconImg: 'assets/skill-icons/c02.png' },
    c03: { name: '狡兔三窟', kind: 'heal', icon: '狡', pct: 0.36, cd: 12.36, iconImg: 'assets/skill-icons/c03.png' },
    c04: { name: '追求者出击', kind: 'nova', icon: '追', dmg: 51, radius: 165, cd: 9.02, iconImg: 'assets/skill-icons/c04.png' },
    c05: { name: '魅惑之吻', kind: 'slow', icon: '魅', radius: 196, dur: 2.94, cd: 10.41, iconImg: 'assets/skill-icons/c05.png' },
    c06: { name: '西部情谊', kind: 'nova', icon: '西', dmg: 49, radius: 164, cd: 8.66, iconImg: 'assets/skill-icons/c06.png' },
    c07: { name: '自由翱翔', kind: 'blink', icon: '自', dist: 195, cd: 5.35, iconImg: 'assets/skill-icons/c07.png' },
    c08: { name: '舞花枪', kind: 'haste', icon: '舞', dur: 3.06, mul: 1.45, cd: 9.47, iconImg: 'assets/skill-icons/c08.png' },
    c09: { name: '虚幻梦影', kind: 'shield', icon: '虚', dur: 2.19, cd: 10.2, iconImg: 'assets/skill-icons/c09.png' },
    c10: { name: '狂欢时刻', kind: 'haste', icon: '狂', dur: 2.92, mul: 1.43, cd: 9.78, iconImg: 'assets/skill-icons/c10.png' },
    c11: { name: '双重猫格', kind: 'slow', icon: '双', radius: 194, dur: 2.9, cd: 10.31, iconImg: 'assets/skill-icons/c11.png' },
    c12: { name: '狂', kind: 'haste', icon: '狂', dur: 3.02, mul: 1.45, cd: 9.79, iconImg: 'assets/skill-icons/c12.png' },
    c13: { name: '斗牛', kind: 'nova', icon: '斗', dmg: 49, radius: 165, cd: 8.57, iconImg: 'assets/skill-icons/c13.png' },
    c14: { name: '胡椒粉罐头', kind: 'blink', icon: '胡', dist: 195, cd: 5.42, iconImg: 'assets/skill-icons/c14.png' },
    c15: { name: '律动时间', kind: 'haste', icon: '律', dur: 2.87, mul: 1.43, cd: 9.44, iconImg: 'assets/skill-icons/c15.png' },
    c16: { name: '战术机动', kind: 'shield', icon: '战', dur: 2.18, cd: 10.49, iconImg: 'assets/skill-icons/c16.png' },
    knightcat: { name: '骑士连斩', kind: 'heal', icon: '骑', pct: 0.4, cd: 13.02, iconImg: 'assets/skill-icons/knightcat.png' },
    lightning: { name: '瞬移闪击', kind: 'blink', icon: '瞬', dist: 198, cd: 5.08, iconImg: 'assets/skill-icons/lightning.png' },
    tom: { name: '发怒冲刺', kind: 'blink', icon: '发', dist: 192, cd: 5.45, iconImg: 'assets/skill-icons/tom.png' },
    toots: { name: '喵喵叫', kind: 'nova', icon: '喵', dmg: 47, radius: 166, cd: 8.63, iconImg: 'assets/skill-icons/toots.png' }
  };

  const talents = {
    detective: { name: '「侦探杰瑞」的伤害天赋', desc: '开局+6% 伤害。', stat: 'damage', value: 0.06 },
    jerry: { name: '「杰瑞」的移速天赋', desc: '开局+5% 移速。', stat: 'speed', value: 0.05 },
    m01: { name: '「仙女鼠」的攻速天赋', desc: '开局+5% 攻速。', stat: 'fireRate', value: 0.05 },
    m02: { name: '「佩克斯」的拾取天赋', desc: '开局+30 拾取范围。', stat: 'magnet', value: 30 },
    m03: { name: '「侦探泰菲」的暴击天赋', desc: '开局+4% 暴击率。', stat: 'crit', value: 0.04 },
    m04: { name: '「剑客泰菲」的生命天赋', desc: '开局+8 生命。', stat: 'maxHp', value: 8 },
    m05: { name: '「剑客莉莉」的伤害天赋', desc: '开局+6% 伤害。', stat: 'damage', value: 0.06 },
    m06: { name: '「国王杰瑞」的移速天赋', desc: '开局+5% 移速。', stat: 'speed', value: 0.05 },
    m07: { name: '「天使杰瑞」的攻速天赋', desc: '开局+5% 攻速。', stat: 'fireRate', value: 0.05 },
    m08: { name: '「天使泰菲」的拾取天赋', desc: '开局+30 拾取范围。', stat: 'magnet', value: 30 },
    m09: { name: '「尼宝」的暴击天赋', desc: '开局+4% 暴击率。', stat: 'crit', value: 0.04 },
    m10: { name: '「巴特」的生命天赋', desc: '开局+8 生命。', stat: 'maxHp', value: 8 },
    m11: { name: '「恶魔杰瑞」的伤害天赋', desc: '开局+6% 伤害。', stat: 'damage', value: 0.06 },
    m12: { name: '「恶魔泰菲」的移速天赋', desc: '开局+5% 移速。', stat: 'speed', value: 0.05 },
    m13: { name: '「拿坡里鼠」的攻速天赋', desc: '开局+5% 攻速。', stat: 'fireRate', value: 0.05 },
    m14: { name: '「朝圣者泰菲」的拾取天赋', desc: '开局+30 拾取范围。', stat: 'magnet', value: 30 },
    m15: { name: '「朵朵」的暴击天赋', desc: '开局+4% 暴击率。', stat: 'crit', value: 0.04 },
    m16: { name: '「梦游杰瑞」的生命天赋', desc: '开局+8 生命。', stat: 'maxHp', value: 8 },
    m17: { name: '「牛仔杰瑞」的伤害天赋', desc: '开局+6% 伤害。', stat: 'damage', value: 0.06 },
    m18: { name: '「玛丽」的移速天赋', desc: '开局+5% 移速。', stat: 'speed', value: 0.05 },
    m19: { name: '「米可」的攻速天赋', desc: '开局+5% 攻速。', stat: 'fireRate', value: 0.05 },
    m20: { name: '「米雪儿」的拾取天赋', desc: '开局+30 拾取范围。', stat: 'magnet', value: 30 },
    m21: { name: '「罗宾汉泰菲」的暴击天赋', desc: '开局+4% 暴击率。', stat: 'crit', value: 0.04 },
    m22: { name: '「航海士杰瑞」的生命天赋', desc: '开局+8 生命。', stat: 'maxHp', value: 8 },
    m23: { name: '「莱恩」的伤害天赋', desc: '开局+6% 伤害。', stat: 'damage', value: 0.06 },
    m24: { name: '「蒙金奇」的移速天赋', desc: '开局+5% 移速。', stat: 'speed', value: 0.05 },
    m25: { name: '「表演者•杰瑞」的攻速天赋', desc: '开局+5% 攻速。', stat: 'fireRate', value: 0.05 },
    m26: { name: '「雪梨」的拾取天赋', desc: '开局+30 拾取范围。', stat: 'magnet', value: 30 },
    m27: { name: '「霜月」的暴击天赋', desc: '开局+4% 暴击率。', stat: 'crit', value: 0.04 },
    m28: { name: '「音乐家杰瑞」的生命天赋', desc: '开局+8 生命。', stat: 'maxHp', value: 8 },
    m29: { name: '「马索尔」的伤害天赋', desc: '开局+6% 伤害。', stat: 'damage', value: 0.06 },
    m30: { name: '「魔术师」的移速天赋', desc: '开局+5% 移速。', stat: 'speed', value: 0.05 },
    m31: { name: '「鲍姆」的攻速天赋', desc: '开局+5% 攻速。', stat: 'fireRate', value: 0.05 },
    robin: { name: '「罗宾汉杰瑞」的拾取天赋', desc: '开局+30 拾取范围。', stat: 'magnet', value: 30 },
    swordsman: { name: '「剑客杰瑞」的暴击天赋', desc: '开局+4% 暴击率。', stat: 'crit', value: 0.04 },
    tuffy: { name: '「泰菲」的生命天赋', desc: '开局+8 生命。', stat: 'maxHp', value: 8 },
    butch: { name: '「布奇」的伤害天赋', desc: '开局+6% 伤害。', stat: 'damage', value: 0.06 },
    c01: { name: '「侍卫汤姆」的移速天赋', desc: '开局+5% 移速。', stat: 'speed', value: 0.05 },
    c02: { name: '「侦探汤姆」的攻速天赋', desc: '开局+5% 攻速。', stat: 'fireRate', value: 0.05 },
    c03: { name: '「兔八哥」的拾取天赋', desc: '开局+30 拾取范围。', stat: 'magnet', value: 30 },
    c04: { name: '「凯特」的暴击天赋', desc: '开局+4% 暴击率。', stat: 'crit', value: 0.04 },
    c05: { name: '「图多盖洛」的生命天赋', desc: '开局+8 生命。', stat: 'maxHp', value: 8 },
    c06: { name: '「塔拉」的伤害天赋', desc: '开局+6% 伤害。', stat: 'damage', value: 0.06 },
    c07: { name: '「天使汤姆」的移速天赋', desc: '开局+5% 移速。', stat: 'speed', value: 0.05 },
    c08: { name: '「如玉」的攻速天赋', desc: '开局+5% 攻速。', stat: 'fireRate', value: 0.05 },
    c09: { name: '「库博」的拾取天赋', desc: '开局+30 拾取范围。', stat: 'magnet', value: 30 },
    c10: { name: '「恶魔汤姆」的暴击天赋', desc: '开局+4% 暴击率。', stat: 'crit', value: 0.04 },
    c11: { name: '「托普斯」的生命天赋', desc: '开局+8 生命。', stat: 'maxHp', value: 8 },
    c12: { name: '「斯飞」的伤害天赋', desc: '开局+6% 伤害。', stat: 'damage', value: 0.06 },
    c13: { name: '「牛仔汤姆」的移速天赋', desc: '开局+5% 移速。', stat: 'speed', value: 0.05 },
    c14: { name: '「米特」的攻速天赋', desc: '开局+5% 攻速。', stat: 'fireRate', value: 0.05 },
    c15: { name: '「苏蕊」的拾取天赋', desc: '开局+30 拾取范围。', stat: 'magnet', value: 30 },
    c16: { name: '「追风汤姆」的暴击天赋', desc: '开局+4% 暴击率。', stat: 'crit', value: 0.04 },
    knightcat: { name: '「剑客汤姆」的生命天赋', desc: '开局+8 生命。', stat: 'maxHp', value: 8 },
    lightning: { name: '「莱特宁」的伤害天赋', desc: '开局+6% 伤害。', stat: 'damage', value: 0.06 },
    tom: { name: '「汤姆」的移速天赋', desc: '开局+5% 移速。', stat: 'speed', value: 0.05 },
    toots: { name: '「图茨」的攻速天赋', desc: '开局+5% 攻速。', stat: 'fireRate', value: 0.05 }
  };
  characters.forEach(function (c) { c.weapon = 'w_' + c.id; c.skill = skills[c.id]; c.skillCd = 0; c.talent = talents[c.id]; });
  const SKILL_FIX = { '贵族礼仪': 'shield', '知识即力量': 'haste', '魅惑之吻': 'slow', '说出你的故事': 'slow', '剑与苹果': 'shield' };
  const SKILL_BASE = {
    shield: { cd: 9, dur: 1.9 },
    haste: { cd: 9, dur: 3.2, mul: 1.5 },
    slow: { cd: 9, dur: 2.5, radius: 180, mul: 0.5 },
    heal: { cd: 11, pct: 0.35 }
  };
  const DESC_FIX = { jerry: 1, tuffy: 1, swordsman: 1, robin: 1, detective: 1, tom: 1, butch: 1, knightcat: 1, toots: 1, lightning: 1 };
  characters.forEach(function (c) {
    const fix = SKILL_FIX[c.skill.name];
    if (fix && c.skill.kind !== fix) {
      c.skill.kind = fix;
      const b = SKILL_BASE[fix];
      Object.keys(b).forEach(function (k) { c.skill[k] = b[k]; });
    }
    if (DESC_FIX[c.id]) {
      const w = weapons[c.weapon];
      const tag = w.kind === 'orbit' ? '近身环绕' : '远程压制';
      c.desc = tag + '型角色：武器「' + w.name + '」，技能「' + c.skill.name + '」。';
    }
  });

  // 猫阵营默认近战；只有明确的投射类技能才保留远程
  const CAT_KEEP_RANGED = /(泡泡|香水|汽水|飞|镖|弹|炮|箭|光|镜|雷|电|音符|书|梦|影|罐|瓶)/;
  characters.forEach(function (c) {
    const w = weapons[c.weapon];
    if (!w) return;
    if (c.faction === 'cat' && (w.kind === 'ranged' || w.kind === 'bounce') && !CAT_KEEP_RANGED.test(w.name)) {
      w.kind = 'orbit';
      w.orbitR = 78;
      w.orbitN = 2;
      w.hitCd = 0.45;
    }
  });

  // 人工校正表（见 docs/character-combat-table.csv）
  const COMBAT_FIX = {
    m01: 'ranged', m02: 'orbit', m11: 'ranged', m17: 'orbit',
    butch: 'ranged', c03: 'ranged', c04: 'ranged', c05: 'ranged',
    c06: 'ranged', c07: 'ranged', c15: 'ranged', c16: 'ranged',
    lightning: 'ranged'
  };
  characters.forEach(function (c) {
    const fix = COMBAT_FIX[c.id];
    if (!fix) return;
    const w = weapons[c.weapon];
    if (fix === 'orbit' && w.kind !== 'orbit') {
      w.kind = 'orbit';
      w.orbitR = 78;
      w.orbitN = 2;
      w.hitCd = 0.45;
    } else if (fix === 'ranged' && w.kind !== 'ranged') {
      w.kind = 'ranged';
      w.proj = w.proj || (w.splash ? 'rocket' : 'orb');
      w.speed = w.speed || 450;
      w.range = w.range || 800;
    }
  });


  characters.forEach(function (c) { c.weapon = 'w_' + c.id; });


  const enemies = (TJ.DATA_PARTS && TJ.DATA_PARTS.enemies) || {};;

  const upgrades = (TJ.DATA_PARTS && TJ.DATA_PARTS.upgrades) || [];;

  const obstacles = [
    { kind: 'table',     type: 'rect', x: 230,  y: 190,  w: 320, h: 180 },
    { kind: 'sofa',      type: 'rect', x: 1230, y: 170,  w: 340, h: 160 },
    { kind: 'bookshelf', type: 'rect', x: 60,   y: 470,  w: 86,  h: 300 },
    { kind: 'chair',     type: 'rect', x: 1080, y: 520,  w: 120, h: 120 },
    { kind: 'crate',     type: 'rect', x: 1480, y: 880,  w: 150, h: 150 },
    { kind: 'counter',   type: 'rect', x: 150,  y: 1020, w: 400, h: 130 },
    { kind: 'blocks',    type: 'rect', x: 1120, y: 1120, w: 126, h: 84 },
    { kind: 'stool',     type: 'circle', x: 930,  y: 300,  r: 58 },
    { kind: 'cheese',    type: 'circle', x: 700,  y: 1080, r: 62 },
    { kind: 'plant',     type: 'circle', x: 1620, y: 500,  r: 52 },
    { kind: 'bucket',    type: 'circle', x: 360,  y: 800,  r: 46 },
    { kind: 'ball',      type: 'circle', x: 1560, y: 1180, r: 36 }
  ];

  const MSCALE = W / 1800;
  obstacles.forEach(function (o) {
    o.x = Math.round(o.x * MSCALE); o.y = Math.round(o.y * MSCALE);
    if (o.w) o.w = Math.round(o.w * MSCALE);
    if (o.h) o.h = Math.round(o.h * MSCALE);
    if (o.r) o.r = Math.round(o.r * MSCALE);
  });
  TJ.DATA = { W, H, characters, weapons, enemies, upgrades, obstacles };

  TJ.DATA.evolutions = {
    '侦探放大镜': [
      { name: '贯穿分裂', desc: '命中后分裂 2 道 45° 短束，单道伤害 -40%', effect: { beamSplit: 1 } },
      { name: '聚焦', desc: '伤害 +35%', effect: { dmg: 1.35 } }
    ],
    '电流球': [
      { name: '传染过载', desc: '跳数 +2，衰减 82%→60%', effect: { chainPlus: 2, chainDecay: 0.6 } },
      { name: '高压', desc: '伤害 +30%', effect: { dmg: 1.3 } }
    ],
    '平底锅': [
      { name: '震荡巨锅', desc: '爆炸范围 +60，冷却略增', effect: { splash: 60, cd: 1.1 } },
      { name: '轨道扩张', desc: '环绕半径 ×1.6，命中间隔 +0.2s', effect: { orbitMul: 1.6, hitCdAdd: 0.2 } }
    ],
    '大铁锤': [
      { name: '震荡巨锤', desc: '爆炸范围 +70', effect: { splash: 70 }, },
      { name: '蓄力重击', desc: '每第 3 次命中 2.2× 伤害，攻速 -15%', effect: { heavy: 1 } }
    ],
    '弓箭': [
      { name: '贯穿之矢', desc: '穿透 +2', effect: { pierce: 2 } },
      { name: '定点炮台', desc: '静止 0.8s 后射速 ×2，弹速 -30%', effect: { turret: 1 } }
    ],
    '叉子': [
      { name: '千叉', desc: '穿透 +2', effect: { pierce: 2 } },
      { name: '毒叉', desc: '伤害 +30%', effect: { dmg: 1.3 } }
    ],
    '骑士剑': [
      { name: '蓄力重击', desc: '每第 3 次命中 2.2× 伤害，攻速 -15%', effect: { heavy: 1 } },
      { name: '旋风剑', desc: '环绕刀刃 +1', effect: { orbitN: 1 } }
    ],
    '泡泡棒': [
      { name: '泡泡风暴', desc: '爆炸范围 +50', effect: { splash: 50 } },
      { name: '追踪泡', desc: '冷却 -25%', effect: { cd: 0.75 } }
    ],
    '火箭筒': [
      { name: '火箭巢', desc: '爆炸范围 +60', effect: { splash: 60 } },
      { name: '燃烧弹', desc: '伤害 +30%', effect: { dmg: 1.3 } }
    ],
    '咸鱼': [
      { name: '定点炮台', desc: '静止 0.8s 后射速 ×2，弹速 -30%', effect: { turret: 1 } },
      { name: '迟滞泡沫', desc: '命中减速 1.5s，伤害 -10%', effect: { slowHit: 1, dmg: 0.9 } }
    ]
  };

  TJ.DATA.itemIcons = {
    clamp: 'assets/item-icons/clamp.png', ice: 'assets/item-icons/ice.png', bottle: 'assets/item-icons/bottle.png',
    shield: 'assets/item-icons/shield.png', invis: 'assets/item-icons/invis.png', farsight: 'assets/item-icons/farsight.png',
    growth: 'assets/item-icons/growth.png', random: 'assets/item-icons/random.png'
  };
  const ELEM_RULES = [
    [/火|炮|火箭|燃烧/, 'fire'],
    [/冰|冻|雪|寒/, 'ice'],
    [/雷|电|闪/, 'thunder'],
    [/光|镜|圣|天使|净化/, 'light'],
    [/暗|恶魔|影|梦/, 'dark']
  ];

  const SUB_LABEL = { summon:'召唤物', rapid:'速射连发', spread:'散射弹丸', lob:'抛物弹跳', homing:'追踪弹', pierce:'穿透长弹', heavy:'蓄力重炮', blade:'短刃快斩', polearm:'长柄横扫', maul:'重锤范围震荡', guard:'守护环绕', burn:'持续灼烧', aegis:'守护光环', arc:'闪电跳跃', tether:'持续电弧', lance:'瞬发贯穿', mine:'触发地雷', spike:'地刺陷阱' };
  const SUB_KIND = { summon:'summon', rapid:'ranged', spread:'ranged', lob:'ranged', homing:'ranged', pierce:'ranged', heavy:'ranged', blade:'orbit', polearm:'orbit', maul:'orbit', guard:'orbit', burn:'aura', aegis:'aura', arc:'chain', tether:'tether', lance:'beam', mine:'deploy', spike:'deploy' };
  const CHAR_SUB = { m09:'summon', m30:'summon', toots:'summon', c13:'rapid', lightning:'rapid', m08:'rapid', c04:'rapid', m10:'spread', m19:'spread', c03:'spread', c16:'spread', m21:'lob', c05:'lob', c14:'lob', c06:'lob', m11:'homing', m16:'homing', m22:'homing', m23:'homing', m18:'pierce', m25:'pierce', m26:'pierce', m28:'heavy', butch:'heavy', m20:'heavy', swordsman:'blade', m04:'blade', m05:'blade', m27:'blade', jerry:'polearm', m17:'polearm', robin:'polearm', c12:'polearm', tom:'maul', m29:'maul', m31:'maul', c10:'maul', m02:'guard', c11:'guard', knightcat:'guard', m06:'burn', c08:'burn', m12:'burn', c01:'aegis', m01:'aegis', m07:'arc', m15:'arc', c07:'tether', m14:'tether', c02:'lance', detective:'lance', m03:'lance', tuffy:'mine', c09:'mine', c15:'spike', m13:'mine', m24:'spike' };
  const KIND_CN = { ranged:'远程', orbit:'环绕', aura:'光环', chain:'连锁', tether:'连锁', beam:'光束', deploy:'布置', summon:'召唤' };
  const SUB_DESC = { rapid:'高射速持续压制', spread:'多弹丸近距爆发', lob:'抛物弹跳范围伤害', homing:'自动追踪残血', pierce:'直线穿透清场', heavy:'慢速高伤重击', blade:'贴身快速连斩', polearm:'横扫范围更大', maul:'重锤震荡', guard:'减伤守护', burn:'持续灼烧', aegis:'守护与反伤', arc:'闪电跳跃', tether:'持续电弧', lance:'瞬发贯穿', mine:'布置地雷', spike:'地刺陷阱', summon:'召唤伙伴协同' };
  characters.forEach(function (c) {
    const sub2 = CHAR_SUB[c.id];
    if (sub2) { c.title = KIND_CN[SUB_KIND[sub2]] + ' · ' + SUB_LABEL[sub2]; c.perk = SUB_DESC[sub2] || c.perk; }
  });
  characters.forEach(function (c) {
    const sub = CHAR_SUB[c.id];
    const baseW = weapons[c.weapon];
    if (!sub || !baseW) return;
    const w = Object.assign({}, baseW);
    weapons[c.id + '_w'] = w;
    c.weapon = c.id + '_w';
    let __h = 0;
    for (let q = 0; q < c.id.length; q++) __h = (__h * 31 + c.id.charCodeAt(q)) % 360;
    const PREFIX = [
      ['烈焰', 'hsl(18,85%,58%)'], ['寒霜', 'hsl(196,80%,62%)'], ['雷鸣', 'hsl(268,70%,62%)'],
      ['暗影', 'hsl(250,45%,45%)'], ['圣光', 'hsl(45,90%,60%)'], ['翠风', 'hsl(140,55%,50%)'],
      ['岩铁', 'hsl(30,30%,50%)'], ['星辉', 'hsl(320,70%,65%)']
    ];
    const pfx = PREFIX[__h % PREFIX.length];
    w.name = pfx[0] + '·' + baseW.name;
    w.color = pfx[1];
    w.kind = SUB_KIND[sub];
    if (w.kind === 'ranged') { w.range = Math.min(460, Math.round((w.range || 600) * 0.62)); w.dmg = Math.round((w.dmg || 10) * 1.25); }
    w.sub = sub;
    w.label = SUB_LABEL[sub];
    if (sub === 'rapid') { w.cd = Math.round((w.cd || 1) * 0.7 * 100) / 100; }
    if (sub === 'heavy') { w.dmg = Math.round((w.dmg || 10) * 1.35); w.cd = Math.round((w.cd || 1) * 1.25 * 100) / 100; }
    if (sub === 'spread') { w.pellets = 4; w.spread = 30; }
    if (sub === 'lob') { w.gravity = 900; w.bounce = 1; w.boom = Math.round((w.dmg || 10) * 0.3); }
    if (sub === 'summon') { w.kind = 'summon'; w.cd = 12; w.duration = 8; w.dmg = Math.round((w.dmg || 14) * 1.2); if (c.id === 'm09') { w.stationary = true; w.range = 96; w.duration = 10; } }
    if (sub === 'mine') { w.duration = 12; w.triggerR = 46; w.armTime = 1.2; w.maxActive = 4; w.boomR = 90; }
    if (sub === 'spike') { w.duration = 12; w.triggerR = 40; w.armTime = 0.8; w.maxActive = 4; }
    if (sub === 'aegis') { w.selfDR = 0.08; }
    if (sub === 'burn') { w.auraR = 96; w.tickCd = 0.45; w.tickDmg = Math.round((w.dmg || 10) * 1.6); }
  });
  const TOP_NERF = ['c16', 'knightcat'];
  characters.forEach(function (c) {
    if (TOP_NERF.indexOf(c.id) < 0) return;
    c.hp = Math.round(c.hp * 0.95);
    const w = weapons[c.weapon];
    if (w) w.dmg = Math.round(w.dmg * 0.95);
  });
  TJ.DATA.elementNames = { fire: '火', ice: '冰', thunder: '雷', light: '光', dark: '暗' };
  weapons.w_aura_yu = { name: '舞花枪', icon: '花', iconImg: 'assets/weapon-icons/w_c08.png', kind: 'aura', sub: 'burn', label: '持续灼烧', dmg: 26, cd: 0.5, orbitR: 94, auraR: 96, tickCd: 0.45, tickDmg: 40, color: '#F2C14E' };
  weapons.w_aura_king = { name: '光盾', icon: '盾', iconImg: 'assets/weapon-icons/w_m06.png', kind: 'aura', sub: 'burn', label: '持续灼烧', dmg: 22, cd: 0.5, orbitR: 86, auraR: 96, tickCd: 0.45, tickDmg: 36, color: '#9CD8FF' };
  characters.forEach(function (c) {
    if (c.name === '如玉') c.weapon = 'w_aura_yu';
    if (c.name === '国王杰瑞') c.weapon = 'w_aura_king';
  });

  TJ.DATA.fusions = (TJ.DATA_PARTS && TJ.DATA_PARTS.fusions) || {};;

  const TALENTS_V2 = {
    execution: { name: '处决', desc: '击杀回复 4% 生命', healKill: 0.04 },
    barrage: { name: '弹幕', desc: '攻速 +12%，伤害 -5%', fireRate: 1.12, damage: 0.95 },
    heavy: { name: '重击', desc: '伤害 +18%，攻速 -8%', damage: 1.18, fireRate: 0.92 },
    bulwark: { name: '铁壁', desc: '生命 +15%，移速 -5%', hp: 0.15, speed: 0.95 },
    swift: { name: '疾行', desc: '移速 +10%，生命 -5%', speed: 1.10, hp: -0.05 },
    scholar: { name: '学者', desc: '经验 +20%', xp: 1.2 },
    scavenger: { name: '拾取', desc: '拾取范围 +60', magnet: 60 },
    crit: { name: '暴击', desc: '暴击率 +8%，暴击伤害 +20%', crit: 0.08, critMul: 0.2 },
    regen: { name: '回春', desc: '每秒回复 0.5% 生命', regen: 0.005 },
    elemental: { name: '元素亲和', desc: '融合伤害 +20%', fusion: 0.2 }
  };
  const CHAR_TALENT = {
    detective: ['crit', { crit: 0.07, critMul: 0.18 }],
    jerry: ['scavenger', { magnet: 60 }],
    m01: ['crit', { crit: 0.07, critMul: 0.18 }],
    m02: ['swift', { speed: 1.11, hp: -0.04 }],
    m03: ['regen', { regen: 0.004 }],
    m04: ['execution', { healKill: 0.05 }],
    m05: ['swift', { speed: 1.08, hp: -0.04 }],
    m06: ['bulwark', { hp: 0.17, speed: 0.96 }],
    m07: ['regen', { regen: 0.004 }],
    m08: ['bulwark', { hp: 0.17, speed: 0.96 }],
    m09: ['execution', { healKill: 0.04 }],
    m10: ['regen', { regen: 0.006 }],
    m11: ['elemental', { fusion: 0.18 }],
    m12: ['swift', { speed: 1.11, hp: -0.04 }],
    m13: ['heavy', { damage: 1.16, fireRate: 0.93 }],
    m14: ['execution', { healKill: 0.03 }],
    m15: ['swift', { speed: 1.08, hp: -0.04 }],
    m16: ['bulwark', { hp: 0.17, speed: 0.96 }],
    m17: ['regen', { regen: 0.004 }],
    m18: ['bulwark', { hp: 0.17, speed: 0.96 }],
    m19: ['elemental', { fusion: 0.18 }],
    m20: ['heavy', { damage: 1.20, fireRate: 0.93 }],
    m21: ['heavy', { damage: 1.16, fireRate: 0.93 }],
    m22: ['execution', { healKill: 0.05 }],
    m23: ['bulwark', { hp: 0.13, speed: 0.96 }],
    m24: ['regen', { regen: 0.006 }],
    m25: ['swift', { speed: 1.08, hp: -0.04 }],
    m26: ['regen', { regen: 0.006 }],
    m27: ['heavy', { damage: 1.16, fireRate: 0.93 }],
    m28: ['swift', { speed: 1.11, hp: -0.04 }],
    m29: ['execution', { healKill: 0.03 }],
    m30: ['bulwark', { hp: 0.17, speed: 0.96 }],
    m31: ['regen', { regen: 0.004 }],
    robin: ['swift', { speed: 1.11, hp: -0.04 }],
    swordsman: ['heavy', { damage: 1.16, fireRate: 0.93 }],
    tuffy: ['barrage', { fireRate: 1.14, damage: 0.96 }],
    butch: ['execution', { healKill: 0.03 }],
    c01: ['swift', { speed: 1.11, hp: -0.04 }],
    c02: ['bulwark', { hp: 0.13, speed: 0.96 }],
    c03: ['regen', { regen: 0.006 }],
    c04: ['heavy', { damage: 1.16, fireRate: 0.93 }],
    c05: ['elemental', { fusion: 0.22 }],
    c06: ['heavy', { damage: 1.16, fireRate: 0.93 }],
    c07: ['execution', { healKill: 0.04 }],
    c08: ['swift', { speed: 1.08, hp: -0.04 }],
    c09: ['bulwark', { hp: 0.17, speed: 0.96 }],
    c10: ['swift', { speed: 1.08, hp: -0.04 }],
    c11: ['elemental', { fusion: 0.22 }],
    c12: ['swift', { speed: 1.08, hp: -0.04 }],
    c13: ['heavy', { damage: 1.20, fireRate: 0.93 }],
    c14: ['execution', { healKill: 0.05 }],
    c15: ['swift', { speed: 1.11, hp: -0.04 }],
    c16: ['bulwark', { hp: 0.13, speed: 0.96 }],
    knightcat: ['heavy', { damage: 1.20, fireRate: 0.93 }],
    lightning: ['swift', { speed: 1.08, hp: -0.04 }],
    tom: ['bulwark', { hp: 0.17, speed: 0.96 }],
    toots: ['elemental', { fusion: 0.18 }]
  };
  characters.forEach(function (c) {
    var row = CHAR_TALENT[c.id] || ['scholar', {}];
    c.talent = Object.assign({ key: row[0] }, TALENTS_V2[row[0]], row[1] || {});
  });
  const TALENT_PATCH = { '塔拉': { damage: 1.08 }, '天使杰瑞': { regen: 0.003 } };
  characters.forEach(function (c) { var p = TALENT_PATCH[c.name]; if (p) Object.assign(c.talent, p); });

  const WEAK_BOOST = ['米可','魔术师','剑客莉莉','蒙金奇','巴特','兔八哥','天使泰菲','雪梨','梦游杰瑞','恶魔泰菲'];
  characters.forEach(function (c) { if (WEAK_BOOST.indexOf(c.name) >= 0) { c.hp = Math.round(c.hp * 1.15); c.weakBoost = 1; } });
  const BOTTOM_BUFF = ['库博','斯飞','剑客莉莉','马索尔','追风汤姆','图茨','杰瑞','牛仔杰瑞','佩克斯','恶魔汤姆'];
  characters.forEach(function (c) {
    if (BOTTOM_BUFF.indexOf(c.name) < 0) return;
    c.hp = Math.round(c.hp * 1.08);
    const w = TJ.DATA.weapons[c.weapon];
    if (w) w.dmg = Math.round(w.dmg * 1.08);
  });
})();
