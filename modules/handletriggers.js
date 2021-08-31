const { MessageEmbed } = require('discord.js');
const fs = require('fs').promises;

const log = require('../modules/logger.js').execute;

module.exports = {
    name: 'handletriggers',
    async execute(client, message)
    {
        if (message?.author.bot || message?.channel.type === 'dm') return;

        // Convert to lowercase and filter any non letter and non spaces out
        const msg = message?.content.replace(/[^a-z0-9\s]/gi, '').replace(/\s+/gi, ' ').toLowerCase();
        const msgArray = msg.split(' ');

        // Read all triggers
        if (client.triggersChanged || !client.triggers)
        {
            const data = await fs.readFile('./triggers/triggers.json', 'utf-8');
            client.triggers = JSON.parse(data);
            client.triggersChanged = false;
        }

        let found = false;
        for (const trigger of client.triggers?.triggers)
        {
            for (const key of trigger.key)
            {
                // MODE:
                // constains: Anywhere in the message
                // exact: The exact message
                // word: Matches single words (exact) in message
                if ((trigger.mode === 'contains' && msg.includes(key.x))
                    || (trigger.mode === 'exact' && msg === key.x)
                    || (trigger.mode === 'word' && msgArray.includes(key.x)))
                {
                    found = true;
                }

                if (found)
                {
                    // ACTION
                    // reply: Replies with value
                    // delete: Deletes the message
                    // mute: Mutes author
                    // kick: Kicks author
                    // ban: bans author
                    for (const exemptRole of client.triggers?.exemptRoles)
                    {
                        if (trigger.action === 'reply' && (message?.member.roles.cache.has(exemptRole.id) && exemptRole.from.find(element => element.action === 'reply'))
                            || trigger.action === 'delete' && (message?.member.roles.cache.has(exemptRole.id) && exemptRole.from.find(element => element.action === 'delete'))
                            || trigger.action === 'mute' && (message?.member.roles.cache.has(exemptRole.id) && exemptRole.from.find(element => element.action === 'mute'))
                            || trigger.action === 'kick' && (message?.member.roles.cache.has(exemptRole.id) && exemptRole.from.find(element => element.action === 'kick'))
                            || trigger.action === 'ban' && (message?.member.roles.cache.has(exemptRole.id) && exemptRole.from.find(element => element.action === 'ban')))
                        {
                            return console.log(`Aight, user (${message?.author.username}#${message?.author.discriminator}) exempt from trigger: "${key.x}" with action: "${trigger.action}"`);
                        }
                    }

                    if (trigger.action === 'reply')
                    {
                        return message?.reply({ embeds: [new MessageEmbed().setDescription(trigger.value).setFooter('Automated reply').setColor(client.embedColor)] });
                    }
                    else if (trigger.action === 'delete')
                    {
                        await log(client, { embeds: [new MessageEmbed().setTitle(`Message deleted by trigger: "${key.x}"`).setAuthor(`${message?.author.username}#${message?.author.discriminator}`, `${message?.author.displayAvatarURL()}`).setDescription(`Message deleted: \`${message?.content}\` from: <#${message?.channel.id}>`).setFooter(`ID: ${message?.author.id}`).setTimestamp().setColor(client.embedColor)] });
                        if (trigger.value !== '')
                        {
                            message?.reply({ embeds: [new MessageEmbed().setDescription(trigger.value).setFooter('Automated reply').setColor(client.embedColor)] })
                                .then(() =>
                                {
                                    message?.delete();
                                });
                        }
                        else
                        {
                            message?.delete();
                        }
                        return;
                    }
                    else if (trigger.action === 'mute')
                    {
                        await log(client, { embeds: [new MessageEmbed().setTitle(`Member muted by trigger: "${key.x}"`).setAuthor(`${message?.author.username}#${message?.author.discriminator}`, `${message?.author.displayAvatarURL()}`).setDescription(`Message deleted: \`${message?.content}\` from: <#${message?.channel.id}>`).setFooter(`ID: ${message?.author.id}`).setTimestamp().setColor(client.embedColor)] });
                        message?.member.roles.add(message?.guild.roles.cache.find((role => role.name.toLowerCase() === 'muted')));
                        if (trigger.value !== '')
                        {
                            message?.reply({ embeds: [new MessageEmbed().setDescription(trigger.value).setFooter('Automated reply').setColor(client.embedColor)] })
                                .then(() =>
                                {
                                    message?.delete();
                                });
                        }
                        else
                        {
                            message?.delete();
                        }
                        return;
                    }
                    else if (trigger.action === 'kick')
                    {
                        if (message.member.kickable)
                        {
                            await log(client, { embeds: [new MessageEmbed().setTitle(`Member kicked by trigger: "${key.x}"`).setAuthor(`${message?.author.username}#${message?.author.discriminator}`, `${message?.author.displayAvatarURL()}`).setDescription(`Message deleted: \`${message?.content}\` from: <#${message?.channel.id}>`).setFooter(`ID: ${message?.author.id}`).setTimestamp().setColor(client.embedColor)] });
                            message?.delete();
                            return message?.member?.kick(`Autokicked by trigger: "${key.x}"`);
                        }
                        else
                        {
                            await log(client, { embeds: [new MessageEmbed().setTitle(`Could NOT kick member by trigger: "${key.x}"`).setAuthor(`${message?.author.username}#${message?.author.discriminator}`, `${message?.author.displayAvatarURL()}`).setDescription(`Message deleted: \`${message?.content}\` from: <#${message?.channel.id}>`).setFooter(`ID: ${message?.author.id}`).setTimestamp().setColor(client.embedColor)] });
                            return message?.delete();
                        }
                    }
                    else if (trigger.action === 'ban')
                    {
                        if (message.member.banable)
                        {
                            await log(client, { embeds: [new MessageEmbed().setTitle(`Member banned by trigger: "${key.x}"`).setAuthor(`${message?.author.username}#${message?.author.discriminator}`, `${message?.author.displayAvatarURL()}`).setDescription(`Message deleted: \`${message?.content}\` from: <#${message?.channel.id}>`).setFooter(`ID: ${message?.author.id}`).setTimestamp().setColor(client.embedColor)] });
                            return message?.member?.ban({ days: 1, reason: `Autobanned by trigger: "${key.x}"` });
                        }
                        else
                        {
                            await log(client, { embeds: [new MessageEmbed().setTitle(`Could NOT ban member by trigger: "${key.x}"`).setAuthor(`${message?.author.username}#${message?.author.discriminator}`, `${message?.author.displayAvatarURL()}`).setDescription(`Message deleted: \`${message?.content}\` from: <#${message?.channel.id}>`).setFooter(`ID: ${message?.author.id}`).setTimestamp().setColor(client.embedColor)] });
                            return message?.delete();
                        }
                    }

                    return console.log(`Couldn't handle given action: ${trigger.action}`);

                    // return console.log(`Aight, user (${message?.author.username}#${message?.author.discriminator}) exempt from trigger: "${key.x}" with action: "${trigger.action}"`);
                }
            }
        }
    },
};