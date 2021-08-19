const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    name: 'ban',
    description: 'To ban users',
    async execute(interaction)
    {
        if (!interaction.member?.permissions.has('BAN_MEMBERS'))
        {
            return interaction.reply({ embeds: [new MessageEmbed().setAuthor('You don\'t have the permissions to ban users').setColor(interaction.client.embedColor)], ephemeral: true });
        }
        else if (!interaction.guild.me.permissions.has('BAN_MEMBERS'))
        {
            return interaction.reply({ embeds: [new MessageEmbed().setAuthor('I don\'t have the permissions to ban users').setColor(interaction.client.embedColor)], ephemeral: true });
        }

        interaction.guild.bans.fetch({ user: interaction.options.get('user').user, force: true })
            .then(() =>
            {
                interaction.reply({ embeds: [new MessageEmbed().setAuthor('That user is already banned').setColor(interaction.client.embedColor)], ephemeral: true });
            })
            .catch(() =>
            {
                interaction.guild.members.ban(interaction.options.get('user').user.id, { days: 1, reason: interaction.options.get('reason')?.value })
                    .then(() =>
                    {
                        const embed = new MessageEmbed()
                            .setAuthor(`${interaction.options.get('user').user.username}`, interaction.options.get('user').user.displayAvatarURL())
                            .setColor(interaction.client.embedColor)
                            .setFooter(`Banned by ${interaction.member.user.username}`, interaction.member.user.displayAvatarURL());

                        if (interaction.options.get('reason'))
                        {
                            embed.addField('Reason', `${interaction.options.get('reason')?.value}`, true);
                        }

                        interaction.reply({ embeds: [embed], ephemeral: false });
                    })
                    .catch(() =>
                    {
                        interaction.reply({ embeds: [new MessageEmbed().setAuthor('Couldn\'t ban/find that user').setColor(interaction.client.embedColor)], ephemeral: true });
                    });
            });
    },
    async create(client)
    {
        const data = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addMentionableOption(option =>
                option.setName('user')
                    .setDescription('The user to be banned')
                    .setRequired(true))
            .addStringOption(option =>
                option.setName('reason')
                    .setDescription('The reason why the user is being banned')
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