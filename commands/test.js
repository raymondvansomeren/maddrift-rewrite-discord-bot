// const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    name: 'test',
    description: 'Test command',
    async execute(interaction)
    {
        await interaction.reply('This is a test!');
    },
    async create(client)
    {
        const data = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description);
        if (client.inDevelopment)
        {
            await client.guilds.cache.get('785880982837526578')?.commands.create(data);
        }
        else
        {
            await client.application?.commands.create(data);
        }
    },
};