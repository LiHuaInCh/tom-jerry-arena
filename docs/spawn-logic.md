# Boss 与精英生成逻辑

## 时间基准

- 一波 = 25 秒；`wave = floor(elapsed / 25) + 1`
- 所有生成判定只发生在**波次切换的瞬间**（每 25 秒一次）

## Boss

### 状态

```js
g.nextBossWave = 3   // 下一只 Boss 的最早波次
g.bossIdx = 0        // 出场序号，决定用哪只
g.boss = null        // 当前存活 Boss
```

### 生成条件

```js
if (!g.boss && wave >= g.nextBossWave) {
  const kind = BOSS_ORDER[g.bossIdx % 6];
  g.bossIdx++;
  spawnEnemy(kind, wave, player.x + 260, player.y - 120);
  g.nextBossWave = null;   // 等它死
}
```

- 第一只固定第 3 波
- 出场顺序：坤坤 → 绷带 → 巨人 → 浅唱 → 不甘心 → 陈佳嵘，循环
- **打死之后**才把 `nextBossWave` 设为 `当前波 + 3`
- 没打死就一直占着 `g.boss`，不会刷下一只

### 击败后

```js
g.nextBossWave = wave + 3;
g.elitePool.push(bossKind);   // 进入精英池
```

### 数值缩放（spawnEnemy）

```js
const late = wave > 10 ? 1.015 ** (wave - 10) : 1;
const dyn  = clamp(sqrt(g.dps / 100), 0.85, 2.0);

bossHp = 基础血量
  × (1 + (wave - 1) × 0.07)
  × (wave ≤ 4 ? 0.55 : wave < 20 ? 0.65 : 1)
  × late × dyn;

bossDmg = 基础攻击
  × min(2.2, 1.85 + max(0, wave - 5) × 0.04)
  × (1 + wave × 0.04)
  × (wave < 6 ? 0.6 : 1);

护甲 = min(0.55, 基础护甲 + wave × 0.35%)
移速 = 基础移速 × (1 + min(0.45, wave × 0.016))
```

### 狂暴

```js
if (hp < maxHp × 0.5 && !enraged) {
  enraged = true;
  speed *= 1.35;
}
// 普攻计时加速 70%，技能冷却 ×0.65
```

## 精英

### 解锁表

```js
[['spikejr',1], ['security',1], ['cowhead',3], ['spike',5],
 ['kunkun',12], ['cthulhu',13], ['giant',14]]
```

再加 `g.elitePool`（被击败的 Boss）。

### 每波数量

```js
count = wave ≥ 20 ? 4
      : wave ≥ 16 ? 3
      : wave ≥ 12 ? 2
      : wave ≥ 3  ? 3
      : wave ≥ 2  ? 2
      : 1;
count ×= 盟约「精英翻倍」(cov.elite)
上限 6
```

### 生成位置

```js
角度 = 随机 0~2π
距离 = 300 + random(0~220)
位置 = clamp(player + 方向 × 距离, 120, 地图边界 - 120)
```

### 数值

```js
spawnEnemy(kind, max(1, wave - 2), x, y);   // 用低 2 波的成长

血量 ×= wave ≤ 5 ? 0.42 : (第一只 0.45，其余 0.35)
护甲 += 2%（上限 45%）
词缀 = 随机 护盾 / 迅捷 / 分裂
```

### 行为

- 每只精英有专属技能（见 updateEliteSkill）
- 技能带 0.55~0.9 秒前摇，显示红色直线 / 圆圈 / 扇形
- 被击败的 Boss 作为精英时，不显示 Boss 血条，不走 Boss AI，走精英技能
