import crypto from 'node:crypto';
import { EmbedBuilder, MessageFlags, PermissionFlagsBits } from 'discord.js';
import { COLOR, E, env, PRODUCTS } from './config.js';
import { load, save } from './store.js';

const DAY = 86400000;
export const DURATIONS = {
  '1d': { label: '1 Day', ms: DAY }, '3d': { label: '3 Days', ms: 3 * DAY }, '1w': { label: '1 Week', ms: 7 * DAY },
  '1m': { label: '1 Month', ms: 30 * DAY }, '3m': { label: '3 Months', ms: 90 * DAY }, '6m': { label: '6 Months', ms: 180 * DAY },
  lifetime: { label: 'Lifetime', ms: null },
};
const CODES = { fortnite: 'FNPRIV', r6: 'R6', marvel: 'MR', arc: 'ARC', tempspoof: 'TEMP', permspoof: 'PERM' };
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I
const group = () => Array.from({ length: 5 }, () => ALPHABET[crypto.randomInt(ALPHABET.length)]).join('');
const TICKETS = 'https://discord.com/channels/1555806695362666618/1556013981674635344';

function newKey(product) {
  const licenses = load('licenses', {});
  let key;
  do { key = `PLASMA-${CODES[product] || 'KEY'}-${group()}-${group()}-${group()}`; } while (licenses[key]);
  return key;
}

export function keyEmbed({ key, productName, durationLabel, userId, by }) {
  return new EmbedBuilder().setColor(COLOR)
    .setTitle(`${E.rocket} License Key Generated`)
    .setDescription(`Your **${productName}** license is ready. Keep it private, it works for one person only.`)
    .addFields(
      { name: `${E.moneybag} Product`, value: productName, inline: true },
      { name: `${E.hammer} Duration`, value: durationLabel, inline: true },
      { name: `${E.pinkperson} Licensed To`, value: `<@${userId}>`, inline: true },
      { name: `${E.lock} License Key`, value: `\`\`\`${key}\`\`\`` },
      { name: `${E.satellite} HWID Lock`, value: 'Locked to the **first device** that activates it. The duration starts counting on first activation.' },
      { name: `${E.question} Need help?`, value: `Open a [ticket](${TICKETS}) and we will sort you out.` },
    )
    .setFooter({ text: `Plasma | Official Licensing${by ? ` • Issued by ${by}` : ''}`, iconURL: 'https://plasmatools.org/img/logo.png' })
    .setTimestamp(new Date());
}

// /generatekey product duration user
export async function generateKey(i) {
  const staffOk = i.memberPermissions.has(PermissionFlagsBits.ManageGuild) || (env.STAFF_ROLE_ID && i.member.roles.cache.has(env.STAFF_ROLE_ID));
  if (!staffOk) return i.reply({ content: 'Only staff can generate keys.', flags: MessageFlags.Ephemeral });
  const product = i.options.getString('product', true);
  const dur = i.options.getString('duration', true);
  const user = i.options.getUser('user', true);
  if (user.bot) return i.reply({ content: 'Pick a real member, not a bot.', flags: MessageFlags.Ephemeral });
  const productName = PRODUCTS.find(p => p.key === product)?.name || product;
  const d = DURATIONS[dur];

  const key = newKey(product);
  const licenses = load('licenses', {});
  licenses[key] = {
    product, productName, duration: dur, durationLabel: d.label, userId: user.id,
    createdBy: i.user.id, createdAt: Date.now(), hwid: null, activatedAt: null, expiresAt: null, revoked: false,
  };
  save('licenses', licenses);

  const embed = keyEmbed({ key, productName, durationLabel: d.label, userId: user.id, by: i.user.username });
  let dmNote = 'The key was also sent to them by DM.';
  try { await user.send({ embeds: [embed] }); }
  catch { dmNote = 'Their DMs are closed, so copy the key above and give it to them.'; }
  return i.reply({ content: dmNote, embeds: [embed], flags: MessageFlags.Ephemeral });
}

// Called by your loader: POST /api/license/verify { key, hwid }
// First call binds the key to that hardware id and starts the clock. Other hardware ids are refused.
export function verifyLicense(key, hwid) {
  if (typeof key !== 'string' || typeof hwid !== 'string' || key.length > 60 || hwid.length < 8 || hwid.length > 200) {
    return { valid: false, error: 'bad_request' };
  }
  const licenses = load('licenses', {});
  const lic = licenses[key.trim().toUpperCase()];
  if (!lic) return { valid: false, error: 'invalid_key' };
  if (lic.revoked) return { valid: false, error: 'revoked' };
  if (lic.hwid && lic.hwid !== hwid) return { valid: false, error: 'hwid_mismatch' };
  if (!lic.hwid) {
    lic.hwid = hwid; lic.activatedAt = Date.now();
    const ms = DURATIONS[lic.duration].ms;
    lic.expiresAt = ms ? lic.activatedAt + ms : null;
    save('licenses', licenses);
  }
  if (lic.expiresAt && Date.now() > lic.expiresAt) return { valid: false, error: 'expired' };
  return { valid: true, product: lic.product, productName: lic.productName, expiresAt: lic.expiresAt, lifetime: !lic.expiresAt };
}
