const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

const logger = require('../modules/logger.js');

module.exports = {
    name: 'kicknewaccounts',
    description: 'This will kick all new accounts that joined in the last 6 hours',
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

        let new_map;
        interaction.guild.members.fetch()
            .then((members) =>
            {
                new_map = members.filter((member) =>
                {
                    const memberJoined = new Date(member.joinedTimestamp).getTime();
                    const joinedAfter = new Date(Date.now() - 21600000).getTime(); // 21600000 is 6 hours
                    const memberAccountAge = new Date(member.user.createdTimestamp).getTime();
                    const createdAfter = new Date(Date.now() - 259200000).getTime(); // 259200000 is 72 hours
                    // logger.error();
                    // logger.log(memberJoined);
                    // logger.log(joinedAfter);
                    if (memberJoined > joinedAfter
                        && memberAccountAge > createdAfter)
                    {
                        return true;
                    }
                    return false;
                })
            })
            .then(() =>
            {
                // console.log(new_map.size);
                const embed = new MessageEmbed()
                    .setAuthor(`${new_map.size} users are being kicked right now`)
                    .setColor(interaction.client.embedColor)
                    .setFooter(`kicked by ${interaction.member.user.username}`, interaction.member.user.displayAvatarURL());
                interaction.reply({ embeds: [embed] });

                new_map.forEach((member) =>
                {
                    member.kick(`Raid kicked by ${interaction.member.user.username}#${interaction.member.user.discriminator} (${interaction.member.user.id})`);
                })
            });
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
