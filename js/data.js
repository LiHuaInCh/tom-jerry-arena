/* 猫鼠大作战 — 静态数据：角色 / 武器 / 敌人 / 技能 / 场景 */
(function () {
  const TJ = (window.TJ = window.TJ || {});

  const W = 1800, H = 1350;

  const characters = [
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
  ];

  const weapons = {
    w_detective: { name: '烟雾弹', icon: '烟', kind: 'ranged', dmg: 15, cd: 1.4, speed: 215, range: 760, proj: 'bubble', splash: 50, homing: 1, iconImg: 'assets/weapon-icons/w_detective.png', color: '#7FD1FF' },
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
    w_robin: { name: '降落伞', icon: '降', kind: 'orbit', dmg: 40, cd: 0.52, orbitR: 78, orbitN: 2, hitCd: 0.45, iconImg: 'assets/weapon-icons/w_robin.png', color: '#C0392B' },
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
    w_c12: { name: '爪刀', icon: '爪', kind: 'orbit', dmg: 40, cd: 0.52, orbitR: 78, orbitN: 2, hitCd: 0.45, iconImg: 'assets/weapon-icons/w_c12.png', color: '#C0392B' },
    w_c13: { name: '仙人掌弹弓', icon: '仙', kind: 'ranged', dmg: 14, cd: 0.92, speed: 390, range: 800, proj: 'plate', bounce: 2, iconImg: 'assets/weapon-icons/w_c13.png', color: '#E4572E' },
    w_c14: { name: '胡椒粉罐头', icon: '胡', kind: 'ranged', dmg: 27, cd: 1.8, speed: 280, range: 850, proj: 'rocket', splash: 95, iconImg: 'assets/weapon-icons/w_c14.png', color: '#F2A03D' },
    w_c15: { name: '瑜伽球', icon: '瑜', kind: 'ranged', dmg: 14, cd: 0.92, speed: 390, range: 800, proj: 'plate', bounce: 2, iconImg: 'assets/weapon-icons/w_c15.png', color: '#E4572E' },
    w_c16: { name: '追风双翼', icon: '追', kind: 'ranged', dmg: 20, cd: 1.7, speed: 215, range: 720, proj: 'orb', splash: 105, iconImg: 'assets/weapon-icons/w_c16.png', color: '#B06BE0' },
    w_knightcat: { name: '旋刃剑舞', icon: '旋', kind: 'ranged', dmg: 20, cd: 1.7, speed: 215, range: 720, proj: 'orb', splash: 105, iconImg: 'assets/weapon-icons/w_knightcat.png', color: '#E4572E' },
    w_lightning: { name: '咸鱼', icon: '咸', kind: 'ranged', dmg: 17, cd: 0.84, speed: 460, range: 860, proj: 'orb', iconImg: 'assets/weapon-icons/w_lightning.png', color: '#3F7A46' },
    w_tom: { name: '平底锅', icon: '平', kind: 'orbit', dmg: 40, cd: 0.52, orbitR: 78, orbitN: 2, hitCd: 0.45, iconImg: 'assets/weapon-icons/w_tom.png', color: '#C0392B' },
    w_toots: { name: '汽水罐', icon: '汽', kind: 'ranged', dmg: 27, cd: 1.8, speed: 280, range: 850, proj: 'rocket', splash: 95, iconImg: 'assets/weapon-icons/w_toots.png', color: '#F2A03D' }
  };

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


  const enemies = {
    kitten:  { name: '流浪猫', hp: 42,  speed: 120, radius: 16, dmg: 8,  xp: 3, score: 10, fur: '#8C9AAD', furDark: '#66738A', belly: '#E7EDF5', eye: '#2B1B12' },
    bruiser: { name: '肥猫',   hp: 110, speed: 78,  radius: 25, dmg: 16, xp: 6, score: 25, fur: '#C98A4B', furDark: '#9A5F2C', belly: '#F1D9B4', eye: '#2B1B12' },
    spitter: { name: '鱼骨猫', hp: 58,  speed: 96,  radius: 18, dmg: 7,  xp: 5, score: 20, fur: '#A98CC4', furDark: '#7B6197', belly: '#EDE2F7', eye: '#2B1B12' },
    dasher:  { name: '扑扑猫', hp: 78,  speed: 136, radius: 19, dmg: 12, xp: 6, score: 25, fur: '#D96C5B', furDark: '#A64A3C', belly: '#F7D9CE', eye: '#2B1B12' },
    tom:     { name: '汤姆',   hp: 900, speed: 108, radius: 44, dmg: 18, xp: 60, score: 400, fur: '#8FA3B8', furDark: '#63788F', belly: '#EDF2F7', eye: '#F2C14E', boss: true },
    spike:   { name: '斯派克', hp: 1200, speed: 96, radius: 50, dmg: 22, xp: 90, score: 650, fur: '#A9A29B', furDark: '#7A736D', belly: '#E9E4DE', eye: '#2B1B12', boss: true }
  };

  const upgrades = [
    { id: 'multishot', name: '三重奏', desc: '每次攻击额外发射 1 枚弹丸', icon: '三', rarity: 'rare', max: 3, apply(s) { s.multishot += 1; } },
    { id: 'pierce',    name: '穿透',   desc: '弹丸额外穿透 1 个敌人',       icon: '穿', rarity: 'common', max: 4, apply(s) { s.pierce += 1; } },
    { id: 'bounce',    name: '弹射',   desc: '弹丸命中后额外弹射 1 次',     icon: '弹', rarity: 'rare', max: 3, apply(s) { s.bounce += 1; } },
    { id: 'haste',     name: '疾风',   desc: '攻击速度 +18%',                icon: '速', rarity: 'common', max: 6, apply(s) { s.fireRate *= 1.18; } },
    { id: 'power',     name: '力量',   desc: '攻击伤害 +25%',                icon: '力', rarity: 'common', max: 6, apply(s) { s.damage *= 1.25; } },
    { id: 'swift',     name: '轻功',   desc: '移动速度 +10%',                icon: '走', rarity: 'common', max: 5, apply(s) { s.speed *= 1.10; } },
    { id: 'crit',      name: '暴击',   desc: '暴击率 +10%',                  icon: '暴', rarity: 'rare', max: 5, apply(s) { s.crit += 0.10; } },
    { id: 'critdmg',   name: '致命',   desc: '暴击伤害 +45%',                icon: '伤', rarity: 'rare', max: 4, apply(s) { s.critMul += 0.45; } },
    { id: 'vitality',  name: '强健',   desc: '生命上限 +22 并回复等量生命',   icon: '血', rarity: 'common', max: 5, apply(s) { s.maxHp += 22; } },
    { id: 'leech',     name: '吸血',   desc: '造成伤害的 2.5% 转化为生命',    icon: '吸', rarity: 'rare', max: 4, apply(s) { s.lifesteal += 0.025; } },
    { id: 'magnet',    name: '磁铁',   desc: '经验拾取范围 +70',              icon: '磁', rarity: 'common', max: 3, apply(s) { s.magnet += 70; } },
    { id: 'shield',    name: '护盾',   desc: '获得 1 层可再生护盾',           icon: '盾', rarity: 'epic', max: 3, apply(s) { s.shieldMax += 1; } },
    { id: 'explode',   name: '爆炸弹', desc: '弹丸命中时产生小范围爆炸',      icon: '爆', rarity: 'epic', max: 1, apply(s) { s.explode += 1; } },
    { id: 'homing',    name: '追踪',   desc: '弹丸会追踪附近的猫',            icon: '追', rarity: 'epic', max: 1, apply(s) { s.homing += 1; } },
    { id: 'exp',       name: '学识',     desc: '经验获取 +30%',                icon: '学', rarity: 'common', max: 4, apply(s) { s.xpMul = (s.xpMul || 1) * 1.3; } },
    { id: 'orbitN',    name: '环绕刀刃', desc: '环绕武器额外 +1 把刀刃',        icon: '刃', rarity: 'epic', max: 2, apply(s) { s.orbitBonus = (s.orbitBonus || 0) + 1; } },
    { id: 'orbitR',    name: '巨刃',     desc: '环绕伤害 +35%，环绕半径 +20',   icon: '巨', rarity: 'rare', max: 3, apply(s) { s.orbitDmgMul = (s.orbitDmgMul || 1) * 1.35; s.orbitRBonus = (s.orbitRBonus || 0) + 20; } },
    { id: 'skill',     name: '秘技',   desc: '角色技能冷却 -20%',            icon: '技', rarity: 'rare', max: 3, apply(s) { s.skillCdMul *= 0.8; } },
    { id: 'velocity',  name: '弹速',   desc: '弹丸速度 +20%，射程 +80',       icon: '远', rarity: 'common', max: 4, apply(s) { s.projSpeed *= 1.20; s.range += 80; } }
  ];

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
  characters.forEach(function (c, i) {
    const w = weapons[c.weapon];
    let el = null;
    for (let k = 0; k < ELEM_RULES.length; k++) {
      if (ELEM_RULES[k][0].test(w.name)) { el = ELEM_RULES[k][1]; break; }
    }
    if (!el) el = ['fire', 'ice', 'thunder', 'light', 'dark'][i % 5];
    c.element = el;
  });
  TJ.DATA.elementNames = { fire: '火', ice: '冰', thunder: '雷', light: '光', dark: '暗' };

  TJ.DATA.fusions = {
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
  };

})();
