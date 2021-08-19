const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    name: 'unban',
    description: 'To unban users',
    async execute(interaction)
    {
        if (!interaction.member?.permissions.has('BAN_MEMBERS'))
        {
            return interaction.reply({ embeds: [new MessageEmbed().setAuthor('You don\'t have the permissions to unban users').setColor(interaction.client.embedColor)], ephemeral: true });
        }
        else if (!interaction.guild.me.permissions.has('BAN_MEMBERS'))
        {
            return interaction.reply({ embeds: [new MessageEmbed().setAuthor('I don\'t have the permissions to unban users').setColor(interaction.client.embedColor)], ephemeral: true });
        }

        // interaction.guild.bans.fetch({ user: interaction.options.get('user').user, force: true })
        interaction.guild.bans.fetch({ user: interaction.options.get('user').user, force: true })
            .then(() =>
            {
                interaction.guild.members.unban(interaction.options.get('user').user, interaction.options.get('reason')?.value)
                    .then(() =>
                    {
                        const embed = new MessageEmbed()
                            .setAuthor(`${interaction.options.get('user').user.username}`, interaction.options.get('user').user.displayAvatarURL())
                            .addField('Reason', `${interaction.options.get('reason')?.value}`, true)
                            .setColor(interaction.client.embedColor)
                            .setFooter(`Unbanned by ${interaction.member.user.username}`, interaction.member.user.displayAvatarURL());

                        interaction.reply({ embeds: [embed], ephemeral: false });
                    })
                    .catch(() =>
                    {
                        interaction.reply({ embeds: [new MessageEmbed().setAuthor('Couldn\'t unban that user').setColor(interaction.client.embedColor)], ephemeral: true });
                    });
            })
            .catch(() =>
            {
                interaction.reply({ embeds: [new MessageEmbed().setAuthor('Couldn\'t unban/find that user. Is this user already unbanned?').setColor(interaction.client.embedColor)], ephemeral: true });
            });
    },
    async create(client)
    {
        const data = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addMentionableOption(option =>
                option.setName('user')
                    .setDescription('The user to be unbanned')
                    .setRequired(true))
            .addStringOption(option =>
                option.setName('reason')
                    .setDescription('The reason why the user is being unbanned')
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