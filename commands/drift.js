const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');

const imageDir = './driftImages/';
let imageCount = 0;

module.exports = {
    name: 'drift',
    description: 'Shows a random image from the server',
    async execute(interaction)
    {
        if (imageCount === 0)
        {
            await interaction.reply('I am sorry, I don\'t have any images...');
        }
        else
        {
            const imageToShow = Math.floor(Math.random() * imageCount) + 1;
            interaction.reply({ embeds: [new MessageEmbed().setAuthor('Here is a random image from our server')], files: [`${imageDir}/${imageToShow}.png`] });
        }
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

fs.readdir(imageDir, (err, files) =>
{
    if(err)
    {
        console.log(`Couldn't retrieve drift images: ${err}`);
    }

    const pngfiles = files.filter(f => f.split('.').pop() === 'png');
    if(pngfiles.length <= 0)
    {
        return console.log('Couldn\'t find images.');
    }
    imageCount = pngfiles.length;
});