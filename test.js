const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    name: 'test',
    description: 'Test command',
    async execute(interaction)
    {
        const embed = new MessageEmbed()
            .addField('Test', 'This is a test', true)
            .setColor(interaction.client.embedColor)
            .setFooter('Testing');

        await interaction.reply({ embeds: [embed], ephemeral: false });
    },
    async create(client)
    {
        const data = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description);
        if (client.inDevelopment)
        {
            await client.guilds.cache.get(client.developmentServer)?.commands.create(data);
        }
        else
        {
            await client.application?.commands.create(data);
        }
    },
};