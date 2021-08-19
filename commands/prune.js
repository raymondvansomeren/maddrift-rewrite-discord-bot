const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    name: 'prune',
    description: 'Delete a specified amount of messages',
    async execute(interaction)
    {
        if (!interaction.member.permissions.has('MANAGE_MESSAGES'))
        {
            return interaction.reply({ embeds: [new MessageEmbed().setAuthor('You don\'t have the permissions to delete messages').setColor(interaction.client.embedColor)], ephemeral: true });
        }
        else if (!interaction.guild.me.permissions.has('MANAGE_MESSAGES'))
        {
            return interaction.reply({ embeds: [new MessageEmbed().setAuthor('I don\'t have the permissions to delete messages').setColor(interaction.client.embedColor)], ephemeral: true });
        }

        let amount = interaction.options.get('amount').value;

        if (amount <= 0)
        {
            return interaction.reply({ embeds: [new MessageEmbed().setAuthor('I can\'t delete 0 or less messages').setColor(interaction.client.embedColor)], ephemeral: true });
        }
        else if (amount > 100)
        {
            amount = 100;
        }

        interaction.channel.bulkDelete(amount, true)
            .then((messages) =>
            {
                const embed = new MessageEmbed()
                    .setAuthor(`Deleted ${messages.size} messages`)
                    .setColor(interaction.client.embedColor);

                return interaction.reply({ embeds: [embed], ephemeral: true });
            });
    },
    async create(client)
    {
        const data = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addIntegerOption(option =>
                option.setName('amount')
                    .setDescription('The amount of messages to be deleted (no more than 100)')
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