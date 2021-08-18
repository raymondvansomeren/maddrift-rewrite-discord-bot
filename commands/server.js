const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    name: 'server',
    description: 'Replies with server info',
    async execute(interaction)
    {
        const embed = new MessageEmbed()
            .setTitle('Server info')
            .addField('Name', `${interaction.guild.name}`)
            .addField('Members', `${interaction.guild.memberCount}`)
            .addField('Date of creation', `${interaction.guild.createdAt}`)
            .setColor('#5E202E')
            .setFooter(`${interaction.client.user.username}`, interaction.client.user.defaultAvatarURL);

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