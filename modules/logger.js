const { logChannelID } = require('../config.json');

module.exports = {
    name: 'logger',
    async execute(client, data)
    {
        client.channels.cache.find(channel => channel.id === logChannelID)?.send(data);
    },
};