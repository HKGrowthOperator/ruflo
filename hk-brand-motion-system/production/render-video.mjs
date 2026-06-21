// Render the HK animations to video (webm) via Playwright — reproducible.
//
// Usage (from this folder):
//   npm install playwright@1.56.1
//   npx playwright install chromium-headless-shell
//   node render-video.mjs
//
// Output: hk-cinematic-short.webm, hk-cinematic-brand-story.webm
// To convert to MP4 (needs ffmpeg):
//   ffmpeg -i hk-cinematic-brand-story.webm -pix_fmt yuv420p -movflags +faststart hk-cinematic-brand-story.mp4
import { chromium } from 'playwright';
import { mkdirSync, renameSync, readdirSync, rmSync } from 'fs';

const fullscreen = `.wrap{padding:0!important;gap:0!important}.stage{width:100vw!important;height:100vh!important;border-radius:0!important;box-shadow:none!important}.ui,.cnt{display:none!important}`;

async function rec(file, seconds, out){
  const dir = './_vid_'+out;
  mkdirSync(dir,{recursive:true});
  const browser = await chromium.launch({args:['--no-sandbox','--disable-gpu']});
  const ctx = await browser.newContext({viewport:{width:1280,height:720}, recordVideo:{dir, size:{width:1280,height:720}}});
  const page = await ctx.newPage();
  await page.goto('file://'+process.cwd()+'/'+file);
  await page.addStyleTag({content: fullscreen});
  await page.waitForTimeout(seconds*1000 + 400);
  await page.close(); await ctx.close(); await browser.close();
  const f = readdirSync(dir).find(x=>x.endsWith('.webm'));
  renameSync(dir+'/'+f, './'+out); rmSync(dir,{recursive:true,force:true});
  console.log('wrote', out);
}

await rec('hk-cinematic-brand-story-short.html', 10, 'hk-cinematic-short.webm');
await rec('hk-cinematic-brand-story.html', 33, 'hk-cinematic-brand-story.webm');
