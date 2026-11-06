/* 猫鼠大作战 — 角色 / 武器 / 强化表（从 data.js 拆出） */
(function () {
  const TJ = (window.TJ = window.TJ || {});
  TJ.DATA_PARTS = TJ.DATA_PARTS || {};
TJ.DATA_PARTS.characters = [
    {
      id: 'detective', faction: 'mouse', name: '侦探杰瑞', en: '', title: '暗中观察', weapon: 'fork',
      hp: 120, speed: 255, radius: 16.0,
      desc: '叉子又长又利，一叉能串起三只敌人。',
      perk: '穿刺 · 清群',
      fur: '#B17E4E', furDark: '#84562E', belly: '#EDCDA2', ear: '#DE9B90', accent: '#6B6257'
    },
    {
      id: 'jerry', faction: 'mouse', name: '杰瑞', en: '', title: '机灵小老鼠', weapon: 'plate',
      hp: 130, speed: 252, radius: 17.0,
      desc: '全能选手，盘子会在敌人之间弹来弹去。',
      perk: '均衡 · 新手推荐',
      fur: '#C08A5A', furDark: '#96633A', belly: '#F3D6AC', ear: '#E9A79B', accent: '#E4572E'
    },
    {
      id: 'm01', faction: 'mouse', name: '仙女鼠', en: '', title: '鼠阵营 · 远程', weapon: 'bow',
      hp: 124, speed: 254, radius: 16.7,
      desc: '箭速快、可贯穿。',
      perk: '远程 · 穿透',
      fur: '#B17E4E', furDark: '#84562E', belly: '#EDCDA2', ear: '#E9A79B', accent: '#3F7A46'
    },
    {
      id: 'm02', faction: 'mouse', name: '佩克斯', en: '', title: '鼠阵营 · 穿刺', weapon: 'fork',
      hp: 130, speed: 258, radius: 17.4,
      desc: '长叉一穿多。',
      perk: '穿刺 · 清群',
      fur: '#D9A45F', furDark: '#A9773B', belly: '#F7E3C2', ear: '#E9A79B', accent: '#6B6257'
    },
    {
      id: 'm03', faction: 'mouse', name: '侦探泰菲', en: '', title: '鼠阵营 · 穿刺', weapon: 'fork',
      hp: 118, speed: 262, radius: 16.0,
      desc: '长叉一穿多。',
      perk: '穿刺 · 清群',
      fur: '#A9764C', furDark: '#7A5230', belly: '#E9CBA4', ear: '#E9A79B', accent: '#6B6257'
    },
    {
      id: 'm04', faction: 'mouse', name: '剑客泰菲', en: '', title: '鼠阵营 · 近战', weapon: 'sword',
      hp: 134, speed: 262, radius: 16.7,
      desc: '扇形挥砍，能劈掉飞来的暗器。',
      perk: '近战 · 高生存',
      fur: '#C9A27A', furDark: '#9A7550', belly: '#F4E3C8', ear: '#E9A79B', accent: '#4E7F52'
    },
    {
      id: 'm05', faction: 'mouse', name: '剑客莉莉', en: '', title: '鼠阵营 · 近战', weapon: 'sword',
      hp: 140, speed: 246, radius: 17.4,
      desc: '扇形挥砍，能劈掉飞来的暗器。',
      perk: '近战 · 高生存',
      fur: '#BE8451', furDark: '#8E5B31', belly: '#EFD0A6', ear: '#E9A79B', accent: '#4E7F52'
    },
    {
      id: 'm06', faction: 'mouse', name: '国王杰瑞', en: '', title: '鼠阵营 · 弹射', weapon: 'plate',
      hp: 118, speed: 254, radius: 16.0,
      desc: '盘子会在敌人之间弹来弹去。',
      perk: '弹射 · 清群',
      fur: '#C08A5A', furDark: '#96633A', belly: '#F3D6AC', ear: '#E9A79B', accent: '#E4572E'
    },
    {
      id: 'm07', faction: 'mouse', name: '天使杰瑞', en: '', title: '鼠阵营 · 追踪', weapon: 'bubble',
      hp: 120, speed: 258, radius: 16.7,
      desc: '泡泡缓慢追踪，碰到就炸。',
      perk: '追踪 · 范围',
      fur: '#B17E4E', furDark: '#84562E', belly: '#EDCDA2', ear: '#E9A79B', accent: '#4B7DA8'
    },
    {
      id: 'm08', faction: 'mouse', name: '天使泰菲', en: '', title: '鼠阵营 · 追踪', weapon: 'bubble',
      hp: 126, speed: 262, radius: 17.4,
      desc: '泡泡缓慢追踪，碰到就炸。',
      perk: '追踪 · 范围',
      fur: '#D9A45F', furDark: '#A9773B', belly: '#F7E3C2', ear: '#E9A79B', accent: '#4B7DA8'
    },
    {
      id: 'm09', faction: 'mouse', name: '尼宝', en: '', title: '鼠阵营 · 高爆发', weapon: 'rocket',
      hp: 114, speed: 266, radius: 16.0,
      desc: '火箭筒命中后小范围爆炸。',
      perk: '高爆发 · 范围',
      fur: '#A9764C', furDark: '#7A5230', belly: '#E9CBA4', ear: '#E9A79B', accent: '#F2A03D'
    },
    {
      id: 'm10', faction: 'mouse', name: '巴特', en: '', title: '鼠阵营 · 弹射', weapon: 'plate',
      hp: 124, speed: 250, radius: 16.7,
      desc: '盘子会在敌人之间弹来弹去。',
      perk: '弹射 · 清群',
      fur: '#C9A27A', furDark: '#9A7550', belly: '#F4E3C8', ear: '#E9A79B', accent: '#E4572E'
    },
    {
      id: 'm11', faction: 'mouse', name: '恶魔杰瑞', en: '', title: '鼠阵营 · 穿刺', weapon: 'fork',
      hp: 130, speed: 254, radius: 17.4,
      desc: '长叉一穿多。',
      perk: '穿刺 · 清群',
      fur: '#BE8451', furDark: '#8E5B31', belly: '#EFD0A6', ear: '#E9A79B', accent: '#6B6257'
    },
    {
      id: 'm12', faction: 'mouse', name: '恶魔泰菲', en: '', title: '鼠阵营 · 穿刺', weapon: 'fork',
      hp: 118, speed: 258, radius: 16.0,
      desc: '长叉一穿多。',
      perk: '穿刺 · 清群',
      fur: '#C08A5A', furDark: '#96633A', belly: '#F3D6AC', ear: '#E9A79B', accent: '#6B6257'
    },
    {
      id: 'm13', faction: 'mouse', name: '拿坡里鼠', en: '', title: '鼠阵营 · 近战', weapon: 'sword',
      hp: 134, speed: 258, radius: 16.7,
      desc: '扇形挥砍，能劈掉飞来的暗器。',
      perk: '近战 · 高生存',
      fur: '#B17E4E', furDark: '#84562E', belly: '#EDCDA2', ear: '#E9A79B', accent: '#4E7F52'
    },
    {
      id: 'm14', faction: 'mouse', name: '朝圣者泰菲', en: '', title: '鼠阵营 · 高爆发', weapon: 'rocket',
      hp: 126, speed: 266, radius: 17.4,
      desc: '火箭筒命中后小范围爆炸。',
      perk: '高爆发 · 范围',
      fur: '#D9A45F', furDark: '#A9773B', belly: '#F7E3C2', ear: '#E9A79B', accent: '#F2A03D'
    },
    {
      id: 'm15', faction: 'mouse', name: '朵朵', en: '', title: '鼠阵营 · 弹射', weapon: 'plate',
      hp: 118, speed: 250, radius: 16.0,
      desc: '盘子会在敌人之间弹来弹去。',
      perk: '弹射 · 清群',
      fur: '#A9764C', furDark: '#7A5230', belly: '#E9CBA4', ear: '#E9A79B', accent: '#E4572E'
    },
    {
      id: 'm16', faction: 'mouse', name: '梦游杰瑞', en: '', title: '鼠阵营 · 远程', weapon: 'bow',
      hp: 124, speed: 254, radius: 16.7,
      desc: '箭速快、可贯穿。',
      perk: '远程 · 穿透',
      fur: '#C9A27A', furDark: '#9A7550', belly: '#F4E3C8', ear: '#E9A79B', accent: '#3F7A46'
    },
    {
      id: 'm17', faction: 'mouse', name: '牛仔杰瑞', en: '', title: '鼠阵营 · 弹射', weapon: 'plate',
      hp: 130, speed: 258, radius: 17.4,
      desc: '盘子会在敌人之间弹来弹去。',
      perk: '弹射 · 清群',
      fur: '#BE8451', furDark: '#8E5B31', belly: '#EFD0A6', ear: '#E9A79B', accent: '#E4572E'
    },
    {
      id: 'm18', faction: 'mouse', name: '玛丽', en: '', title: '鼠阵营 · 近战', weapon: 'sword',
      hp: 128, speed: 258, radius: 16.0,
      desc: '扇形挥砍，能劈掉飞来的暗器。',
      perk: '近战 · 高生存',
      fur: '#C08A5A', furDark: '#96633A', belly: '#F3D6AC', ear: '#E9A79B', accent: '#4E7F52'
    },
    {
      id: 'm19', faction: 'mouse', name: '米可', en: '', title: '鼠阵营 · 高爆发', weapon: 'rocket',
      hp: 120, speed: 266, radius: 16.7,
      desc: '火箭筒命中后小范围爆炸。',
      perk: '高爆发 · 范围',
      fur: '#B17E4E', furDark: '#84562E', belly: '#EDCDA2', ear: '#E9A79B', accent: '#F2A03D'
    },
    {
      id: 'm20', faction: 'mouse', name: '米雪儿', en: '', title: '鼠阵营 · 弹射', weapon: 'plate',
      hp: 130, speed: 250, radius: 17.4,
      desc: '盘子会在敌人之间弹来弹去。',
      perk: '弹射 · 清群',
      fur: '#D9A45F', furDark: '#A9773B', belly: '#F7E3C2', ear: '#E9A79B', accent: '#E4572E'
    },
    {
      id: 'm21', faction: 'mouse', name: '罗宾汉泰菲', en: '', title: '鼠阵营 · 远程', weapon: 'bow',
      hp: 118, speed: 254, radius: 16.0,
      desc: '箭速快、可贯穿。',
      perk: '远程 · 穿透',
      fur: '#A9764C', furDark: '#7A5230', belly: '#E9CBA4', ear: '#E9A79B', accent: '#3F7A46'
    },
    {
      id: 'm22', faction: 'mouse', name: '航海士杰瑞', en: '', title: '鼠阵营 · 穿刺', weapon: 'fork',
      hp: 124, speed: 258, radius: 16.7,
      desc: '长叉一穿多。',
      perk: '穿刺 · 清群',
      fur: '#C9A27A', furDark: '#9A7550', belly: '#F4E3C8', ear: '#E9A79B', accent: '#6B6257'
    },
    {
      id: 'm23', faction: 'mouse', name: '莱恩', en: '', title: '鼠阵营 · 近战', weapon: 'sword',
      hp: 140, speed: 258, radius: 17.4,
      desc: '扇形挥砍，能劈掉飞来的暗器。',
      perk: '近战 · 高生存',
      fur: '#BE8451', furDark: '#8E5B31', belly: '#EFD0A6', ear: '#E9A79B', accent: '#4E7F52'
    },
    {
      id: 'm24', faction: 'mouse', name: '蒙金奇', en: '', title: '鼠阵营 · 高爆发', weapon: 'rocket',
      hp: 114, speed: 266, radius: 16.0,
      desc: '火箭筒命中后小范围爆炸。',
      perk: '高爆发 · 范围',
      fur: '#C08A5A', furDark: '#96633A', belly: '#F3D6AC', ear: '#E9A79B', accent: '#F2A03D'
    },
    {
      id: 'm25', faction: 'mouse', name: '表演者•杰瑞', en: '', title: '鼠阵营 · 弹射', weapon: 'plate',
      hp: 124, speed: 250, radius: 16.7,
      desc: '盘子会在敌人之间弹来弹去。',
      perk: '弹射 · 清群',
      fur: '#B17E4E', furDark: '#84562E', belly: '#EDCDA2', ear: '#E9A79B', accent: '#E4572E'
    },
    {
      id: 'm26', faction: 'mouse', name: '雪梨', en: '', title: '鼠阵营 · 远程', weapon: 'bow',
      hp: 130, speed: 254, radius: 17.4,
      desc: '箭速快、可贯穿。',
      perk: '远程 · 穿透',
      fur: '#D9A45F', furDark: '#A9773B', belly: '#F7E3C2', ear: '#E9A79B', accent: '#3F7A46'
    },
    {
      id: 'm27', faction: 'mouse', name: '霜月', en: '', title: '鼠阵营 · 穿刺', weapon: 'fork',
      hp: 118, speed: 258, radius: 16.0,
      desc: '长叉一穿多。',
      perk: '穿刺 · 清群',
      fur: '#A9764C', furDark: '#7A5230', belly: '#E9CBA4', ear: '#E9A79B', accent: '#6B6257'
    },
    {
      id: 'm28', faction: 'mouse', name: '音乐家杰瑞', en: '', title: '鼠阵营 · 追踪', weapon: 'bubble',
      hp: 120, speed: 262, radius: 16.7,
      desc: '泡泡缓慢追踪，碰到就炸。',
      perk: '追踪 · 范围',
      fur: '#C9A27A', furDark: '#9A7550', belly: '#F4E3C8', ear: '#E9A79B', accent: '#4B7DA8'
    },
    {
      id: 'm29', faction: 'mouse', name: '马索尔', en: '', title: '鼠阵营 · 高爆发', weapon: 'rocket',
      hp: 126, speed: 266, radius: 17.4,
      desc: '火箭筒命中后小范围爆炸。',
      perk: '高爆发 · 范围',
      fur: '#BE8451', furDark: '#8E5B31', belly: '#EFD0A6', ear: '#E9A79B', accent: '#F2A03D'
    },
    {
      id: 'm30', faction: 'mouse', name: '魔术师', en: '', title: '鼠阵营 · 追踪', weapon: 'bubble',
      hp: 114, speed: 250, radius: 16.0,
      desc: '泡泡缓慢追踪，碰到就炸。',
      perk: '追踪 · 范围',
      fur: '#C08A5A', furDark: '#96633A', belly: '#F3D6AC', ear: '#E9A79B', accent: '#4B7DA8'
    },
    {
      id: 'm31', faction: 'mouse', name: '鲍姆', en: '', title: '鼠阵营 · 远程', weapon: 'bow',
      hp: 124, speed: 254, radius: 16.7,
      desc: '箭速快、可贯穿。',
      perk: '远程 · 穿透',
      fur: '#B17E4E', furDark: '#84562E', belly: '#EDCDA2', ear: '#E9A79B', accent: '#3F7A46'
    },
    {
      id: 'robin', faction: 'mouse', name: '罗宾汉杰瑞', en: '', title: '森林游侠', weapon: 'bow',
      hp: 115, speed: 262, radius: 16.0,
      desc: '百步穿杨的弓箭手，一箭能贯穿两只敌人。',
      perk: '远程 · 穿透',
      fur: '#C08A5A', furDark: '#8E5B31', belly: '#F3D6AC', ear: '#E9A79B', accent: '#3F7A46'
    },
    {
      id: 'swordsman', faction: 'mouse', name: '剑客杰瑞', en: '', title: '见习骑士', weapon: 'sword',
      hp: 160, speed: 238, radius: 19.0,
      desc: '近身缠斗的剑客，挥剑能劈掉飞来的暗器。',
      perk: '近战 · 高生存',
      fur: '#BE8451', furDark: '#8E5B31', belly: '#EFD0A6', ear: '#E4A093', accent: '#4E7F52'
    },
    {
      id: 'tuffy', faction: 'mouse', name: '泰菲', en: '', title: '火箭小天才', weapon: 'rocket',
      hp: 105, speed: 268, radius: 14.0,
      desc: '个子最小、身法最灵，火箭筒一发一片。',
      perk: '高爆发 · 脆皮',
      fur: '#AEB9CC', furDark: '#7E8AA3', belly: '#F0F3F8', ear: '#F0A6B8', accent: '#F2A03D'
    },
    {
      id: 'butch', faction: 'cat', name: '布奇', en: '', title: '街头恶霸', weapon: 'lid',
      hp: 165, speed: 246, radius: 20.0,
      desc: '垃圾桶盖会在人群里弹来弹去。',
      perk: '弹射 · 耐打',
      fur: '#4A4A55', furDark: '#2E2E36', belly: '#D9DCE4', ear: '#C08A8A', accent: '#B06BE0'
    },
    {
      id: 'c01', faction: 'cat', name: '侍卫汤姆', en: '', title: '猫阵营 · 近战', weapon: 'pan',
      hp: 176, speed: 240, radius: 19.8,
      desc: '平底锅大范围拍击。',
      perk: '近战 · 坦克',
      fur: '#4A4A55', furDark: '#2E2E36', belly: '#D9DCE4', ear: '#E8A2A2', accent: '#C0392B'
    },
    {
      id: 'c02', faction: 'cat', name: '侦探汤姆', en: '', title: '猫阵营 · 穿刺', weapon: 'fork',
      hp: 174, speed: 248, radius: 20.6,
      desc: '长叉一穿多。',
      perk: '穿刺 · 清群',
      fur: '#E08A3C', furDark: '#B05E1E', belly: '#F7E3C2', ear: '#E8A2A2', accent: '#6B6257'
    },
    {
      id: 'c03', faction: 'cat', name: '兔八哥', en: '', title: '猫阵营 · 穿透', weapon: 'fish',
      hp: 154, speed: 252, radius: 19.0,
      desc: '咸鱼兼具穿透和弹射。',
      perk: '穿透 · 弹射',
      fur: '#EDEFF3', furDark: '#C3C8D2', belly: '#FFFFFF', ear: '#E8A2A2', accent: '#F2C14E'
    },
    {
      id: 'c04', faction: 'cat', name: '凯特', en: '', title: '猫阵营 · 近战', weapon: 'catsaber',
      hp: 176, speed: 252, radius: 19.8,
      desc: '长剑连斩，范围大。',
      perk: '近战 · 高生存',
      fur: '#A9A29B', furDark: '#7A736D', belly: '#E9E4DE', ear: '#E8A2A2', accent: '#C0392B'
    },
    {
      id: 'c05', faction: 'cat', name: '图多盖洛', en: '', title: '猫阵营 · 近战', weapon: 'pan',
      hp: 184, speed: 236, radius: 20.6,
      desc: '平底锅大范围拍击。',
      perk: '近战 · 坦克',
      fur: '#C98A4B', furDark: '#9A5F2C', belly: '#F1D9B4', ear: '#E8A2A2', accent: '#C0392B'
    },
    {
      id: 'c06', faction: 'cat', name: '塔拉', en: '', title: '猫阵营 · 弹射', weapon: 'lid',
      hp: 158, speed: 244, radius: 19.0,
      desc: '垃圾桶盖会连续弹射。',
      perk: '弹射 · 耐打',
      fur: '#8FA3B8', furDark: '#63788F', belly: '#EDF2F7', ear: '#E8A2A2', accent: '#546B80'
    },
    {
      id: 'c07', faction: 'cat', name: '天使汤姆', en: '', title: '猫阵营 · 追踪', weapon: 'bubble',
      hp: 162, speed: 248, radius: 19.8,
      desc: '泡泡缓慢追踪，碰到就炸。',
      perk: '追踪 · 范围',
      fur: '#4A4A55', furDark: '#2E2E36', belly: '#D9DCE4', ear: '#E8A2A2', accent: '#4B7DA8'
    },
    {
      id: 'c08', faction: 'cat', name: '如玉', en: '', title: '猫阵营 · 穿透', weapon: 'fish',
      hp: 170, speed: 252, radius: 20.6,
      desc: '咸鱼兼具穿透和弹射。',
      perk: '穿透 · 弹射',
      fur: '#E08A3C', furDark: '#B05E1E', belly: '#F7E3C2', ear: '#E8A2A2', accent: '#F2C14E'
    },
    {
      id: 'c09', faction: 'cat', name: '库博', en: '', title: '猫阵营 · 近战', weapon: 'catsaber',
      hp: 168, speed: 252, radius: 19.0,
      desc: '长剑连斩，范围大。',
      perk: '近战 · 高生存',
      fur: '#EDEFF3', furDark: '#C3C8D2', belly: '#FFFFFF', ear: '#E8A2A2', accent: '#C0392B'
    },
    {
      id: 'c10', faction: 'cat', name: '恶魔汤姆', en: '', title: '猫阵营 · 穿透', weapon: 'fish',
      hp: 162, speed: 240, radius: 19.8,
      desc: '咸鱼兼具穿透和弹射。',
      perk: '穿透 · 弹射',
      fur: '#A9A29B', furDark: '#7A736D', belly: '#E9E4DE', ear: '#E8A2A2', accent: '#F2C14E'
    },
    {
      id: 'c11', faction: 'cat', name: '托普斯', en: '', title: '猫阵营 · 弹射', weapon: 'lid',
      hp: 174, speed: 244, radius: 20.6,
      desc: '垃圾桶盖会连续弹射。',
      perk: '弹射 · 耐打',
      fur: '#C98A4B', furDark: '#9A5F2C', belly: '#F1D9B4', ear: '#E8A2A2', accent: '#546B80'
    },
    {
      id: 'c12', faction: 'cat', name: '斯飞', en: '', title: '猫阵营 · 追踪', weapon: 'bubble',
      hp: 154, speed: 248, radius: 19.0,
      desc: '泡泡缓慢追踪，碰到就炸。',
      perk: '追踪 · 范围',
      fur: '#8FA3B8', furDark: '#63788F', belly: '#EDF2F7', ear: '#E8A2A2', accent: '#4B7DA8'
    },
    {
      id: 'c13', faction: 'cat', name: '牛仔汤姆', en: '', title: '猫阵营 · 穿透', weapon: 'fish',
      hp: 162, speed: 252, radius: 19.8,
      desc: '咸鱼兼具穿透和弹射。',
      perk: '穿透 · 弹射',
      fur: '#4A4A55', furDark: '#2E2E36', belly: '#D9DCE4', ear: '#E8A2A2', accent: '#F2C14E'
    },
    {
      id: 'c14', faction: 'cat', name: '米特', en: '', title: '猫阵营 · 近战', weapon: 'catsaber',
      hp: 184, speed: 252, radius: 20.6,
      desc: '长剑连斩，范围大。',
      perk: '近战 · 高生存',
      fur: '#E08A3C', furDark: '#B05E1E', belly: '#F7E3C2', ear: '#E8A2A2', accent: '#C0392B'
    },
    {
      id: 'c15', faction: 'cat', name: '苏蕊', en: '', title: '猫阵营 · 近战', weapon: 'pan',
      hp: 168, speed: 236, radius: 19.0,
      desc: '平底锅大范围拍击。',
      perk: '近战 · 坦克',
      fur: '#EDEFF3', furDark: '#C3C8D2', belly: '#FFFFFF', ear: '#E8A2A2', accent: '#C0392B'
    },
    {
      id: 'c16', faction: 'cat', name: '追风汤姆', en: '', title: '猫阵营 · 弹射', weapon: 'lid',
      hp: 166, speed: 244, radius: 19.8,
      desc: '垃圾桶盖会连续弹射。',
      perk: '弹射 · 耐打',
      fur: '#A9A29B', furDark: '#7A736D', belly: '#E9E4DE', ear: '#E8A2A2', accent: '#546B80'
    },
    {
      id: 'knightcat', faction: 'cat', name: '剑客汤姆', en: '', title: '猫中骑士', weapon: 'catsaber',
      hp: 185, speed: 238, radius: 21.0,
      desc: '披风与长剑，近身连斩。',
      perk: '近战 · 高生存',
      fur: '#8FA3B8', furDark: '#63788F', belly: '#EDF2F7', ear: '#E8A2A2', accent: '#C0392B'
    },
    {
      id: 'lightning', faction: 'cat', name: '莱特宁', en: '', title: '闪电快猫', weapon: 'fish',
      hp: 155, speed: 264, radius: 19.0,
      desc: '咸鱼回旋镖，又腥又准。',
      perk: '穿透 · 弹射',
      fur: '#E08A3C', furDark: '#B05E1E', belly: '#F7E3C2', ear: '#E8A2A2', accent: '#F2C14E'
    },
    {
      id: 'tom', faction: 'cat', name: '汤姆', en: '', title: '捕鼠专家', weapon: 'pan',
      hp: 175, speed: 236, radius: 21.0,
      desc: '平底锅近战，一拍一片。',
      perk: '近战 · 坦克',
      fur: '#8FA3B8', furDark: '#63788F', belly: '#EDF2F7', ear: '#E8A2A2', accent: '#C0392B'
    },
    {
      id: 'toots', faction: 'cat', name: '图茨', en: '', title: '电话甜心', weapon: 'bubble',
      hp: 140, speed: 258, radius: 17.0,
      desc: '泡泡慢悠悠地飘向敌人，碰到就炸。',
      perk: '追踪 · 范围',
      fur: '#D9B36A', furDark: '#A97F3C', belly: '#F7E9CD', ear: '#E8A2A2', accent: '#4B7DA8'
    }
  ]
TJ.DATA_PARTS.weapons = {
    w_detective: { name: '烟雾弹', icon: '烟', kind: 'ranged', dmg: 20, cd: 0.8, speed: 320, range: 760, proj: 'bubble', splash: 50, homing: 1, iconImg: 'assets/weapon-icons/w_detective.png', color: '#7FD1FF' },
    w_jerry: { name: '大铁锤', icon: '大', kind: 'orbit', dmg: 40, cd: 0.52, orbitR: 78, orbitN: 2, hitCd: 0.45, iconImg: 'assets/weapon-icons/w_jerry.png', color: '#C0392B' },
    w_m01: { name: '仙女棒', icon: '仙', kind: 'orbit', dmg: 40, cd: 0.52, orbitR: 78, orbitN: 2, hitCd: 0.45, iconImg: 'assets/weapon-icons/w_m01.png', color: '#C0392B' },
    w_m02: { name: '最佳表演', icon: '最', kind: 'ranged', dmg: 20, cd: 1.7, speed: 215, range: 720, proj: 'orb', splash: 105, iconImg: 'assets/weapon-icons/w_m02.png', color: '#E4572E' },
    w_m03: { name: '追踪饮料', icon: '追', kind: 'ranged', dmg: 15, cd: 1.4, speed: 215, range: 760, proj: 'bubble', splash: 50, homing: 1, iconImg: 'assets/weapon-icons/w_m03.png', color: '#7FD1FF' },
    w_m04: { name: '剑客长枪', icon: '剑', kind: 'orbit', dmg: 40, cd: 0.52, orbitR: 78, orbitN: 2, hitCd: 0.45, iconImg: 'assets/weapon-icons/w_m04.png', color: '#C0392B' },
    w_m05: { name: '幻影剑气', icon: '幻', kind: 'ranged', dmg: 15, cd: 1.4, speed: 215, range: 760, proj: 'bubble', splash: 50, homing: 1, iconImg: 'assets/weapon-icons/w_m05.png', color: '#7FD1FF' },
    w_m06: { name: '威严光盾', icon: '威', kind: 'orbit', dmg: 40, cd: 0.52, orbitR: 78, orbitN: 2, hitCd: 0.45, iconImg: 'assets/weapon-icons/w_m06.png', color: '#C0392B' },
    w_m07: { name: '止戈雷云', icon: '止', kind: 'chain', dmg: 22, cd: 0.95, range: 600, jumps: 3, iconImg: 'assets/weapon-icons/w_m07.png', color: '#FFE08A' },
    w_m08: { name: '天使翅膀', icon: '天', kind: 'ranged', dmg: 17, cd: 0.84, speed: 460, range: 860, proj: 'orb', iconImg: 'assets/weapon-icons/w_m08.png', color: '#3F7A46' },
    w_m09: { name: '尼宝的朋友', icon: '尼', kind: 'ranged', dmg: 17, cd: 0.84, speed: 460, range: 860, proj: 'orb', iconImg: 'assets/weapon-icons/w_m09.png', color: '#4B7DA8' },
    w_m10: { name: '蝙蝠与蛛丝', icon: '蝙', kind: 'ranged', dmg: 17, cd: 0.84, speed: 460, range: 860, proj: 'orb', iconImg: 'assets/weapon-icons/w_m10.png', color: '#7FD1FF' },
    w_m11: { name: '三叉戟', icon: '三', kind: 'orbit', dmg: 40, cd: 0.52, orbitR: 78, orbitN: 2, hitCd: 0.45, iconImg: 'assets/weapon-icons/w_m11.png', color: '#C0392B' },
    w_m12: { name: '小淘气', icon: '小', kind: 'ranged', dmg: 17, cd: 0.84, speed: 460, range: 860, proj: 'orb', iconImg: 'assets/weapon-icons/w_m12.png', color: '#E4572E' },
    w_m13: { name: '世界波', icon: '世', kind: 'ranged', dmg: 20, cd: 1.7, speed: 215, range: 720, proj: 'orb', splash: 105, iconImg: 'assets/weapon-icons/w_m13.png', color: '#3F7A46' },
    w_m14: { name: '玩具长长长枪', icon: '玩', kind: 'ranged', dmg: 17, cd: 0.84, speed: 460, range: 860, proj: 'orb', iconImg: 'assets/weapon-icons/w_m14.png', color: '#4B7DA8' },
    w_m15: { name: '电流球', icon: '电', kind: 'chain', dmg: 22, cd: 0.95, range: 600, jumps: 3, iconImg: 'assets/weapon-icons/w_m15.png', color: '#FFE08A' },
    w_m16: { name: '毛线球', icon: '毛', kind: 'ranged', dmg: 14, cd: 0.92, speed: 390, range: 800, proj: 'plate', bounce: 2, iconImg: 'assets/weapon-icons/w_m16.png', color: '#E4572E' },
    w_m17: { name: '牛仔吉他', icon: '牛', kind: 'ranged', dmg: 17, cd: 0.84, speed: 460, range: 860, proj: 'orb', iconImg: 'assets/weapon-icons/w_m17.png', color: '#E4572E' },
    w_m18: { name: '香风折扇', icon: '香', kind: 'ranged', dmg: 20, cd: 1.7, speed: 215, range: 720, proj: 'orb', splash: 105, iconImg: 'assets/weapon-icons/w_m18.png', color: '#3F7A46' },
    w_m19: { name: '记录美好瞬间', icon: '记', kind: 'ranged', dmg: 17, cd: 0.84, speed: 460, range: 860, proj: 'orb', iconImg: 'assets/weapon-icons/w_m19.png', color: '#4B7DA8' },
    w_m20: { name: '漂浮气球', icon: '漂', kind: 'ranged', dmg: 14, cd: 0.92, speed: 390, range: 800, proj: 'plate', bounce: 2, iconImg: 'assets/weapon-icons/w_m20.png', color: '#E4572E' },
    w_m21: { name: '弹力圆球', icon: '弹', kind: 'ranged', dmg: 14, cd: 0.92, speed: 390, range: 800, proj: 'plate', bounce: 2, iconImg: 'assets/weapon-icons/w_m21.png', color: '#E4572E' },
    w_m22: { name: '舰艇火炮', icon: '舰', kind: 'ranged', dmg: 27, cd: 1.8, speed: 280, range: 850, proj: 'rocket', splash: 95, iconImg: 'assets/weapon-icons/w_m22.png', color: '#F2A03D' },
    w_m23: { name: '蘸水笔', icon: '蘸', kind: 'ranged', dmg: 17, cd: 0.84, speed: 460, range: 860, proj: 'orb', iconImg: 'assets/weapon-icons/w_m23.png', color: '#3F7A46' },
    w_m24: { name: '军团战车', icon: '军', kind: 'ranged', dmg: 17, cd: 0.84, speed: 460, range: 860, proj: 'orb', iconImg: 'assets/weapon-icons/w_m24.png', color: '#4B7DA8' },
    w_m25: { name: '梦幻舞步', icon: '梦', kind: 'ranged', dmg: 20, cd: 1.7, speed: 215, range: 720, proj: 'orb', splash: 105, iconImg: 'assets/weapon-icons/w_m25.png', color: '#7FD1FF' },
    w_m26: { name: '爱心花束', icon: '爱', kind: 'ranged', dmg: 17, cd: 0.84, speed: 460, range: 860, proj: 'orb', iconImg: 'assets/weapon-icons/w_m26.png', color: '#B06BE0' },
    w_m27: { name: '滑步踢', icon: '滑', kind: 'orbit', dmg: 40, cd: 0.52, orbitR: 78, orbitN: 2, hitCd: 0.45, iconImg: 'assets/weapon-icons/w_m27.png', color: '#C0392B' },
    w_m28: { name: '幻风礼服', icon: '幻', kind: 'ranged', dmg: 20, cd: 1.7, speed: 215, range: 720, proj: 'orb', splash: 105, iconImg: 'assets/weapon-icons/w_m28.png', color: '#3F7A46' },
    w_m29: { name: '沙包拳头', icon: '沙', kind: 'orbit', dmg: 40, cd: 0.52, orbitR: 78, orbitN: 2, hitCd: 0.45, iconImg: 'assets/weapon-icons/w_m29.png', color: '#C0392B' },
    w_m30: { name: '兔子大表哥', icon: '兔', kind: 'ranged', dmg: 17, cd: 0.84, speed: 460, range: 860, proj: 'orb', iconImg: 'assets/weapon-icons/w_m30.png', color: '#7FD1FF' },
    w_m31: { name: '羊角锤', icon: '羊', kind: 'orbit', dmg: 40, cd: 0.52, orbitR: 78, orbitN: 2, hitCd: 0.45, iconImg: 'assets/weapon-icons/w_m31.png', color: '#C0392B' },
    w_robin: { name: '降落伞', icon: '降', kind: 'orbit', dmg: 44, cd: 0.52, orbitR: 78, orbitN: 2, hitCd: 0.45, iconImg: 'assets/weapon-icons/w_robin.png', color: '#C0392B' },
    w_swordsman: { name: '格挡之剑', icon: '格', kind: 'orbit', dmg: 40, cd: 0.52, orbitR: 78, orbitN: 2, hitCd: 0.45, iconImg: 'assets/weapon-icons/w_swordsman.png', color: '#C0392B' },
    w_tuffy: { name: '隐形感应雷', icon: '隐', kind: 'chain', dmg: 22, cd: 0.95, range: 600, jumps: 3, iconImg: 'assets/weapon-icons/w_tuffy.png', color: '#FFE08A' },
    w_butch: { name: '旋转桶盖', icon: '旋', kind: 'ranged', dmg: 14, cd: 0.92, speed: 390, range: 800, proj: 'plate', bounce: 2, iconImg: 'assets/weapon-icons/w_butch.png', color: '#E4572E' },
    w_c01: { name: '皇家火炮', icon: '皇', kind: 'ranged', dmg: 27, cd: 1.8, speed: 280, range: 850, proj: 'rocket', splash: 95, iconImg: 'assets/weapon-icons/w_c01.png', color: '#F2A03D' },
    w_c02: { name: '侦探放大镜', icon: '侦', kind: 'beam', dmg: 30, cd: 1, range: 640, width: 26, iconImg: 'assets/weapon-icons/w_c02.png', color: '#FFD34D' },
    w_c03: { name: '胡萝卜', icon: '胡', kind: 'ranged', dmg: 17, cd: 0.84, speed: 460, range: 860, proj: 'orb', iconImg: 'assets/weapon-icons/w_c03.png', color: '#3F7A46' },
    w_c04: { name: '追求者出击', icon: '追', kind: 'ranged', dmg: 17, cd: 0.84, speed: 460, range: 860, proj: 'orb', iconImg: 'assets/weapon-icons/w_c04.png', color: '#4B7DA8' },
    w_c05: { name: '魅力香水', icon: '魅', kind: 'ranged', dmg: 27, cd: 1.8, speed: 280, range: 850, proj: 'rocket', splash: 95, iconImg: 'assets/weapon-icons/w_c05.png', color: '#F2A03D' },
    w_c06: { name: '牛仔鞭索', icon: '牛', kind: 'orbit', dmg: 40, cd: 0.52, orbitR: 78, orbitN: 2, hitCd: 0.45, iconImg: 'assets/weapon-icons/w_c06.png', color: '#C0392B' },
    w_c07: { name: '万有引力', icon: '万', kind: 'ranged', dmg: 17, cd: 0.84, speed: 460, range: 860, proj: 'orb', iconImg: 'assets/weapon-icons/w_c07.png', color: '#E4572E' },
    w_c08: { name: '掷花枪', icon: '掷', kind: 'orbit', dmg: 40, cd: 0.52, orbitR: 78, orbitN: 2, hitCd: 0.45, iconImg: 'assets/weapon-icons/w_c08.png', color: '#C0392B' },
    w_c09: { name: '白日梦', icon: '白', kind: 'ranged', dmg: 15, cd: 1.4, speed: 215, range: 760, proj: 'bubble', splash: 50, homing: 1, iconImg: 'assets/weapon-icons/w_c09.png', color: '#7FD1FF' },
    w_c10: { name: '迷乱列车', icon: '迷', kind: 'ranged', dmg: 17, cd: 0.84, speed: 460, range: 860, proj: 'orb', iconImg: 'assets/weapon-icons/w_c10.png', color: '#7FD1FF' },
    w_c11: { name: '捕虫网', icon: '捕', kind: 'ranged', dmg: 17, cd: 0.84, speed: 460, range: 860, proj: 'orb', iconImg: 'assets/weapon-icons/w_c11.png', color: '#B06BE0' },
    w_c12: { name: '爪刀', icon: '爪', kind: 'orbit', dmg: 46, cd: 0.52, orbitR: 78, orbitN: 2, hitCd: 0.45, iconImg: 'assets/weapon-icons/w_c12.png', color: '#C0392B' },
    w_c13: { name: '仙人掌弹弓', icon: '仙', kind: 'ranged', dmg: 14, cd: 0.92, speed: 390, range: 800, proj: 'plate', bounce: 2, iconImg: 'assets/weapon-icons/w_c13.png', color: '#E4572E' },
    w_c14: { name: '胡椒粉罐头', icon: '胡', kind: 'ranged', dmg: 27, cd: 1.8, speed: 280, range: 850, proj: 'rocket', splash: 95, iconImg: 'assets/weapon-icons/w_c14.png', color: '#F2A03D' },
    w_c15: { name: '瑜伽球', icon: '瑜', kind: 'ranged', dmg: 14, cd: 0.92, speed: 390, range: 800, proj: 'plate', bounce: 2, iconImg: 'assets/weapon-icons/w_c15.png', color: '#E4572E' },
    w_c16: { name: '追风双翼', icon: '追', kind: 'ranged', dmg: 20, cd: 1.7, speed: 215, range: 720, proj: 'orb', splash: 105, iconImg: 'assets/weapon-icons/w_c16.png', color: '#B06BE0' },
    w_knightcat: { name: '旋刃剑舞', icon: '旋', kind: 'ranged', dmg: 20, cd: 1.7, speed: 215, range: 720, proj: 'orb', splash: 105, iconImg: 'assets/weapon-icons/w_knightcat.png', color: '#E4572E' },
    w_lightning: { name: '咸鱼', icon: '咸', kind: 'ranged', dmg: 22, cd: 0.70, speed: 460, range: 860, proj: 'orb', iconImg: 'assets/weapon-icons/w_lightning.png', color: '#3F7A46' },
    w_tom: { name: '平底锅', icon: '平', kind: 'orbit', dmg: 40, cd: 0.52, orbitR: 78, orbitN: 2, hitCd: 0.45, iconImg: 'assets/weapon-icons/w_tom.png', color: '#C0392B' },
    w_toots: { name: '汽水罐', icon: '汽', kind: 'ranged', dmg: 27, cd: 1.8, speed: 280, range: 850, proj: 'rocket', splash: 95, iconImg: 'assets/weapon-icons/w_toots.png', color: '#F2A03D' }
  }
TJ.DATA_PARTS.upgrades = [
    { id: 'multishot', name: '三重奏', desc: '每次攻击额外发射 1 枚弹丸', icon: '三', rarity: 'rare', max: 3, apply(s) { s.multishot += 1; } },
    { id: 'pierce',    name: '穿透',   desc: '弹丸额外穿透 1 个敌人',       icon: '穿', rarity: 'common', max: 4, apply(s) { s.pierce += 1; } },
    { id: 'bounce',    name: '弹射',   desc: '弹丸命中后额外弹射 1 次',     icon: '弹', rarity: 'rare', max: 3, apply(s) { s.bounce += 1; } },
    { id: 'haste',     name: '疾风',   desc: '攻击速度 +18%',                icon: '速', rarity: 'common', max: 6, apply(s) { s.fireRate *= 1.18; } },
    { id: 'power',     name: '力量',   desc: '攻击伤害 +25%',                icon: '力', rarity: 'common', max: 6, apply(s) { s.damage *= 1.25; } },
    { id: 'swift',     name: '轻功',   desc: '移动速度 +10%',                icon: '走', rarity: 'common', max: 5, apply(s) { s.speed *= 1.10; } },
    { id: 'crit',      name: '暴击',   desc: '暴击率 +10%',                  icon: '暴', rarity: 'rare', max: 5, apply(s) { s.crit += 0.10; } },
    { id: 'critdmg',   name: '致命',   desc: '暴击伤害 +45%',                icon: '伤', rarity: 'rare', max: 4, apply(s) { s.critMul += 0.45; } },
    { id: 'vitality',  name: '强健',   desc: '生命上限 +22 并回复等量生命',   icon: '血', rarity: 'common', max: 5, apply(s) { s.maxHp += 22; } },
    { id: 'magnet',    name: '磁铁',   desc: '经验拾取范围 +70',              icon: '磁', rarity: 'common', max: 3, apply(s) { s.magnet += 70; } },
    { id: 'shield',    name: '护盾',   desc: '获得 1 层可再生护盾',           icon: '盾', rarity: 'epic', max: 3, apply(s) { s.shieldMax += 1; } },
    { id: 'explode',   name: '爆炸弹', desc: '弹丸命中时产生小范围爆炸',      icon: '爆', rarity: 'epic', max: 1, apply(s) { s.explode += 1; } },
    { id: 'homing',    name: '追踪',   desc: '弹丸会追踪附近的猫',            icon: '追', rarity: 'epic', max: 1, apply(s) { s.homing += 1; } },
    { id: 'exp',       name: '学识',     desc: '经验获取 +30%',                icon: '学', rarity: 'common', max: 4, apply(s) { s.xpMul = (s.xpMul || 1) * 1.3; } },
    { id: 'orbitN',    name: '环绕刀刃', desc: '环绕武器额外 +1 把刀刃',        icon: '刃', rarity: 'epic', max: 2, apply(s) { s.orbitBonus = (s.orbitBonus || 0) + 1; } },
    { id: 'orbitR',    name: '巨刃',     desc: '环绕伤害 +35%，环绕半径 +20',   icon: '巨', rarity: 'rare', max: 3, apply(s) { s.orbitDmgMul = (s.orbitDmgMul || 1) * 1.35; s.orbitRBonus = (s.orbitRBonus || 0) + 20; } },
    { id: 'skill',     name: '秘技',   desc: '角色技能冷却 -20%',            icon: '技', rarity: 'rare', max: 3, apply(s) { s.skillCdMul *= 0.8; } },
    { id: 'velocity',  name: '弹速',   desc: '弹丸速度 +20%，射程 +80',       icon: '远', rarity: 'common', max: 4, apply(s) { s.projSpeed *= 1.20; s.range += 80; } }
  ]
})();
