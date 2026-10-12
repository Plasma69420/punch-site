import {
  ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, StringSelectMenuBuilder,
} from 'discord.js';
import { COLOR, E, env, DEFAULT_STATUS, PRODUCTS, STATUSES, TICKET_TYPES } from './config.js';

export function statusPanel(state) {
  const now = Math.floor(Date.now() / 1000);
  const lines = PRODUCTS.map(p => {
    const s = STATUSES[state[p.key] || DEFAULT_STATUS[p.key]] || STATUSES.undetected;
    return `${s.icon} **${p.name}**: ${s.label}`;
  }).join('\n');
  const embed = new EmbedBuilder()
    .setColor(COLOR)
    .setTitle(`${E.rocket} Product Uptime Status`)
    .setDescription('Check the latest status of our products below. All systems are regularly monitored for your convenience.')
    .addFields(
      { name: `${E.hammer} Last Checked`, value: `<t:${now}:d> - <t:${now}:t>` },
      { name: 'Product Status', value: lines },
      { name: `${E.satellite} Live Status`, value: 'Click the **Live Status** button below for real-time updates.' },
    )
    .setFooter({ text: 'Plasma | Stay informed with our uptime monitoring!' });
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setLabel('Live Status').setStyle(ButtonStyle.Link).setURL(env.LIVE_STATUS_URL || 'https://plasmatools.org/status'),
  );
  return { embeds: [embed], components: [row] };
}

export function rolePanel() {
  const embed = new EmbedBuilder()
    .setColor(COLOR)
    .setTitle(`${E.pinkperson} Get Your Customer Role`)
    .setDescription(
      'To access exclusive content, support, and more, click the **Customer Role** button below and enter your **Order ID** (`PLASMA-...` from your email / thank-you page) to receive your customer role instantly!\n\n' +
      `${E.lock} **Why You Need This Role:**\n\n` +
      '• Access to private channels and resources\n• Priority support for any issues or questions\n• Stay updated on the latest news and loaders\n\n' +
      `${E.warning} **Important:**\n\n` +
      '• Please use the Order ID from your Plasma order email (starts with `PLASMA-`).\n' +
      '• If you encounter issues, feel free to contact our support team for assistance.',
    );
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('role_open').setLabel('Customer Role').setEmoji('🔑').setStyle(ButtonStyle.Primary),
  );
  return { embeds: [embed], components: [row] };
}

export function ticketPanel() {
  const embed = new EmbedBuilder()
    .setColor(COLOR)
    .setTitle('Plasma Ticket Panel')
    .setDescription(
      'To submit a request, please select the appropriate category below that best matches your issue. Each ticket should focus on a single topic, so please ensure you choose the most relevant option.\n\n' +
      '**Ticket Rules:**\n' +
      '• We do not provide support for individuals who obtain products or services from resellers.\n' +
      "• Please don't open multiple tickets for the same problem. Keeping everything in one place helps us address your concerns faster.\n" +
      "• We need complete company details before we can assist you. Without this, we won't be able to move forward.\n" +
      "• Maintain courteous communication at all times. We'll always return the same level of respect.",
    )
    .setFooter({ text: 'Plasma Tech EST. 2023' });
  const menu = new StringSelectMenuBuilder()
    .setCustomId('ticket_select').setPlaceholder('Make a selection')
    .addOptions(Object.entries(TICKET_TYPES).map(([value, t]) => ({
      label: t.label, description: t.description, value, emoji: t.emoji,
    })));
  return { embeds: [embed], components: [new ActionRowBuilder().addComponents(menu)] };
}

export function ticketControls() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('ticket_close').setLabel('Close Ticket').setEmoji('🔒').setStyle(ButtonStyle.Danger),
  );
}
