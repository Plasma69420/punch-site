import { MessageFlags, PermissionFlagsBits } from 'discord.js';
import { load, save } from './store.js';

const EPHEMERAL = MessageFlags.Ephemeral;
const canManage = m => m.permissions.has(PermissionFlagsBits.Administrator) || m.permissions.has(PermissionFlagsBits.ManageRoles);

// Why the bot can't hand out this role (or null when it can)
function roleProblem(guild, role) {
  if (role.id === guild.id) return "You can't use @everyone.";
  if (role.managed) return "That role is managed by an integration or bot, so I can't assign it.";
  const me = guild.members.me;
  if (!me.permissions.has(PermissionFlagsBits.ManageRoles)) return 'I need the **Manage Roles** permission.';
  if (role.position >= me.roles.highest.position) {
    return `My role (**${me.roles.highest.name}**) must be **above** ${role} in Server Settings → Roles. Drag it up, then try again.`;
  }
  return null;
}

// /roleall role:<role> [action] [include_bots]
export async function roleAll(i) {
  if (!canManage(i.member)) return i.reply({ content: 'You need **Manage Roles** to use this.', flags: EPHEMERAL });
  const role = i.options.getRole('role', true);
  const remove = i.options.getString('action') === 'remove';
  const includeBots = i.options.getBoolean('include_bots') ?? false;
  const problem = roleProblem(i.guild, role);
  if (problem) return i.reply({ content: problem, flags: EPHEMERAL });

  await i.deferReply({ flags: EPHEMERAL });
  const members = await i.guild.members.fetch();
  const targets = members.filter(m => (includeBots || !m.user.bot) && m.roles.cache.has(role.id) === remove);
  if (!targets.size) return i.editReply(`Nothing to do: everyone already ${remove ? 'lacks' : 'has'} ${role}.`);

  let done = 0, failed = 0, last = Date.now();
  const verb = remove ? 'Removing' : 'Giving';
  await i.editReply(`${verb} ${role} for **${targets.size}** members...`);
  for (const m of targets.values()) {
    try {
      await (remove ? m.roles.remove(role, `/roleall by ${i.user.tag}`) : m.roles.add(role, `/roleall by ${i.user.tag}`));
      done++;
    } catch { failed++; }
    if (Date.now() - last > 4000) { last = Date.now(); await i.editReply(`${verb} ${role}... **${done + failed}/${targets.size}**`).catch(() => {}); }
  }
  return i.editReply(`Done. ${remove ? 'Removed' : 'Gave'} ${role} ${remove ? 'from' : 'to'} **${done}** members${failed ? `, **${failed}** failed (usually members above my role)` : ''}.`);
}

// /autorole set|disable|status
export async function autoRole(i) {
  if (!canManage(i.member)) return i.reply({ content: 'You need **Manage Roles** to use this.', flags: EPHEMERAL });
  const settings = load('settings', {});
  const sub = i.options.getSubcommand();
  if (sub === 'set') {
    const role = i.options.getRole('role', true);
    const problem = roleProblem(i.guild, role);
    if (problem) return i.reply({ content: problem, flags: EPHEMERAL });
    settings.autoRole = role.id;
    save('settings', settings);
    return i.reply({ content: `New members will now automatically get ${role}.`, flags: EPHEMERAL });
  }
  if (sub === 'disable') {
    delete settings.autoRole;
    save('settings', settings);
    return i.reply({ content: 'Auto role turned off.', flags: EPHEMERAL });
  }
  const r = settings.autoRole && i.guild.roles.cache.get(settings.autoRole);
  return i.reply({ content: r ? `Auto role is ${r}.` : 'Auto role is **off**. Use `/autorole set`.', flags: EPHEMERAL });
}

// runs for every new member
export async function onJoin(member) {
  const id = load('settings', {}).autoRole;
  if (!id || member.user.bot) return;
  const role = member.guild.roles.cache.get(id);
  if (!role || roleProblem(member.guild, role)) return;
  await member.roles.add(role, 'Auto role on join').catch(err => console.error('auto role failed', err.message));
}
