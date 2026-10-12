import { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { COLOR, E } from './config.js';
import { DM, SITE, TAG, TICKETS, button, h, list, prices, t } from './productEmbeds.js';

const CH = {
  temp: '<#1556013995612176485>', perm: '<#1556014003346739200>',
  private: '1556013989585227910', slotted: '1556013991086526546',
  fortniteInfo: '1556013991908868199', spooferInfo: '1556014004395319349',
};
// custom check supplied; open-lock and cart still use standard emoji
const CHECK = '<:check:1558619932735049753>', UNLOCK = '🔓', CART = '🛒';
const US = '\\_'.repeat(18); // the row of underscores between the two products
const LOGO = `${SITE}/img/logo.png`;

const guide = (title, description, image) => new EmbedBuilder().setColor(COLOR).setTitle(title)
  .setDescription(description).setImage(`${SITE}/img/${image}`)
  .setFooter({ text: 'Plasma Information | Official Information', iconURL: LOGO }).setTimestamp(new Date());

const ticketLink = `[open a ticket](${TICKETS})`;

export function extraMessages() {
  // ---------- Fortnite Private ----------
  const priv = t('Plasma Private – Secure. Stable. Silent.', [
    '**Premium Fortnite Tool | Zero Bans | 500+ Daily Users**',
    '',
    h(E.pinkperson, 'Why Plasma?', true),
    list([
      '**Active Support Team** *(Help available when you need it)*',
      '**Customizable Configs** *(Adjust visuals, aimb0t styles & more)*',
      '**Fully Undetected** *(EAC/UAC Safe)*',
      '**Blazing Fast Setup & Delivery**',
      '**Legit Play & Competitive-Ready**',
    ]),
    '',
    h(E.lock, 'Secure & Lightweight', true),
    list(['**Cloud-Based Loader**', '**No Performance Loss**', '**Auto-Updates** & **Maintenance Included**']),
    '',
    h(E.hammer, 'Compatibility', true),
    list(['**Windows 10 & 11(24h2/25h2)**', '**Intel & AMD CPUs**']),
    '',
    h(TAG, 'Pricing Options', true),
    [
      '> `1 Day License` — **$6.99**',
      '> `7 Day License` — **$22.99**',
      `> \`1 Month License + 1 Month Of\` ${CH.temp} — **$49.99**`,
      '> `3 Month License` — **$99.99**',
      '> `6 Month License` — **$149.99**',
      `> \`Lifetime License + Lifetime\` ${CH.perm} — **$169.99**`,
    ].join('\n'),
    '',
    DM,
  ].join('\n')).setImage('attachment://fortnite-private-cheat.png');
  const privBanner = new EmbedBuilder().setColor(COLOR).setImage(`${SITE}/img/fortnite.webp`);

  // ---------- Fortnite Slotted ----------
  const slot = t('Plasma Slotted — Limited. Stable. Powerful.', [
    '**Exclusive Fortnite Slotted Access | Limited Slots | Performance Focused**',
    '',
    h(E.pinkperson, 'Why Plasma Slotted?', true),
    list([
      '**Extremely Limited Slots** *(kept small for stability & safety)*',
      '**Private-Level Performance** at a more accessible price',
      '**Optimized Legit Aimbot & Visuals** *(smooth, competitive-ready)*',
      '**Constant Updates & Maintenance** from the Plasma team',
      '**Blazing Fast Setup & Delivery**',
      '**Built on technology trusted by 3000+ players**',
    ]),
    '',
    h(E.lock, 'Secure & Optimized', true),
    list(['**Cloud-Based Loader**', '**Minimal Detection Surface** *(slots kept low for safety)*', '**No Performance Loss**', '**Auto-Updates Included**']),
    '',
    h(E.hammer, 'Compatibility', true),
    list(['**Windows 10 & 11(24h2/25h2)**', '**Intel & AMD CPUs**', 'Works on **all standard system configurations**']),
    '',
    h(TAG, 'Pricing Options', true),
    [
      '> `1 Week License` — **$29.99** *(Limited Slots)*',
      '> `1 Month License` — **$69.99** *(Limited Slots)*',
      '> `3 Month License` — **$129.99** *(Very Limited Slots)*',
    ].join('\n'),
    '',
    `${E.warning} **Slots are extremely limited and may close at any time.**`,
    '',
    DM,
  ].join('\n')).setImage(`${SITE}/img/fortnite-slotted.webp`);

  // ---------- Cheat guide ----------
  const cheat = guide('PlasmaTech | Cheat Guide', [
    'Fortnite Private vs Fortnite Slotted — Which Should You Choose?',
    '',
    'Not sure which Fortnite product is right for you?',
    "Here's a breakdown of the differences between Plasma Private and Plasma Slotted.",
    '',
    `## ${E.lock} Plasma Private`,
    'Our **main Fortnite chair** used by the majority of players.',
    'Built for users who want **consistent performance, reliability, and easy access**.',
    '',
    list(['Large active userbase', 'Constant updates & maintenance', 'Fully featured legit gameplay system', 'Stable performance across all systems', 'Most accessible Plasma Fortnite option']),
    '',
    `### ${CHECK} Best if:`,
    list(['You want a **reliable everyday chair**', 'You prefer the **most accessible option**', 'You want a **fully featured experience** at a lower cost']),
    '',
    US,
    '',
    `## ${UNLOCK} Plasma Slotted`,
    'Our **premium limited-access Fortnite chair**.',
    '',
    'Designed for players who want a **smaller, more controlled environment with higher stability and closer maintenance.**',
    '',
    list(['**Extremely restricted userbase**', '**Higher stability due to limited slots**', 'More frequent **maintenance & monitoring**', 'Faster safety updates due to fewer users', 'Premium environment for long-term users']),
    '',
    `### ${CHECK} Best if:`,
    list(['You want a **more exclusive experience**', 'You prefer a **smaller user environment**', 'You want the **most controlled and stable setup**']),
    '',
    `### ${E.question} Still Not Sure?`,
    'Choose based on **how exclusive you want your environment to be.**',
    `If you need help deciding, ${ticketLink} and we'll guide you.`,
  ].join('\n'), 'cheat-guide.webp');

  // ---------- Spoofer guide ----------
  const spoof = guide('PlasmaTech | Swoofer Guide', [
    '**Permanent vs Temporary Swoofer — Which Should You Choose?**',
    '',
    "Here's a simple comparison of our two swoofers and what each one is designed for.",
    'Your choice depends entirely on **how you plan to play.**',
    '',
    `## ${E.lock} Permanent Swoofer`,
    'Designed for users who want a **long-term, worry-free solution**.',
    '',
    list(['Permanent & **irreversible**', 'Deeply refreshes your system identifiers', 'Stays effective even after **full Windows reinstall**', 'Ideal for **legit gameplay only**', 'No need to ever worry about HWID links again']),
    '',
    `### ${CHECK} Best if:`,
    list(['You want to play **100% legit**', 'You never want to deal with hardware bans again', 'You want a **one-time solution**']),
    '',
    US,
    '',
    `## ${UNLOCK} Temporary Swoofer`,
    'Made for flexibility and frequent use.',
    '',
    list(['**Temporary & fully reversible**', 'Active only while running', 'Resets on **reboot**', 'Lightweight & fast', 'Ideal for users who switch between playstyles']),
    '',
    `### ${CHECK} Best if:`,
    list(['You frequently **switch between legit & non-legit**', 'You want control over when the swoofer is active', "You don't need a permanent system change"]),
    '',
    `### ${E.question} Still Not Sure?`,
    'Choose based on **how you play**, not what others use.',
    `If you need help deciding, ${ticketLink} and we'll guide you.`,
    '',
    `${CART} **[Purchase Here](${SITE}/products)**`,
  ].join('\n'), 'spoofer-guide.webp?v=2');

  const privFile = new AttachmentBuilder('assets/fortnite-private-cheat.png', { name: 'fortnite-private-cheat.png' });
  return [
    { channelId: CH.private, embeds: [priv, privBanner], files: [privFile], components: [button('fortnite-private')], key: 'fortnite-private' },
    {
      channelId: CH.slotted, embeds: [slot], key: 'slotted',
      components: [new ActionRowBuilder().addComponents(
        new ButtonBuilder().setLabel('Instant Delivery & Features').setEmoji('<:website:1558592824335794186>').setStyle(ButtonStyle.Link).setURL(`${SITE}/products`),
        new ButtonBuilder().setLabel('Open a Ticket').setEmoji(E.moneybag).setStyle(ButtonStyle.Link).setURL(TICKETS),
      )],
    },
    { channelId: CH.fortniteInfo, embeds: [cheat], components: [], key: 'cheat-guide' },
    { channelId: CH.spooferInfo, embeds: [spoof], components: [], key: 'spoofer-guide' },
  ];
}
