import fs from 'node:fs/promises';

await fs.rm('www', { recursive: true, force: true });
await fs.mkdir('www', { recursive: true });
await fs.copyFile('index.html', 'www/index.html');
for (const d of ['css', 'js', 'assets']) {
  await fs.cp(d, 'www/' + d, { recursive: true });
}
console.log('www/ 已生成，可用于 Capacitor 打包');
