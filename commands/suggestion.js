const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    name: 'suggestion',
    description: 'Suggestion command',
    async execute(interaction)
    {
        const embed = new MessageEmbed()
            .setAuthor(`${interaction.user.username}`, interaction.user.displayAvatarURL())
            .setTitle(interaction.options.get('suggestion').value)
            .setDescription('React with ✅ if you agree or with ❌ if you disagree')
            .addField('Suggested by', `<@${interaction.user.id}>`, true)
            .setColor(interaction.client.embedColor)
            .setTimestamp();

        const channel = interaction.guild.channels.cache.find(c => c.name === 'suggestions');
        if (!channel)
        {
            return interaction.reply({ embeds: [new MessageEmbed().setAuthor('Couldn\'t find a suggestions channel').setColor(interaction.client.embedColor)], ephemeral: true });
        }

        await channel.send({ embeds: [embed] })
            .then(message =>
            {
                message.react('✅');
                message.react('❌');
            });

        await interaction.reply({ embeds: [new MessageEmbed().setAuthor('Thank you for the suggestion').setColor(interaction.client.embedColor)], ephemeral: true });
    },
    async create(client)
    {
        const data = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption(option =>
                option.setName('suggestion')
                    .setDescription('Fill in your suggestion')
                    .setRequired(true));
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