/* 猫鼠大作战 — 敌人与融合表（从 data.js 拆出） */
(function () {
  const TJ = (window.TJ = window.TJ || {});
  TJ.DATA_PARTS = TJ.DATA_PARTS || {};
TJ.DATA_PARTS.enemies = {
    bomber:  { name: '自爆鼠', hp: 90, speed: 168, radius: 18, dmg: 0, xp: 4, score: 14, fur: '#E2453C', furDark: '#A82B24', belly: '#FFD8D2', eye: '#2B1B12' },
    bigboss: { name: '鼠王', hp: 4200, speed: 62, radius: 52, dmg: 26, xp: 60, score: 400, fur: '#8E2F2F', furDark: '#5E1D1D', belly: '#E8B4A8', eye: '#FFD34D', boss: true },
    hunter:  { name: '破障猫', hp: 240, speed: 118, radius: 22, dmg: 16, xp: 6, score: 22, fur: '#8E5BD0', furDark: '#6B3FA8', belly: '#E6D9F5', eye: '#2B1B12' },
    kitten:  { name: '流浪猫', hp: 42,  speed: 120, radius: 16, dmg: 8,  xp: 3, score: 10, fur: '#8C9AAD', furDark: '#66738A', belly: '#E7EDF5', eye: '#2B1B12' },
    bruiser: { name: '肥猫',   hp: 110, speed: 78,  radius: 25, dmg: 16, xp: 6, score: 25, fur: '#C98A4B', furDark: '#9A5F2C', belly: '#F1D9B4', eye: '#2B1B12' },
    spitter: { name: '鱼骨猫', hp: 58,  speed: 96,  radius: 18, dmg: 7,  xp: 5, score: 20, fur: '#A98CC4', furDark: '#7B6197', belly: '#EDE2F7', eye: '#2B1B12' },
    dasher:  { name: '扑扑猫', hp: 78,  speed: 136, radius: 19, dmg: 12, xp: 6, score: 25, fur: '#D96C5B', furDark: '#A64A3C', belly: '#F7D9CE', eye: '#2B1B12' },
    tom:     { name: '汤姆',   hp: 900, speed: 108, radius: 44, dmg: 18, xp: 60, score: 400, fur: '#8FA3B8', furDark: '#63788F', belly: '#EDF2F7', eye: '#F2C14E', boss: true },
    spike:   { name: '斯派克', hp: 1200, speed: 96, radius: 50, dmg: 22, xp: 90, score: 650, fur: '#A9A29B', furDark: '#7A736D', belly: '#E9E4DE', eye: '#2B1B12', boss: true },
    qianchang: { name: '浅唱', hp: 3400, armor: 0.15, speed: 72, radius: 34, dmg: 22, xp: 120, score: 600, boss: true, sprite: 'assets/bosses/qianchang.png' },
    angryqc:   { name: '不甘心的浅唱', hp: 4200, armor: 0.18, speed: 88, radius: 34, dmg: 26, xp: 140, score: 750, boss: true, sprite: 'assets/bosses/angryqc.png' },
    chenjr:    { name: '陈佳嵘', hp: 5200, armor: 0.28, speed: 64, radius: 38, dmg: 24, xp: 160, score: 900, boss: true, sprite: 'assets/bosses/chenjr.png' }
  }
TJ.DATA_PARTS.fusions = {
    'fire+fire': { name: '野火', kind: 'crit' },
    'ice+ice': { name: '极寒', kind: 'freeze' },
    'thunder+thunder': { name: '雷鸣', kind: 'chain' },
    'light+light': { name: '圣辉', kind: 'heal' },
    'dark+dark': { name: '侵蚀', kind: 'dot' },
    'fire+ice': { name: '融化', kind: 'burst' },
    'ice+thunder': { name: '感电', kind: 'aoe' },
    'dark+light': { name: '净化', kind: 'leech' },
    'fire+thunder': { name: '爆燃', kind: 'splash' },
    'dark+ice': { name: '霜蚀', kind: 'debuff' }
  }
})();
