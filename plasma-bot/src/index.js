import {
  AttachmentBuilder, ActionRowBuilder, ChannelType, Client, EmbedBuilder, Events, GatewayIntentBits,
  MessageFlags, ModalBuilder, PermissionFlagsBits, TextInputBuilder, TextInputStyle,
} from 'discord.js';
import { COLOR, E, env, TICKET_TYPES } from './config.js';
import { load, save, saveProof } from './store.js';
import { lookupOrder } from './sellapp.js';
import { rolePanel, statusPanel, ticketControls, ticketPanel } from './panels.js';
import './api.js';
import { autoRole, onJoin, roleAll } from './roles.js';
import { generateKey } from './licenses.js';

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });

const EPHEMERAL = MessageFlags.Ephemeral;
const isStaff = m => m.permissions.has(PermissionFlagsBits.ManageGuild) ||
  (env.STAFF_ROLE_ID && m.roles.cache.has(env.STAFF_ROLE_ID));

client.on(Events.GuildMemberAdd, m => onJoin(m).catch(console.error));
client.once(Events.ClientReady, async c => {
  console.log(`Plasma bot online as ${c.user.tag}`);
  // re-render the live status panel from the saved statuses, so icon or wording changes show up after a redeploy
  try {
    const ref = load('statusPanel', null) || (env.STATUS_MESSAGE_ID ? { channelId: env.STATUS_CHANNEL_ID, messageId: env.STATUS_MESSAGE_ID } : null);
    if (!ref) return;
    const ch = await c.channels.fetch(ref.channelId).catch(() => null);
    const msg = await ch?.messages.fetch(ref.messageId).catch(() => null);
    if (msg) await msg.edit(statusPanel(load('status', {})));
  } catch (err) { console.error('status panel refresh failed', err); }
});

client.on(Events.InteractionCreate, async i => {
  try {
    if (i.isChatInputCommand()) return await onCommand(i);
    if (i.isButton()) {
      if (i.customId === 'role_open') return await roleModal(i);
      if (i.customId === 'ticket_close') return await closeTicket(i);
    }
    if (i.isModalSubmit() && i.customId === 'role_submit') return await roleSubmit(i);
    if (i.isStringSelectMenu() && i.customId === 'ticket_select') return await openTicket(i);
  } catch (err) {
    console.error(err);
    const msg = { content: 'Something went wrong. Please try again or contact staff.', flags: EPHEMERAL };
    if (i.deferred || i.replied) await i.followUp(msg).catch(() => {});
    else await i.reply(msg).catch(() => {});
  }
});

// ---------- slash commands ----------
async function onCommand(i) {
  switch (i.commandName) {
    case 'setup-status': {
      const state = load('status', {});
      const msg = await i.channel.send(statusPanel(state));
      save('statusPanel', { channelId: msg.channelId, messageId: msg.id });
      return i.reply({ content: 'Status panel posted. Use `/status` to change a product.', flags: EPHEMERAL });
    }
    case 'status': {
      const state = load('status', {});
      state[i.options.getString('product')] = i.options.getString('state');
      save('status', state);
      const meta = load('statusMeta', {});
      meta[i.options.getString('product')] = Date.now();
      save('statusMeta', meta);
      const ref = load('statusPanel', null) || (env.STATUS_MESSAGE_ID ? { channelId: env.STATUS_CHANNEL_ID, messageId: env.STATUS_MESSAGE_ID } : null);
      if (!ref) return i.reply({ content: 'Saved, but no panel exists yet. Run `/setup-status`.', flags: EPHEMERAL });
      const ch = await client.channels.fetch(ref.channelId).catch(() => null);
      const msg = await ch?.messages.fetch(ref.messageId).catch(() => null);
      if (!msg) return i.reply({ content: 'Saved, but the old panel message is gone. Run `/setup-status` again.', flags: EPHEMERAL });
      await msg.edit(statusPanel(state));
      return i.reply({ content: 'Updated.', flags: EPHEMERAL });
    }
    case 'setup-role':
      await i.channel.send(rolePanel());
      return i.reply({ content: 'Customer role panel posted.', flags: EPHEMERAL });
    case 'setup-tickets':
      await i.channel.send(ticketPanel());
      return i.reply({ content: 'Ticket panel posted.', flags: EPHEMERAL });
    case 'vouch':
      return vouch(i);
    case 'generatekey':
      return generateKey(i);
    case 'roleall':
      return roleAll(i);
    case 'autorole':
      return autoRole(i);
  }
}

