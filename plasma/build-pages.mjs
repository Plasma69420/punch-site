// Run after editing product.html or adding a product:  node build-pages.mjs
// GitHub Pages is static, so every clean product URL (/marvel-rivals) needs its own file.
import fs from 'node:fs';

const src = fs.readFileSync('product.html', 'utf8');
const slugs = [...fs.readFileSync('assets/site.js', 'utf8').matchAll(/slug: "([a-z0-9-]+)"/g)].map(m => m[1]);
for (const slug of slugs) {
  fs.writeFileSync(`${slug}.html`, src);
  console.log('wrote', `${slug}.html`);
}
