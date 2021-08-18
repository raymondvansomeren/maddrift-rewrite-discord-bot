// https://discordjs.guide/creating-your-bot/
// https://discordjs.guide/additional-info/changes-in-v13.html

const fs = require('fs');

const { Client, Collection, Intents } = require('discord.js');
const { token } = require('./config.json');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
client.commands = new Collection();
client.inDevelopment = require('./config.json').inDevelopment;

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
    if (!client.application?.owner) await client.application?.fetch();

    if (message.content.toLowerCase() === '!takedown' && message.author.id === client.application?.owner.id)
    {
        const command = await client.guilds.cache.get('785880982837526578')?.commands.set([]);
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

client.once('ready', () =>
{
    for (const command of client.commands)
    {
        // Create the interaction command (command[1] is the second part of the pair in map)
        command[1].create(client);
    }
    console.log('ready');
});

client.login(token);