// ---------- vouches ----------
async function vouch(i) {
  if (env.VOUCH_REQUIRES_CUSTOMER !== 'false' && env.CUSTOMER_ROLE_ID && !i.member.roles.cache.has(env.CUSTOMER_ROLE_ID)) {
    return i.reply({ content: 'Only verified customers can vouch. Get the Customer Role first.', flags: EPHEMERAL });
  }
  const data = load('vouches', { count: 0, last: {} });
  const stars = i.options.getInteger('stars');
  const proof = i.options.getAttachment('proof');
  const okTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'video/mp4'];
  if (proof && (!okTypes.includes((proof.contentType || '').split(';')[0]) || proof.size > 24 * 1024 * 1024)) {
    return i.reply({ content: 'Proof must be a png, jpg, jpeg, webp, gif or mp4 file under 24MB.', flags: EPHEMERAL });
  }
  data.count += 1;
  data.list = data.list || [];
  data.list.push({
    n: data.count, stars, message: i.options.getString('message'), at: Date.now(),
    username: i.user.globalName || i.user.username, avatar: i.user.displayAvatarURL({ size: 128, extension: 'png' }),
  });
  save('vouches', data);
  const now = new Date();
  const embed = new EmbedBuilder()
    .setColor(COLOR)
    .setTitle('New vouch created!')
    .setDescription('⭐'.repeat(stars) + '☆'.repeat(5 - stars))
    .addFields(
      { name: 'Vouch:', value: i.options.getString('message') },
      { name: 'Vouch Nº', value: String(data.count), inline: true },
      { name: 'Vouched by:', value: `<@${i.user.id}>`, inline: true },
      { name: 'Vouched at:', value: now.toISOString().replace('T', ' ').slice(0, 19), inline: true },
    )
    .setThumbnail(i.user.displayAvatarURL({ size: 256 }))
    .setFooter({ text: `Ran By ${env.SITE_NAME || 'Plasmatools.org'}` })
    .setTimestamp(now);
  const payload = { embeds: [embed] };
  if (proof) {
    await i.deferReply({ flags: EPHEMERAL });
    const buf = Buffer.from(await (await fetch(proof.url)).arrayBuffer());
    const name = proof.name.replace(/[^A-Za-z0-9._-]/g, '_');
    payload.files = [new AttachmentBuilder(buf, { name })];
    if (proof.contentType.startsWith('image/')) embed.setImage('attachment://' + name);
    // keep a copy of picture proofs so the website can show them on the review (images only, up to 10MB)
    const ext = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/gif': 'gif' }[(proof.contentType || '').split(';')[0]];
    if (ext && buf.length <= 10 * 1024 * 1024) {
      try {
        const file = `${data.count}.${ext}`;
        saveProof(file, buf);
        const entry = data.list.find(v => v.n === data.count);
        if (entry) { entry.proof = file; save('vouches', data); }
      } catch (err) { console.error('could not save vouch proof', err); }
    }
  }
  const target = env.VOUCH_CHANNEL_ID ? await client.channels.fetch(env.VOUCH_CHANNEL_ID).catch(() => null) : null;
  if (target && target.id !== i.channelId) {
    const m = await target.send(payload);
    await m.react('❤️').catch(() => {});
    return i[proof ? 'editReply' : 'reply']({ content: `Vouch posted in ${target}. Thank you!`, flags: EPHEMERAL });
  }
  let m;
  if (proof) { m = await i.channel.send(payload); await i.deleteReply().catch(() => {}); }
  else { await i.reply(payload); m = await i.fetchReply(); }
  await m.react('❤️').catch(() => {});
}

// ---------- customer role ----------
function roleModal(i) {
  const modal = new ModalBuilder().setCustomId('role_submit').setTitle('Verify your order')
    .addComponents(new ActionRowBuilder().addComponents(
      new TextInputBuilder().setCustomId('order_id').setLabel('Order ID').setPlaceholder('PLASMA-12345 or 12345')
        .setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(40)));
  return i.showModal(modal);
}

