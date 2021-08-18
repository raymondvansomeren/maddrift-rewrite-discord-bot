const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    name: 'server',
    description: 'Replies with server info',
    async execute(interaction)
    {
        const embed = new MessageEmbed()
            .setAuthor(`SERVER: ${interaction.guild.name}`, interaction.guild.iconURL())
            .addField('Members', `${interaction.guild.memberCount}`, true)
            .addField('Date of creation', `${new Date(interaction.guild.createdTimestamp).toDateString()}`, true)
            .setColor('#5E202E')
            .setFooter(`ID: ${interaction.guild.id}`);

        await interaction.reply({ embeds: [embed], ephemeral: false });
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