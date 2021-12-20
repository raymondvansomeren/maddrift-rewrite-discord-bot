const { logChannelID } = require('../config.json');

module.exports = {
    name: 'logger',
    async execute(client, data)
    {
        client.channels.cache.find(channel => channel.id === logChannelID)?.send(data);
    },
    async log()
    {
        now = new Date();
        if (arguments.length > 0)
        {
            return console.log('[INFO] |', now.toUTCString(), '|', [...arguments].join(' '));
        }
        return console.log('[INFO] |', now.toUTCString());
    },
    async error()
    {
        now = new Date();
        if (arguments.length > 0)
        {
            return console.error('[ERROR] |', now.toUTCString(), '|', [...arguments].join(' '));
        }
        return console.error('[ERROR] |', now.toUTCString());
    },
};