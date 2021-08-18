const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    name: 'botinfo',
    description: 'Shows info about the bot',
    async execute(interaction)
    {
        const embed = new MessageEmbed()
            .setAuthor(interaction.client.user.username, interaction.client.user.displayAvatarURL())
            .addField('Created on', `${new Date(interaction.client.user.createdTimestamp).toDateString()}`, true)
            .addField('Created by', 'raymon570#2966 (<@270871921137025024>)')
            .setColor(interaction.client.embedColor);

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