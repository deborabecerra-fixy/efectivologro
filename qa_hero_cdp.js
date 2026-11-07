import fs from 'node:fs';

const output = process.argv[2];
const pages = await fetch('http://127.0.0.1:9225/json').then((response) => response.json());
const page = pages.find((item) => item.type === 'page' && item.url.includes('/index.html'));
if (!page) throw new Error('No se encontró la landing');

const socket = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true });
  socket.addEventListener('error', reject, { once: true });
});

let nextId = 0;
const pending = new Map();
socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);
  if (!message.id || !pending.has(message.id)) return;
  const { resolve, reject } = pending.get(message.id);
  pending.delete(message.id);
  if (message.error) reject(new Error(message.error.message));
  else resolve(message.result);
});
function send(method, params = {}) {
  const id = ++nextId;
  socket.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
}

await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 1200, deviceScaleFactor: 1, mobile: true });
await send('Page.reload', { ignoreCache: true });
await new Promise((resolve) => setTimeout(resolve, 1800));
const audit = await send('Runtime.evaluate', {
  expression: `JSON.stringify({
    innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    titleLines: [...document.querySelectorAll('.hero-title-line')].map((item) => ({ text: item.textContent, width: Math.round(item.getBoundingClientRect().width), height: Math.round(item.getBoundingClientRect().height) })),
    heroHeight: Math.round(document.querySelector('.hero').getBoundingClientRect().height),
    stripWidth: Math.round(document.querySelector('.strip').getBoundingClientRect().width)
  })`,
  returnByValue: true,
});
const capture = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false, fromSurface: true });
fs.writeFileSync(output, Buffer.from(capture.data, 'base64'));
console.log(audit.result.value);
socket.close();
