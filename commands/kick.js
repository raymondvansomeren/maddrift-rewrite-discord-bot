const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    name: 'kick',
    description: 'To kick users',
    async execute(interaction)
    {
        if (!interaction.member?.permissions.has('KICK_MEMBERS'))
        {
            return interaction.reply({ embeds: [new MessageEmbed().setAuthor('You don\'t have the permissions to kick users').setColor(interaction.client.embedColor)], ephemeral: true });
        }
        else if (!interaction.guild.me.permissions.has('KICK_MEMBERS'))
        {
            return interaction.reply({ embeds: [new MessageEmbed().setAuthor('I don\'t have the permissions to kick users').setColor(interaction.client.embedColor)], ephemeral: true });
        }

        if (interaction.options.get('user').member)
        {
            interaction.guild.members.kick(interaction.options.get('user').user.id, interaction.options.get('reason')?.value)
                .then(() =>
                {
                    const embed = new MessageEmbed()
                        .setAuthor(`${interaction.options.get('user').user.username}`, interaction.options.get('user').user.displayAvatarURL())
                        .addField('Reason', `${interaction.options.get('reason')?.value}`, true)
                        .setColor(interaction.client.embedColor)
                        .setFooter(`Kicked by ${interaction.member.user.username}`, interaction.member.user.displayAvatarURL());

                    interaction.reply({ embeds: [embed], ephemeral: false });
                })
                .catch(() =>
                {
                    interaction.reply({ embeds: [new MessageEmbed().setAuthor('Couldn\'t kick/find that user').setColor(interaction.client.embedColor)], ephemeral: true });
                });
        }
        else
        {
            return interaction.reply({ embeds: [new MessageEmbed().setAuthor('That user isn\'t a part of the server').setColor(interaction.client.embedColor)], ephemeral: true });
        }
    },
    async create(client)
    {
        const data = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addMentionableOption(option =>
                option.setName('user')
                    .setDescription('The user to be kicked')
                    .setRequired(true))
            .addStringOption(option =>
                option.setName('reason')
                    .setDescription('The reason why the user is being kicked')
                    .setRequired(false));
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