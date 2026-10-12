import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
const manageRoles = PermissionFlagsBits.ManageRoles;
import { PRODUCTS, STATUSES } from './config.js';
import { DURATIONS } from './licenses.js';

const admin = PermissionFlagsBits.ManageGuild;

export const commands = [
  new SlashCommandBuilder()
    .setName('setup-status').setDescription('Post the product uptime panel in this channel')
    .setDefaultMemberPermissions(admin),
  new SlashCommandBuilder()
    .setName('status').setDescription("Set a product's status and refresh the uptime panel")
    .setDefaultMemberPermissions(admin)
    .addStringOption(o => o.setName('product').setDescription('Product').setRequired(true)
      .addChoices(...PRODUCTS.map(p => ({ name: p.name, value: p.key }))))
    .addStringOption(o => o.setName('state').setDescription('New status').setRequired(true)
      .addChoices(...Object.entries(STATUSES).map(([k, v]) => ({ name: v.label, value: k })))),
  new SlashCommandBuilder()
    .setName('setup-role').setDescription('Post the Customer Role panel in this channel')
    .setDefaultMemberPermissions(admin),
  new SlashCommandBuilder()
    .setName('setup-tickets').setDescription('Post the ticket panel in this channel')
    .setDefaultMemberPermissions(admin),
  new SlashCommandBuilder()
    .setName('vouch').setDescription('Leave a vouch for Plasma')
    .addStringOption(o => o.setName('message').setDescription('What did you think?').setRequired(true).setMaxLength(500))
    .addIntegerOption(o => o.setName('stars').setDescription('Rating, 1-5').setRequired(true).setMinValue(1).setMaxValue(5))
    .addAttachmentOption(o => o.setName('proof').setDescription('Add an image/video as proof, it must be a png, jpg, jpeg, webp, gif or mp4 file.')),
  new SlashCommandBuilder()
    .setName('roleall').setDescription('Give (or remove) a role for every member')
    .setDefaultMemberPermissions(manageRoles)
    .addRoleOption(o => o.setName('role').setDescription('The role').setRequired(true))
    .addStringOption(o => o.setName('action').setDescription('Give or remove (default: give)')
      .addChoices({ name: 'Give the role', value: 'add' }, { name: 'Remove the role', value: 'remove' }))
    .addBooleanOption(o => o.setName('include_bots').setDescription('Also apply to bots (default: no)')),
  new SlashCommandBuilder()
    .setName('autorole').setDescription('Automatically give new members a role when they join')
    .setDefaultMemberPermissions(manageRoles)
    .addSubcommand(s => s.setName('set').setDescription('Set the role new members get')
      .addRoleOption(o => o.setName('role').setDescription('The role').setRequired(true)))
    .addSubcommand(s => s.setName('disable').setDescription('Turn the auto role off'))
    .addSubcommand(s => s.setName('status').setDescription('Show the current auto role')),
  new SlashCommandBuilder()
    .setName('generatekey').setDescription('Generate a license key locked to a member (staff only)')
    .setDefaultMemberPermissions(admin)
    .addStringOption(o => o.setName('product').setDescription('Product').setRequired(true)
      .addChoices(...PRODUCTS.map(p => ({ name: p.name, value: p.key }))))
    .addStringOption(o => o.setName('duration').setDescription('How long the key lasts').setRequired(true)
      .addChoices(...Object.entries(DURATIONS).map(([k, v]) => ({ name: v.label, value: k }))))
    .addUserOption(o => o.setName('user').setDescription('Who the key is for').setRequired(true)),
].map(c => c.toJSON());
