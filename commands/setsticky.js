const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');

module.exports = {
    name: 'setsticky',
    description: 'Set a sticky in a specific channel',
    async execute(interaction)
    {
        if (!interaction.member?.permissions.has('ADMINISTRATOR'))
        {
            return interaction.reply({ embeds: [new MessageEmbed().setAuthor('You don\'t have the permissions to set sticky messages').setColor(interaction.client.embedColor)], ephemeral: true });
        }

        const channel = interaction.options.get('channel').channel;
        const message = interaction.options.get('message')?.value;

        // if (fs.existsSync(`stickies/${channel.toString().replace(/[^\w\s]/gi, '')}.txt`))
        // {
        //     fs.readFile(`stickies/${channel.toString().replace(/[^\w\s]/gi, '')}.txt`, (err, jsonString) =>
        //     {
        //         if (err)
        //         {
        //             return console.log(`File read failed: ${err}`);
        //         }

        //         channel.messages.fetch({ limit: 20 })
        //             .then((msgs) =>
        //             {
        //                 msgs.forEach((msg) =>
        //                 {
        //                     if (msg.embeds[0]?.footer?.text === 'Sticky message' && msg.author.id === interaction.guild.me.id)
        //                     {
        //                         msg.delete();
        //                     }
        //                 });
        //             })
        //             .catch((e) =>
        //             {
        //                 console.log(e);
        //             });
        //     });
        // }

        const embed = new MessageEmbed()
            .setAuthor('Sticky', interaction.client.user.displayAvatarURL())
            .addField('Channel', `<#${channel.id}>`)
            .setColor(interaction.client.embedColor)
            .setFooter('Sticky removed')
            .setTimestamp();

        // Set the sticky
        if (message)
        {
            embed.addField('Message', `${message}`)
                .setFooter('Sticky set');

            if (fs.existsSync(`stickies/${channel.toString().replace(/[^\w\s]/gi, '')}.txt`))
            {
                channel.messages.fetch({ limit: 20 })
                    .then((msgs) =>
                    {
                        msgs.forEach((msg) =>
                        {
                            if (msg.embeds[0]?.footer?.text === 'Sticky message' && msg.author.id === interaction.guild.me.id)
                            {
                                msg.delete();
                            }
                        });
                    })
                    .catch((e) =>
                    {
                        console.log(e);
                    });
            }

            fs.writeFile(`stickies/${channel.toString().replace(/[^\w\s]/gi, '')}.txt`, message, (e) =>
            {
                if (e)
                {
                    console.log(`Failed to write file: ${e}`);
                    return interaction.reply({ embeds: [new MessageEmbed().setAuthor('Failed to set a sticky. Couldn\'t save the contents of the sticky message').setColor(interaction.client.embedColor)], ephemeral: true });
                }
            });
            channel.send({ embeds: [new MessageEmbed().setAuthor(`${message}`).setColor(interaction.client.embedColor).setFooter('Sticky message')], ephemeral: true });
        }
        else if (!message)
        {
            if (fs.existsSync(`stickies/${channel.toString().replace(/[^\w\s]/gi, '')}.txt`))
            {
                fs.readFile(`stickies/${channel.toString().replace(/[^\w\s]/gi, '')}.txt`, (err, jsonString) =>
                {
                    if (err)
                    {
                        return console.log(`File read failed: ${err}`);
                    }

                    channel.messages.fetch({ limit: 20 })
                        .then((msgs) =>
                        {
                            msgs.forEach((msg) =>
                            {
                                if (msg.embeds[0]?.footer?.text === 'Sticky message' && msg.author.id === interaction.guild.me.id)
                                {
                                    msg.delete();
                                }
                            });
                        })
                        .catch((e) =>
                        {
                            console.log(e);
                        });

                    fs.unlinkSync(`stickies/${channel.toString().replace(/[^\w\s]/gi, '')}.txt`, (e) =>
                    {
                        if (e)
                        {
                            console.log(`Failed to delete file: ${e}`);
                        }
                    });
                });
            }
            else
            {
                return interaction.reply({ embeds: [new MessageEmbed().setAuthor(`There is no sticky in ${channel.name} (channel id: ${channel.id})`).setColor(interaction.client.embedColor)], ephemeral: true });
            }
        }
        await interaction.reply({ embeds: [embed], ephemeral: true });
    },
    async create(client)
    {
        const data = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addChannelOption(option =>
                option.setName('channel')
                    .setDescription('The channel to set a sticky in')
                    .setRequired(true))
            .addStringOption(option =>
                option.setName('message')
                    .setDescription('The message to show')
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