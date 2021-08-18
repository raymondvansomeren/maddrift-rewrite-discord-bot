const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    name: 'ping',
    description: 'Replies with Pong!',
    async execute(interaction)
    {
        const embed = new MessageEmbed()
            .setTitle('Ping')
            .setDescription('---ms')
            .setColor('#5E202E')
            .setFooter(`${interaction.client.user.username}`, interaction.client.user.defaultAvatarURL);

        // Calculates ping between sending a message and editing it, giving a nice round-trip latency.
        const t = new Date();
        interaction.reply({ embeds: [embed], ephemeral: false })
            .then(() =>
            {
                const tt = new Date();
                const ping = tt - t;
                // embed.setFields({ name: 'Ping', value: `${ping}ms` });
                embed.setDescription(`${ping}ms`);
                interaction.editReply({ embeds: [embed], ephemeral: false });
            });
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