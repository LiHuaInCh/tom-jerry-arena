# 素材来源与版权

## 角色立绘（assets/portraits、assets/sprites、assets/brand）

角色图来自开源猫鼠 Wiki 仓库 https://github.com/asHOH/Tom-and-jerry-chase-wiki 的 `public/images/mice` 与 `public/images/cats`，共 57 个角色（36 鼠 + 21 猫）。头像按脸部居中裁切为 256×256，局内精灵为 380 高的透明 PNG。

文件名与角色 id 对应（杰瑞 = jerry、泰菲 = tuffy、剑客杰瑞 = swordsman、罗宾汉杰瑞 = robin、侦探杰瑞 = detective、汤姆 = tom、布奇 = butch、剑客汤姆 = knightcat、图茨 = toots、莱特宁 = lightning，其余为 m01… / c01…）。

| 文件 | 角色 |
|---|---|
| portraits/jerry.png | 杰瑞 |
| portraits/tuffy.png | 泰菲 |
| portraits/knight.png | 剑客杰瑞 |
| portraits/robin.png | 罗宾汉杰瑞 |
| portraits/detective.png | 侦探杰瑞 |
| portraits/tom.png | 汤姆 |
| portraits/butch.png | 布奇 |
| portraits/knightcat.png | 剑客汤姆 |
| portraits/toots.png | 图茨 |
| portraits/lightning.png | 莱特宁 |

- `assets/brand/hero-wide.jpg` / `hero-mobile.jpg`：由上述官方立绘拼合而成的标题主视觉；
- `assets/brand/icon.png`：由杰瑞立绘裁切的站点图标；
- 角色版权归 **Warner Bros. Entertainment Inc.** 所有，游戏改编版权归 **网易游戏**。

本项目是**非商业同人作品**，这些立绘仅用于学习与演示，不构成任何授权。公开上架或商用前请替换为自制素材，或取得官方授权。

## 程序化素材

局内角色（小鼠、猫、Boss）、场景道具、弹道、粒子、伤害数字均由 `js/render.js` 用 Canvas 2D 实时绘制；音效由 `js/audio.js` 用 WebAudio 合成，不含任何音频文件。

局内角色按官方立绘的配色与服装重绘（杰瑞棕毛、泰菲灰蓝+尿布、剑客蓝袍紫帽、罗宾黄帽绿衣、侦探灰帽马甲+放大镜），保证俯视角下的可读性。

## 参考

- 玩法参考：《弓箭手大作战》（Arrow.io，猎豹移动）
- 角色 / 武器 / 道具设定参考：《猫和老鼠》手游（网易）及猫鼠 Wiki
