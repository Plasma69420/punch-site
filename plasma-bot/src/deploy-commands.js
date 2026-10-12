import { REST, Routes } from 'discord.js';
import { env } from './config.js';
import { commands } from './commands.js';

const rest = new REST().setToken(env.DISCORD_TOKEN);
await rest.put(Routes.applicationGuildCommands(env.CLIENT_ID, env.GUILD_ID), { body: commands });
console.log(`Registered ${commands.length} slash commands.`);