async function roleSubmit(i) {
  await i.deferReply({ flags: EPHEMERAL });
  const raw = i.fields.getTextInputValue('order_id').trim();
  const orderId = raw.replace(/^plasma-/i, '').replace(/^#/, '');
  if (!/^[A-Za-z0-9-]{1,40}$/.test(orderId)) return i.editReply("That doesn't look like a valid Order ID.");
  if (i.member.roles.cache.has(env.CUSTOMER_ROLE_ID)) return i.editReply('You already have the Customer Role.');

  const claimed = load('claimed', {});
  if (claimed[orderId] && claimed[orderId] !== i.user.id) {
    return i.editReply('That order has already been claimed by another account. Open a ticket if this is a mistake.');
  }
  const res = await lookupOrder(orderId);
  if (!res.ok) {
    const why = {
      not_configured: "Order verification isn't set up yet. Please open a ticket and staff will give you the role.",
      not_found: "I couldn't find that order. Double-check the ID from your email, or open a ticket.",
      unpaid: `That order isn't completed yet (status: ${res.status}). Try again once payment confirms.`,
      network: "Couldn't reach the store right now. Try again in a minute.",
      api_error: `The store returned an error (${res.status}). Please open a ticket.`,
    }[res.reason];
    return i.editReply(why);
  }
  claimed[orderId] = i.user.id;
  save('claimed', claimed);
  await i.member.roles.add(env.CUSTOMER_ROLE_ID, `Verified order ${orderId}`);
  return i.editReply(`${E.lock} Order verified. You now have the Customer Role!`);
}

// ---------- tickets ----------
async function openTicket(i) {
  const type = i.values[0];
  const t = TICKET_TYPES[type];
  const tickets = load('tickets', {});
  const existing = Object.entries(tickets).find(([, v]) => v.userId === i.user.id);
  if (existing && i.guild.channels.cache.has(existing[0])) {
    return i.reply({ content: `You already have an open ticket: <#${existing[0]}>`, flags: EPHEMERAL });
  }
  await i.deferReply({ flags: EPHEMERAL });
  const seen = [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.AttachFiles];
  const overwrites = [
    { id: i.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
    { id: i.user.id, allow: seen },
    { id: client.user.id, allow: [...seen, PermissionFlagsBits.ManageChannels] },
  ];
  if (env.STAFF_ROLE_ID) overwrites.push({ id: env.STAFF_ROLE_ID, allow: seen });
  const name = `${type}-${i.user.username}`.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 90);
  const ch = await i.guild.channels.create({
    name, type: ChannelType.GuildText, parent: env.TICKET_CATEGORY_ID || null,
    topic: `Ticket for ${i.user.tag} (${i.user.id}) - ${t.label}`, permissionOverwrites: overwrites,
  });
  tickets[ch.id] = { userId: i.user.id, type, opened: Date.now() };
  save('tickets', tickets);
  const embed = new EmbedBuilder().setColor(COLOR)
    .setTitle(`${t.label} Ticket`)
    .setDescription(`Welcome <@${i.user.id}>! Describe your issue in as much detail as you can (include your Order ID if you have one) and staff will be with you shortly.`)
    .setFooter({ text: 'Plasma Tech EST. 2023' });
  await ch.send({
    content: env.STAFF_ROLE_ID ? `<@${i.user.id}> <@&${env.STAFF_ROLE_ID}>` : `<@${i.user.id}>`,
    embeds: [embed], components: [ticketControls()],
  });
  await i.editReply(`Your ticket is ready: ${ch}`);
}

async function closeTicket(i) {
  const tickets = load('tickets', {});
  const tk = tickets[i.channelId];
  if (!tk) return i.reply({ content: "This isn't a tracked ticket.", flags: EPHEMERAL });
  if (i.user.id !== tk.userId && !isStaff(i.member)) {
    return i.reply({ content: 'Only the ticket owner or staff can close this.', flags: EPHEMERAL });
  }
  await i.reply('Closing this ticket in 5 seconds...');
  const msgs = [];
  let before;
  for (let n = 0; n < 10; n++) { // up to 1000 messages
    const batch = await i.channel.messages.fetch({ limit: 100, before });
    if (!batch.size) break;
    msgs.push(...batch.values());
    before = batch.last().id;
  }
  msgs.reverse();
  const text = msgs.map(m => `[${m.createdAt.toISOString()}] ${m.author.tag}: ${m.content}${m.attachments.size ? ' ' + m.attachments.map(a => a.url).join(' ') : ''}`).join('\n');
  const log = env.TICKET_LOG_CHANNEL_ID ? await client.channels.fetch(env.TICKET_LOG_CHANNEL_ID).catch(() => null) : null;
  if (log) {
    await log.send({
      content: `Ticket \`${i.channel.name}\` (${tk.type}) opened by <@${tk.userId}>, closed by <@${i.user.id}>`,
      files: [new AttachmentBuilder(Buffer.from(text || '(empty)'), { name: `${i.channel.name}.txt` })],
    });
  }
  delete tickets[i.channelId];
  save('tickets', tickets);
  setTimeout(() => i.channel.delete('Ticket closed').catch(() => {}), 5000);
}

client.login(env.DISCORD_TOKEN);
