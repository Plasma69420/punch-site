// Generates the legal pages (terms / privacy / refund) and the account pages (account / orders / keys / downloads).
// Run: node build-extra.mjs   (from the plasma folder)
import fs from 'node:fs';

const V = '56';
const EFFECTIVE = 'October 11, 2026';
const head = (title, desc) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} – Plasma</title>
<meta name="description" content="${desc}">
<meta name="theme-color" content="#b026ff">
<link rel="icon" type="image/png" href="/img/logo.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link href="https://api.fontshare.com/v2/css?f[]=clash-display@600,700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/site.css?v=${V}">
<link rel="stylesheet" href="/assets/pages.css?v=${V}">
</head>
<body>
`;

/* ---------------- account pages ---------------- */
const acct = (file, key, title) => fs.writeFileSync(file, head(title, 'Your Plasma account, orders, keys and downloads.') +
`<main class="page"><div class="wrap" style="max-width:1100px" id="acctRoot"></div></main>
<script src="/assets/site.js?v=${V}"></script>
<script>window.ACCT_PAGE = "${key}";</script>
<script src="/assets/account.js?v=${V}"></script>
</body>
</html>
`);
acct('account.html', 'account', 'My Account');
acct('orders.html', 'orders', 'My Orders');
acct('keys.html', 'keys', 'My Keys');
acct('downloads.html', 'downloads', 'Downloads');

/* ---------------- legal pages ---------------- */
const tbl = (cols, rows) => `<div class="ltable"><table><thead><tr>${cols.map(c => `<th>${c}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map((c, i) => i === 0 ? `<td><b>${c}</b></td>` : `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
const ul = items => `<ul>${items.map(i => `<li>${i}</li>`).join('')}</ul>`;
const ol = items => `<ol>${items.map(i => `<li>${i}</li>`).join('')}</ol>`;
const callout = t => `<div class="lcallout">${t}</div>`;
const L = { terms: '<a href="/terms">Terms of Service</a>', privacy: '<a href="/privacy">Privacy Policy</a>', refund: '<a href="/refund">Refund Policy</a>' };

const pages = {
  terms: {
    title: 'Terms of Service', sub: 'What you agree to when you buy from us and use our products.',
    sections: [
      ['Who we are', `<p>These Terms govern every purchase and all use of plasmatools.org, our Discord server, our Telegram group, and the software and licenses we sell (the “Products”). The seller is Plasma (“Plasma”, “we”, “us”). You can reach us by opening a ticket in our Discord server. By placing an order, logging in or opening a ticket you accept these Terms.</p>`],
      ['Eligibility', `<p>You must be old enough to enter a binding contract where you live. Accounts and licenses are personal: they may not be shared, sold or transferred.</p>`],
      ['Products', `<p>We sell software licenses (license keys) for game software and related tools, such as cheats and HWID spoofers. Each Product page states the game, the plans and the duration of each plan (for example 1 day, 1 week, 1 month or lifetime, depending on the Product). Prices are shown in US dollars.</p><p>Features, plans, prices and availability may change at any time. The price shown at checkout is the price of your order.</p>`],
      ['Orders and payment', ul([
        'An order is placed when you complete checkout. Checkout and payment are handled by our store provider, SellApp (sell.app).',
        'We accept the payment methods shown at checkout, currently PayPal, Cash App and Solana (SOL). Processor rules and fees apply.',
        'Your key is only delivered once the payment is confirmed. An unpaid or expired order is not fulfilled.',
        'We do not receive or store your card number, wallet seed phrase or private keys.',
        'Payments sent outside the checkout, to a wrong address or on a wrong network cannot be matched to an order and cannot be recovered by us.'])],
      ['Delivery', `<p>After the payment is confirmed your license key is shown on the confirmation page and sent to the email address you entered at checkout, normally within minutes. Keys are not stored in your website account, so keep that email. If you did not receive your key, open a <b>Delivery</b> ticket in our Discord server with your order number.</p><p>After your first purchase you can claim the Customer role in our Discord with your order number.</p>`],
      ['Licenses', ul([
        'A license key gives you a personal, non-exclusive, non-transferable right to use the Product for the duration of your plan.',
        'The duration starts when the key is first activated, and a key is locked to the first device (HWID) that activates it.',
        'Keys may not be shared, resold, published or used on more than one device. Sharing a key voids the license without refund.',
        'We may revoke a license if we detect fraud, abuse or a breach of these Terms.'])],
      ['Acceptable use', `<p>You agree not to:</p>${ul([
        'reverse-engineer, decompile, modify, repackage, leak, crack or redistribute any Product or loader file;',
        'share your key, login details or loader files with anyone else;',
        'attempt to bypass or interfere with license authentication, the website or our API;',
        'abuse, harass or deceive our staff or support system;',
        'resell keys or Products without our written permission.'])}<p>A breach can lead to immediate termination of your licenses and access.</p>`],
      ['Third-party games and risk', `<p>Our Products are used together with third-party games and platforms that we do not control. Using them may violate those platforms’ rules and can result in warnings, restrictions or bans of your game account, your hardware, or both, as well as stat resets and other penalties.</p><p>We work to keep our Products undetected, but no cheat or modification is ever risk-free and we do not guarantee that a Product is or will remain undetected. The status shown on the Product page and on our status page is our current information, not a promise. You use the Products entirely at your own risk and Plasma is not liable for any penalty issued by a game developer, platform or anti-cheat system.</p>`],
      ['Availability and updates', `<p>Products can go offline at any time for updates, maintenance or because of changes by third parties. We may modify, update or discontinue a Product at any time. We post status changes on our status page and in our Discord server. Downtime does not entitle you to compensation or a refund.</p>`],
      ['Support', `<p>Support is provided through tickets in our Discord server for customers with an order. We aim to reply quickly, but we do not guarantee that support is available at all times or that every request can be solved.</p>`],
      ['Refunds', `<p>All sales are final. Please read our ${L.refund} before you buy.</p>`],
      ['Chargebacks and fraud', `<p>Fraud, payment disputes and chargebacks result in:</p>${ul([
        'immediate termination of all licenses;',
        'blacklisting from all Plasma services;',
        'removal from future giveaways and promotions.'])}<p>We reserve the right to pursue claims for damages caused by fraudulent purchases. If something is wrong with an order, contact us first. Almost every problem is solved in a ticket.</p>`],
      ['Intellectual property', `<p>The Products, software, branding, text and images on this site belong to Plasma or its licensors and are protected by law. Nothing in these Terms transfers ownership to you. Game names, logos and trademarks belong to their respective owners. Plasma is not affiliated with, endorsed by or sponsored by any game publisher or developer.</p>`],
      ['Termination', `<p>You may stop using our services at any time. We may suspend or terminate your access or licenses, with or without notice, for a breach of these Terms, fraud, chargebacks, abuse of staff, or where required by law. Plans that were already paid are not refunded after a termination for cause.</p>`],
      ['Warranty and liability', `<p>Products and services are provided “as is” and “as available”, without warranties of any kind, including fitness for a particular purpose, uninterrupted availability or non-detection. To the extent permitted by law, Plasma is not liable for indirect or consequential loss, lost data, lost profits, or the loss of accounts, bans and restrictions on third-party platforms. Our total liability for any claim is limited to the amount you paid for the order the claim relates to.</p>`],
      ['Privacy', `<p>How we handle personal data is described in our ${L.privacy}. We do not sell your personal data.</p>`],
      ['Changes', `<p>We may update these Terms. The current version is always published on this page with its effective date, and continued use of our services after a change means you accept the updated Terms.</p>`],
      ['Contact', `<p>Questions about these Terms can be sent in a ticket in our Discord server.</p>`]
    ]
  },

  privacy: {
    title: 'Privacy Policy', sub: 'What data we store, why, for how long, and what you can ask us to do with it.',
    sections: [
      ['Who is responsible', `<p>Plasma (“Plasma”, “we”, “us”) operates plasmatools.org, our Discord bot and our API. For any privacy question, open a ticket in our Discord server. This policy is part of our ${L.terms}.</p>`],
      ['What we collect', tbl(['Category', 'Data', 'Source'], [
        ['Account', 'Discord user ID, username, display name, avatar, email address and whether it is verified', 'Discord login (identify and email permissions)'],
        ['Orders', 'Order number, Product, plan, quantity, price, payment method, order status and the email entered at checkout', 'Your order and our store provider, SellApp'],
        ['Payments', 'Payment status and amount. Card and wallet details are handled by the payment providers, not by us', 'SellApp and the payment providers'],
        ['Licenses', 'License key, activation time, expiry and a device identifier (HWID) once the key is activated', 'Loader activation'],
        ['Support', 'Ticket messages and attachments, order numbers and role claims in our Discord server', 'Discord'],
        ['Reviews', 'Your /vouch message, star rating, Discord username, avatar and date. Reviews are shown publicly on our reviews page', 'Discord /vouch command'],
        ['Technical', 'IP address and request data, processed by our hosting and API providers for security and rate limiting', 'Your use of the site']
      ])],
      ['Why we use it', tbl(['Purpose', 'Data used'], [
        ['Processing orders and delivering keys', 'Order data, email, payment status'],
        ['Showing your orders in your account', 'Discord email matched to your orders'],
        ['License verification and preventing key sharing', 'License key, activation time, device identifier'],
        ['Customer support and role claims', 'Ticket messages, order numbers, Discord account'],
        ['Fraud, chargeback and abuse prevention', 'Order, payment and technical data'],
        ['Displaying customer reviews', 'Review text, rating, Discord name and avatar'],
        ['Keeping the site and API secure', 'IP address and request data']
      ]) + `<p>We do not sell personal data and we do not run advertising or third-party tracking on this site.</p>`],
      ['Who receives your data', `<p>We only share data with the services we need to run the store:</p>${ul([
        '<b>Discord</b>: login, our server, tickets and the bot run on Discord and are subject to Discord’s own privacy policy.',
        '<b>SellApp</b> (sell.app): checkout, orders and key delivery, together with the payment providers it uses (PayPal, Cash App and the Solana network).',
        '<b>Hosting</b>: the website is hosted on GitHub Pages and our bot and API on Railway.',
        '<b>Public blockchain</b>: Solana payments are recorded on a public ledger that we cannot edit or delete.',
        '<b>Authorities</b>: where we are legally required to disclose information, or to protect Plasma and others from fraud or abuse.'])}`],
      ['Browser storage and cookies', `<p>We do not use advertising or analytics cookies. The site stores two things in your browser so it can work: your Discord login session and your shopping cart. Logging out removes the session, and you can clear both at any time in your browser settings.</p><p>When you open a page, your browser also loads fonts from Google Fonts and Fontshare, which receive your IP address as part of that request. Logging in sends you to Discord’s own login page.</p>`],
      ['Retention', `<p>We keep order records (email, Product, status) as long as needed for support, fraud prevention and license history. License records are kept for the life of the license and as long afterwards as needed to prevent abuse. Support tickets stay in our Discord server until they are deleted. Reviews stay on the reviews page until you ask us to remove them.</p>`],
      ['Security', `<p>The site and our API use HTTPS. The API only accepts requests from our website, applies rate limiting, and uses your Discord login only to verify who you are. Secrets and keys are stored on our server, never in the website. No system is completely secure. If you find a vulnerability, please tell us in a ticket.</p>`],
      ['Your choices', `<p>You can ask us in a ticket what data we hold about you, to correct it, or to delete your support messages, reviews and account data. We may keep what we must keep for fraud prevention, license history or legal reasons. Deleting a record does not refund a purchase, and delivered digital goods cannot be taken back.</p><p>You can also remove Plasma’s access to your Discord account at any time in Discord under Settings, Authorized Apps.</p>`],
      ['Age', `<p>Our services are not directed at children under 13 and we do not knowingly collect personal data from them. If you believe a child has given us data, tell us in a ticket and we will delete it.</p>`],
      ['Changes', `<p>We update this policy when our services or the law change. The current version is always on this page with its effective date.</p>`]
    ]
  },

  refund: {
    title: 'Refund Policy', sub: 'When a purchase can be fixed or replaced, and when it cannot.',
    sections: [
      ['Digital products are final', `<p>All Products are digital and delivered right after payment. Once a license key has been delivered, the sale is final. There is no refund for a change of mind, for buying the wrong Product or duration, or for not using the Product.</p>`],
      ['When we will fix an order', tbl(['Situation', 'What we do'], [
        ['Payment confirmed but your key was not delivered', 'We check the order and deliver your key'],
        ['Key is invalid or will not activate when delivered', 'We replace the key with a working one'],
        ['Key was delivered to the wrong email because of a typo at checkout', 'We verify the order and re-send the key to the right address']
      ]) + `<p>Staff look at every case individually, based on the order, the key and the license records. Decisions are final.</p>`],
      ['Not covered', ul([
        'Bans, suspensions or restrictions on your game accounts, hardware or any third-party platform. Using the Products is at your own risk (see section 8 of our ' + L.terms + ').',
        'Maintenance, updates, downtime or a Product being temporarily detected or offline.',
        'Compatibility with your hardware, operating system, antivirus or other software.',
        'Keys that were shared, resold, leaked, or used in breach of the Terms.',
        'Lost keys, when the delivery email was received. Check your inbox and spam folder first.',
        'Sales, discount codes or price changes that happened after your purchase.',
        'Payments sent outside the checkout, to a wrong address, on a wrong network or in a wrong amount.'])],
      ['Crypto payments', `<p>Solana payments are final on the blockchain and we cannot reverse them. Only the amount shown at checkout, sent to the address shown at checkout, can be matched to an order.</p>`],
      ['Chargebacks and disputes', `<p>Opening a dispute or chargeback before contacting support is treated as fraud: all licenses are revoked and you are blacklisted from our services. Contact us first. Almost every problem is solved in a ticket.</p>`],
      ['How to get help with an order', ol([
        'Open a ticket in our Discord server as soon as you notice the problem.',
        'Include your order number, your key and what happened. Screenshots and error messages help.',
        'Staff review the order and reply in the ticket.'])]
    ]
  }
};

const tabs = [['terms', 'Terms'], ['privacy', 'Privacy'], ['refund', 'Refunds']];
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

for (const [key, p] of Object.entries(pages)) {
  const toc = p.sections.map((s, i) => `<a href="#s${i + 1}" data-t="s${i + 1}"><span>${i + 1}</span>${s[0]}</a>`).join('');
  const body = p.sections.map((s, i) => `<section id="s${i + 1}"><h2><span>${i + 1}</span>${s[0]}</h2>${s[1]}</section>`).join('');
  const html = head(p.title, p.sub) + `<main class="page"><div class="wrap lgl">
  <nav class="ltabs" aria-label="Legal pages">${tabs.map(t => `<a href="/${t[0]}"${t[0] === key ? ' class="on"' : ''}>${t[1]}</a>`).join('')}</nav>
  <header class="lhead"><h1>${p.title}</h1><p>${p.sub}</p><small>Effective <b>${EFFECTIVE}</b><i></i>Plasma</small></header>
  <div class="llayout">
    <aside class="ltoc"><span>On this page</span>${toc}</aside>
    <article class="lbody">${body}
      <div class="lcta"><div><b>Questions about this policy?</b><small>Open a ticket in our Discord server and our team will help.</small></div><a class="btn btn-main" id="lcta" href="#" target="_blank" rel="noopener">Open Discord</a></div>
    </article>
  </div>
</div></main>
<script src="/assets/site.js?v=${V}"></script>
<script>
document.getElementById("lcta").href = CONFIG.discord;
// table of contents: smooth jump without putting a #hash in the address bar, plus scroll highlight
const links = [...document.querySelectorAll(".ltoc a")], secs = links.map(a => document.getElementById(a.dataset.t));
links.forEach(a => a.addEventListener("click", e => { e.preventDefault(); document.getElementById(a.dataset.t).scrollIntoView({ behavior: "smooth", block: "start" }); }));
const spy = () => { let cur = 0; secs.forEach((s, i) => { if (s.getBoundingClientRect().top < 140) cur = i; }); links.forEach((a, i) => a.classList.toggle("on", i === cur)); };
addEventListener("scroll", spy, { passive: true }); spy();
</script>
</body>
</html>
`;
  fs.writeFileSync(`${key}.html`, html);
}
console.log('built');
