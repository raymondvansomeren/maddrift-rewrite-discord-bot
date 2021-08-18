const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    name: 'userinfo',
    description: 'Replies info about you',
    async execute(interaction)
    {
        let member = undefined;
        // console.log(interaction.options.data);
        if (interaction.options.data !== undefined && interaction.options.data.length > 0)
        {
            member = interaction.options.data[0].member;
        }
        else
        {
            member = interaction.member;
        }

        // console.log(member);
        const joinDate = new Date(member.joinedTimestamp);
        const createDate = new Date(member.user.createdTimestamp);

        const embed = new MessageEmbed()
            .setAuthor(`USER: ${member.user.username}#${member.user.discriminator}`, member.user.displayAvatarURL(), member.user.displayAvatarURL())
            .addField('Created at', `${createDate.toDateString()}`, true)
            .addField('Joined at', `${joinDate.toDateString()}`, true)
            .setColor('#5E202E')
            .setFooter(`ID: ${member.user.id}`);

        if (member._roles.length > 0)
        {
            let roles = '';
            for (const role of member._roles)
            {
                roles += `<@&${role}> `;
            }
            embed.addField('Roles', roles, true);
        }

        await interaction.reply({ embeds: [embed], ephemeral: false });
    },
    async create(client)
    {
        const data = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addUserOption(option =>
                option.setName('user')
                    .setDescription('The user to get the info from')
                    .setRequired(false));
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