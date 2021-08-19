// https://discordjs.guide/creating-your-bot/
// https://discordjs.guide/additional-info/changes-in-v13.html

const fs = require('fs');

const { Client, Collection, Intents, MessageEmbed } = require('discord.js');
const { token, servers } = require('./config.json');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
client.commands = new Collection();
client.inDevelopment = require('./config.json').inDevelopment;
client.developmentServer = require('./config.json').developmentServer;
client.embedColor = require('./config.json').embedColor;

const rp = require('request-promise');
const rpErrors = require('request-promise/errors');
let highest = 0;

const serverStats = {
    guildID: '555749267667550251',
    totalUsersID: '661764105170059285',
    FiveM: '662074411180097560',
};

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles)
{
    const command = require(`./commands/${file}`);
    // set a new item in the Collection
    // with the key as the command name and the value as the exported module
    client.commands.set(command.name, command);
}

client.on('messageCreate', async message =>
{
    if (!message.author.bot)
    {
        stickyStuff(message);
    }

    if (!client.application?.owner) await client.application?.fetch();

    if (message.content.toLowerCase() === '!takedown' && message.author.id === client.application?.owner.id)
    {
        const command = await client.guilds.cache.get(client.developmentServer)?.commands.set([]);
        console.log(command);
    }
    else if (message.content.toLowerCase() === '!fulltakedown' && message.author.id === client.application?.owner.id)
    {
        const command = await client.application?.commands.set([]);
        console.log(command);
    }
});

client.on('interactionCreate', async interaction =>
{
    if (!interaction.isCommand()) return;
    if (!interaction.inGuild())
    {
        return interaction.reply({ embeds: [new MessageEmbed().setAuthor('I don\'t allow commands in my DMs').setColor(interaction.client.embedColor)], ephemeral: true });
    }

    if (!client.commands.has(interaction.commandName)) return;

    try
    {
        await client.commands.get(interaction.commandName).execute(interaction);
    }
    catch (error)
    {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

client.on('guildMemberAdd', member =>
{
    if (member.guild.id !== serverStats.guildID) return;
    setMemberCountVisual();
});
client.on('guildMemberRemove', member =>
{
    if (member.guild.id !== serverStats.guildID) return;
    setMemberCountVisual();
});

client.once('ready', () =>
{
    // Retrieve highest amount of players from file
    highest = allTimeHigh('allTimeHigh.txt');

    setMemberCountVisual();

    setInterval(showFiveMServerInfo, 10000);

    for (const command of client.commands)
    {
        // Create the interaction command (command[1] is the second part of the pair in map)
        command[1].create(client);
    }
    console.log('ready');
});

// Check for sticky and place on bottom again
async function stickyStuff(message)
{
    if (fs.existsSync(`stickies/${message.channel.toString().replace(/[^\w\s]/gi, '')}.txt`))
    {
        fs.readFile(`stickies/${message.channel.toString().replace(/[^\w\s]/gi, '')}.txt`, (err, jsonString) =>
        {
            if (err)
            {
                return console.log(`File read failed: ${err}`);
            }

            if (message.author.bot && message.embeds[0]?.footer === 'Sticky message') return;
            message.channel.messages.fetch({ limit: 20 })
                .then((msgs) =>
                {
                    msgs.forEach((msg) =>
                    {
                        if (msg.embeds[0]?.footer?.text === 'Sticky message' && msg.author.id === message.guild.me.id)
                        {
                            msg.delete();
                        }
                    });
                })
                .catch((e) =>
                {
                    console.log(e);
                });

            message.channel.send({ embeds: [new MessageEmbed().setDescription(`${jsonString.toString()}`).setColor(client.embedColor).setFooter('Sticky message')] });
        });
    }
}

function allTimeHigh(file)
{
    let h = 0;

    if (fs.existsSync(file))
    {
        h = parseInt(fs.readFileSync(file).toString(), 10);
    }

    return h;
}

async function setMemberCountVisual()
{
    const guild = client.guilds.cache.find(g => g.id === serverStats.guildID);
    const memberCount = guild.memberCount;

    (await guild.channels.fetch(serverStats.totalUsersID)).setName(`Member count: ${memberCount}`);

    client.user.setActivity(`over ${memberCount} people`, { type: 'WATCHING' });
}

async function showFiveMServerInfo()
{
    const promises = servers.map(async (server) =>
    {
        return getServerStatus(server.ip, server.title, server.link, server.public).then(async (res) =>
        {
            return res;
        }).catch(async (err) =>
        {
            console.log(`Could not connect to server, IP ${server.ip}`);
            return { 'title': server.title, 'ip': server.ip, 'online': false, 'players': '0', 'link': server.link };
        });
    });

    Promise.all(promises).then((completed) =>
    {
        const embed = new MessageEmbed();
        const channel = client.channels.cache.find(c => c.id === serverStats.FiveM);

        channel.messages.fetch({ limit: 20 }, true).then(messages =>
        {
            const myMessages = Array.from(messages.filter(msg => msg.author.id == client.user.id));
            embed.setTimestamp().setTitle('Mad Drift Status:').setURL('https://stats.uptimerobot.com/xoWkgCJlKo').setColor('#ff0000').setFooter('Mad Drift', 'https://i.imgur.com/LQ43dVJ.png');
            let count = 0;
            for (let i = 0; i < completed.length; i++)
            {
                const server = completed[i];
                embed.addField(`__${server.title}__`, '> Status: ' + (server.online ? '✅' : '❌') + (server.online ? '\n> Players: ' + server.players : '') + (server.public ? `\n> [Connect](https://www.maddrifts.com/${server.link}.php) / \`connect ${server.link}\`` : ''), true);
                count += Number(server.players);
            }
            embed.addField('\u200B\n__Server Restart Times:__\n', '\n>>> __EU:__ \n`12:00 PM` - Australian Eastern Standard Time \n`4:00 AM` - Central European Summer Time \n`10:00 PM` - Eastern Daylight Time\n__US:__ \n`6:30 PM` - Australian Eastern Standard Time\n `10:30 AM` - Central European Summer Time\n `4:30 AM` - Eastern Daylight Time\n__AU:__ \n`2:30 AM` - Australian Eastern Standard Time\n`6:30 PM` - Central European Summer Time\n`12:30 PM` - Eastern Daylight Time');
            const file = 'allTimeHigh.txt';
            if (highest < count)
            {
                highest = count;
                fs.writeFile(file, highest.toString(), function(err)
                {
                    if (err)
                    {
                        console.log(`Failed to write highest member count to file: ${err}`);
                    }
                });
            }

            embed.setDescription('Online players (total): `' + count + '`. Highest at once: `' + highest + '`');
            if (myMessages.length == 0)
            {
                channel.send({ embeds: [embed] });
            }
            else if (myMessages.length == 1)
            {
                const msg = myMessages[0][1];
                msg.edit({ embeds: [embed] });
            }
        });
    });
}

async function getServerStatus(ip, title, link, public)
{
    return rp(`http://${ip}/players.json`).then(function(html)
    {
        const data = JSON.parse(html);
        const players = Object.keys(data).length;

        return { 'title': title, 'ip': ip, 'online': true, 'players': players, 'link': link, 'public': public };
    }).catch(rpErrors.TransformError, function(reason)
    {
        console.log(reason);

        return { 'title': title, 'ip': ip, 'online': false, 'players': '0', 'link': link, 'public': public };
    });
}

client.login(token);