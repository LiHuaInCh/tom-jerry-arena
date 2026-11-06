/* 反馈层：闪光 / 震屏 / 飘字 */
(function () {
  const TJ = (window.TJ = window.TJ || {});
  TJ.fx = {
    shake: function (g, n) { if (g) g.shake = Math.max(g.shake || 0, n || 4); },
    flash: function (g, color) {
      if (g) g.effects.push({ kind: 'flash', color: color || '#FFF6E0', life: 0.16, max: 0.16 });
    },
    text: function (g, x, y, s, c, size) {
      if (TJ.helpers && TJ.helpers.addText) TJ.helpers.addText(g, x, y, s, c, size || 16);
    }
  };
})();
