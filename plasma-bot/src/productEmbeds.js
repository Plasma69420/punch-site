import { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { COLOR, E } from './config.js';

export const SITE = 'https://plasmatools.org';
export const TAG = '<:pricetag:1558592820963713194>';
export const TICKETS = 'https://discord.com/channels/1555806695362666618/1556013981674635344'; // 🎫︱tickets
export const DM = '*We also accept purchases in tickets as well.*';

// heading line; `bold` matches how each original embed was styled
export const h = (emoji, text, bold) => `${emoji} ${bold ? `**${text}**` : text}`;
export const list = items => items.map(i => `- ${i}`).join('\n');
export const prices = rows => rows.map(([n, p]) => `> \`${n}\` — **${p}**`).join('\n');

export const t = (title, description) => new EmbedBuilder().setColor(COLOR).setTitle(title).setDescription(description);

export function button(slug) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setLabel('Instant Delivery & Features').setEmoji('<:website:1558592824335794186>').setStyle(ButtonStyle.Link).setURL(`${SITE}/${slug}`),
    new ButtonBuilder().setLabel('Open a Ticket').setEmoji(E.moneybag).setStyle(ButtonStyle.Link).setURL(TICKETS),
  );
}

// channel ids are from the Plasma server (📗︱temp, perm, r6, arc-raiders, marvel-rivals)
export function productMessages() {
  const temp = t('Plasma Temporary Virtualization – Lightweight. Safe. Effective.', [
    '**Bypass HWID Bans | Instant Swoofing | Trusted by Hundreds**',
    '',
    h(E.pinkperson, 'Why Plasma Temp?', false),
    list([
      '**One-click temporary swoofing** for most major games(FN, VAL, COD, APEX)',
      '**Swoofs all major hardware serials** (Disk, BIOS, MAC, more)',
      '**Fully undetected** from EAC, BE, RICO, VAN & More',
      '**Fast delivery** with easy-to-use interface',
      'Perfect for daily swoofing, and legit protection',
      'Built in **cleaner\'s** (Fortnite, COD ETC)',
      'Hyperv1sor temporary serial changer',
    ]),
    '',
    h(E.hammer, 'Compatibility', false),
    list(['**Windows 10 & 11**', '**Intel & AMD CPUs**', 'Tested against **EAC / BE / UAC / RICO**  protected games']),
    '',
    h(TAG, 'Pricing Options', false),
    prices([['1 Day Access', '$4.99'], ['3 Day Access', '$11.99'], ['1 Week Access', '$19.99'], ['1 Month Access', '$49.99'], ['Lifetime Access', '$109.99']]),
    '',
    DM,
  ].join('\n')).setImage(`${SITE}/img/temp-spoofer.webp`);

  const note = '> *(Required for Fortnite tournaments & Valo)*';
  const perm = t('Plasma Permanent Virtualization – Kernel-Level. Secure. Lifetime Ready.', [
    '**Full Hardware ID Swoofing | 100% Kernel-Based | Permanent & Undetected**',
    '',
    h(E.pinkperson, 'Why Plasma Perm?', true),
    list([
      '**Kernel-Level Swoofing** — permanent & secure',
      '**Swoofs all major serials** (Disk, SMBIOS, GPU, MAC, NIC)',
      '**Revert + Persistent Modes** — choose what fits your needs',
      '**Automatically cleans logs, traces, & hardware history**',
      '**No RAID0, no nonsense** — supports **all system configs**',
      'Includes **EFI + Driver + Seeding Swoofing System**',
    ]),
    '',
    h(E.hammer, 'Compatibility & Reliability', true),
    list(['**Windows 10 & 11 (24h2 & 25h2)**', '**Intel & AMD CPUs**', 'Works flawlessly with **all major motherboard brands** (ASUS, MSI, Dell, HP, Acer, etc.)']),
    '',
    h(TAG, 'Pricing Options', true),
    '',
    '**One-Time Usage**',
    prices([['Without TPM Swoof', '$19.99'], ['With Optional TPM Swoof', '$34.99']]),
    note,
    '',
    '**Lifetime Usage**',
    prices([['Without TPM Swoof', '$54.99'], ['With Optional TPM Swoof', '$59.99']]),
    note,
    '',
    DM,
  ].join('\n')).setImage(`${SITE}/img/perm-spoofer.webp`);

  const r6 = t('Plasma R6 – Secure. Stable. Silent.', [
    '**Premium Rainbow Six Siege Tool | Zero Bans | Competitive Ready**',
    '',
    h(E.pinkperson, 'Why Plasma R6?', true),
    list([
      '**Active Support Team** *(Help whenever you need it)*',
      '**Highly Customizable Features** *(visuals, aim styles, legit & rage setups)*',
      '**Fully Undetected** *(BattlEye Safe)*',
      '**Instant Setup & Fast Delivery**',
      '**Ranked-Ready & Competitive Optimized**',
    ]),
    '',
    h(E.lock, 'Secure & Lightweight', true),
    list(['**Cloud-Based Loader**', '**No FPS Loss / No Input Delay**', '**Auto-Updates & Full Maintenance Included**']),
    '',
    h(E.hammer, 'Compatibility', true),
    list(['**Windows 10 & 11**', '**Intel & AMD CPUs**']),
    '',
    h(TAG, 'Pricing Options', true),
    prices([['1 Day License', '$6.99'], ['1 Week License', '$26.99'], ['1 Month License', '$59.99'], ['Lifetime License', '$149.99']]),
    '',
    DM,
  ].join('\n')).setImage(`${SITE}/img/r6-external.webp`);

  const arc = t('Arc Raiders Tool – Safe. Stable. Private.', [
    '**Premium PvPvE Advantage | Built for Control | Performance Optimized**',
    '',
    h(E.pinkperson, 'Why Plasma Arc?', true),
    list([
      '**Active Support Team** *(Real help when you need it)*',
      '**Advanced Aimb0t System** *(Smooth FOV, Prediction, Custom Aim Key)*',
      '**Player Visuals + Loot Visuals** *(Full awareness at all times)*',
      '**No Recoil & Precision Control**',
      '**Blazing Fast Setup & Instant Activation**',
      '**Stream-Safe Protection** *(Safe on OBS, Discord, TikTok, Twitch)*',
      '**Tested Frequently & Maintained Consistently**',
    ]),
    '',
    h(E.lock, 'Secure & Optimized', true),
    list(['**Lightweight External Tool**', '**Minimal Resource Usage**', '**Auto-Updates Included**', '**Stable & Clean Interface**']),
    '',
    h(E.hammer, 'Compatibility', true),
    list(['**Windows 10 & 11**', '**Intel & AMD CPUs**', '**All Major Launchers Supported**']),
    '',
    h(TAG, 'Pricing Options', true),
    prices([['1 Day License', '$5.99'], ['1 Week License', '$22.99'], ['1 Month License', '$54.99']]),
    '',
    DM,
  ].join('\n')).setImage(`${SITE}/img/arc-raiders.webp`);

  const mr1 = t('Plasma Rivals – Secure. Stable. Silent.', [
    h(E.pinkperson, 'Why Plasma?', true),
    list([
      '**Advanced Hero-Aware Aimbot**', '**Projectile Prediction System**', '**Fully Customizable Settings**',
      '**Fast Setup & Instant Delivery**', '**Legit & Rage Playstyles Supported**', '**Active Support Team**',
    ]),
    '',
    h(E.lock, 'Secure & Lightweight', true),
    list(['**Cloud-Based Loader**', '**Low Resource Usage**', '**Frequent Updates**', '**Ongoing Maintenance Included**']),
    '',
    h(E.hammer, 'Compatibility', true),
    list(['**Windows 10 & 11**', '**Intel & AMD CPUs**', '**Supports STEAM & EPIC game versions**']),
    '',
    h(TAG, 'Pricing Options', true),
    prices([['1 Day License', '$5.99'], ['1 Week License', '$19.99'], ['1 Month License', '$39.99']]),
    '',
    DM,
  ].join('\n')).setImage('attachment://marvel-cheat.webp');
  const mr2 = new EmbedBuilder().setColor(COLOR).setImage(`${SITE}/img/marvel-rivals.webp`);

  return [
    { channelId: '1556013995612176485', slug: 'temp-spoofer', embeds: [temp] },
    { channelId: '1556014003346739200', slug: 'perm-spoofer', embeds: [perm] },
    { channelId: '1556014007083868220', slug: 'r6-external', embeds: [r6] },
    { channelId: '1556014008962908372', slug: 'arc-raiders', embeds: [arc] },
    { channelId: '1556014012460957772', slug: 'marvel-rivals', embeds: [mr1, mr2], files: [new AttachmentBuilder('assets/marvel-cheat.webp', { name: 'marvel-cheat.webp' })] },
  ].map(m => ({ ...m, components: [button(m.slug)] }));
}
