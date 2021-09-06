const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    name: 'paypal',
    description: 'Shows our paypal link',
    async execute(interaction)
    {
        const embed = new MessageEmbed()
            .setDescription('Here\'s our PayPal link: https://www.paypal.me/maddriftsfivem')
            .setColor(interaction.client.embedColor)
            .setFooter('https://www.paypal.me/maddriftsfivem', interaction.client.user.displayAvatarURL());

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