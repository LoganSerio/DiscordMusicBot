const { Client, GatewayIntentBits, Events } = require('discord.js');
const ytdl = require('ytdl-core');
const config = require('./config.json');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessages],
});

const PREFIX = "!"; // Your command prefix

client.once(Events.ClientReady, () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on(Events.MessageCreate, async (message) => {
    if (!message.content.startsWith(PREFIX) || message.author.bot) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'play') {
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            return message.reply("You need to be in a voice channel to play music!");
        }

        const url = args[0];
        if (!url) {
            return message.reply("Please provide a YouTube URL!");
        }

        try {
            // Join the voice channel
            const connection = await voiceChannel.join();
            console.log(`Joined voice channel: ${voiceChannel.name}`);

            // Create an audio stream using ytdl-core
            const stream = ytdl(url, { filter: 'audioonly' });

            // Play the audio stream in the voice channel
            const dispatcher = connection.play(stream);

            dispatcher.on('start', () => {
                console.log('Audio is now playing!');
            });

            dispatcher.on('finish', () => {
                console.log('Finished playing!');
                voiceChannel.leave();
            });

            dispatcher.on('error', (error) => {
                console.error('Error playing audio:', error);
                message.reply("There was an error playing the audio.");
            });

            await message.reply(`Now playing: ${url}`);
        } catch (error) {
            console.error('Error connecting to voice channel:', error);
            message.reply("There was an error trying to connect to the voice channel.");
        }
    }
});

// Log in to Discord with your bot token
client.login(config.token);
