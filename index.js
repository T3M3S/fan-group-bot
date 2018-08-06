//=============================================================================================================================================================================================
// Start of the bot requirements etc.

const botconfig = require("./botconfig.json");
const Discord = require("discord.js");
const fs = require("fs");
const bot = new Discord.Client({disableEveryone: true});
bot.commands = new Discord.Collection();
let cooldown = new Set();
let cdseconds = 2;
bot.login(process.env.BOT_TOKEN);

// End of the Bot Requirements etc.
//=============================================================================================================================================================================================
// Start Of the bot.on Messages.

bot.on("ready", async () => {
    const newserverHook = new Discord.WebhookClient(`${process.env.WEBHOOKID}`, `${process.env.WEBHOOKTOKEN}`);
    const embed = new Discord.RichEmbed()
        .setColor(`#FF000`)
        .setAuthor(bot.user.username, bot.user.avatarURL)
        .setTimestamp()
        .setDescription(`${bot.user.username} Just Started/Restarted!`)
        .setThumbnail(bot.user.avatarURL)
        .setFooter(`Bot Started At: `)
    newserverHook.send(embed)
    console.log(`${bot.user.username} is online on ${bot.guilds.size} servers!`);
    bot.user.setPresence({
        game: {
            name: `${bot.user.username} Serving: ${bot.guilds.size} Servers, ${bot.users.size} Users`,
            type: "STREAMING",
            url: "https://www.twitch.tv/elarabots_discord"
        }
    })
});

bot.on(`disconnect`, () => {
console.log(`${bot.user.username} Has Been Disconnected. At: ${new Date()}`);
});

bot.on('reconnecting', () => {
console.log(`${bot.user.username} Is Trying To Reconnect! At: ${new Date()}`);
});

bot.on('guildCreate', async guild => {
    let modlogs = await guild.channels.find('name', "modlogs");
    if (!modlogs) return guild.createChannel('modlogs', 'text');
    let botembed = new Discord.RichEmbed()
        .setColor("#000FF")
        .setDescription("Hello :wave:")
        .setAuthor(bot.user.username, bot.user.avatarURL)
        .setThumbnail(bot.user.avatarURL)
        .setTitle(`You have added ${bot.user.username} to ${guild.name}`)
        .setTimestamp()
        .addField("My Bot Support Server", "[Click Here](https://discord.gg/hgsM86w)", true)
        .addField("Prefix", `S!`, true)
        .addField("Commands", `do S!help`, true)
        .addField("My Bot Creator", `SUPERCHIEFYT#0001`, true)
    console.log(`I was added to (${guild.name}) Discord!, ServerID: ${guild.id}, Server Owner: ${guild.owner}, Server OwnerID: ${guild.ownerID}, MemberCount: ${guild.memberCount}, Server Region: ${guild.region}`);
       await modlogs.send(botembed);
});

bot.on("guildDelete", async guild => {
    console.log(`I was removed from! (${guild.name}) Discord!, ServerID: ${guild.id}, Server Owner: ${guild.owner}, Server OwnerID: ${guild.ownerID}, MemberCount: ${guild.memberCount}, Server Region: ${guild.region}`);
});

bot.on("message", async message => {
    if (message.channel.id === '455184204615909377') {
        message.react('👍')
        message.react('👎')
    }
    if (message.channel.id === "473574603374067732") {
        message.member.addRole(`474016263883194373`)
        message.delete().catch()
        let riddleanswers = message.guild.channels.find(`name`, `elara-log`)
        let riddleembed = new Discord.RichEmbed()
            .setColor(`RANDOM`)
            .setAuthor(`${message.author.tag}`, message.author.avatarURL)
            .setTimestamp()
            .setFooter(`Riddle submitted at`)
            .setTitle(`Riddle submitted`)
            .setDescription(`${message.content}`)
        riddleanswers.send(riddleembed)
        let dmembed = new Discord.RichEmbed()
            .setColor(`RANDOM`)
            .setDescription(`Your riddle answer has been submitted\nand Have been given the **Riddle Submitted** Role,\nWhich means you can't post another answer until next week\n\n**Your Answer you submitted**\n ${message.content}`)
            .setTimestamp()
            .setFooter(`Answer Submitted At`)
            .setAuthor(message.author.tag, message.author.avatarURL)
        message.author.send(dmembed);
    }
    if (message.author.bot) return;
    if (message.channel.type === "dm") return message.reply("Commands only work in discord channels");
    const prefixes = ['s!', 'e!', 'E!', 'S!'];
    let prefix = false;
    for (const thisPrefix of prefixes) {
        if (message.content.startsWith(thisPrefix)) prefix = thisPrefix;
    }
    if (!prefix) return;
    if (!message.content.startsWith(prefix)) return;
    if (cooldown.has(message.author.id)) {
        message.delete();
        return message.reply("You have to wait 5 seconds between commands.")
    }
    if (!message.member.hasPermission("ADMINISTRATOR")) {
        cooldown.add(message.author.id);
    }
    let messageArray = message.content.split(" ");
    let cmd = messageArray[0];
    let args = messageArray.slice(1);

    let commandfile = bot.commands.get(cmd.slice(prefix.length));
    if (commandfile) commandfile.run(bot, message, args);

    setTimeout(() => {
        cooldown.delete(message.author.id)
    }, cdseconds * 1000)

});
// End of the bot.on Messages.
//==============================================================================================================================================================================================
// Start of Getting and Loading the Commands

fs.readdir("./commands/Fun", (err, files) => {

    if (err) console.log(err);
    let jsfile = files.filter(f => f.split(".").pop() === "js");
    if (jsfile.length <= 0) {
        console.log("Couldn't find Fun commands.");
        return;
    }

    jsfile.forEach((f, i) => {
        let props = require(`./commands/Fun/${f}`);
        console.log(`${f} loaded!`);
        bot.commands.set(props.help.name, props);
    });
});

fs.readdir("./commands/Info/", (err, files) => {

    if (err) console.log(err);
    let jsfile = files.filter(f => f.split(".").pop() === "js");
    if (jsfile.length <= 0) {
        console.log("Couldn't Info find commands.");
        return;
    }

    jsfile.forEach((f, i) => {
        let props = require(`./commands/Info/${f}`);
        console.log(`${f} loaded!`);
        bot.commands.set(props.help.name, props);
    });
});
fs.readdir("./commands/Moderation/", (err, files) => {

    if (err) console.log(err);
    let jsfile = files.filter(f => f.split(".").pop() === "js");
    if (jsfile.length <= 0) {
        console.log("Couldn't find Moderation commands.");
        return;
    }

    jsfile.forEach((f, i) => {
        let props = require(`./commands/Moderation/${f}`);
        console.log(`${f} loaded!`);
        bot.commands.set(props.help.name, props);
    });
});
fs.readdir("./commands/BotOwner", (err, files) => {

    if (err) console.log(err);
    let jsfile = files.filter(f => f.split(".").pop() === "js");
    if (jsfile.length <= 0) {
        console.log("Couldn't find Bot Owner commands.");
        return;
    }

    jsfile.forEach((f, i) => {
        let props = require(`./commands/BotOwner/${f}`);
        console.log(`${f} loaded!`);
        bot.commands.set(props.help.name, props);
    });
});

fs.readdir("./commands/BotOwner/RoleInfo", (err, files) => {

    if (err) console.log(err);
    let jsfile = files.filter(f => f.split(".").pop() === "js");
    if (jsfile.length <= 0) {
        console.log("Couldn't find BotOwner/RoleInfo commands.");
        return;
    }

    jsfile.forEach((f, i) => {
        let props = require(`./commands/BotOwner/RoleInfo/${f}`);
        console.log(`${f} loaded!`);
        bot.commands.set(props.help.name, props);
    });
});
fs.readdir("./commands/BotOwner/Partners", (err, files) => {

    if (err) console.log(err);
    let jsfile = files.filter(f => f.split(".").pop() === "js");
    if (jsfile.length <= 0) {
        console.log("Couldn't find BotOwner/Partners commands.");
        return;
    }

    jsfile.forEach((f, i) => {
        let props = require(`./commands/BotOwner/Partners/${f}`);
        console.log(`${f} loaded!`);
        bot.commands.set(props.help.name, props);
    });
});
fs.readdir("./commands/BotOwner/OwnerCommands", (err, files) => {

    if (err) console.log(err);
    let jsfile = files.filter(f => f.split(".").pop() === "js");
    if (jsfile.length <= 0) {
        console.log("Couldn't find BotOwner/OwnerCommands commands.");
        return;
    }

    jsfile.forEach((f, i) => {
        let props = require(`./commands/BotOwner/OwnerCommands/${f}`);
        console.log(`${f} loaded!`);
        bot.commands.set(props.help.name, props);
    });
});
fs.readdir("./commands/BotOwner/MyServerCrap", (err, files) => {

    if (err) console.log(err);
    let jsfile = files.filter(f => f.split(".").pop() === "js");
    if (jsfile.length <= 0) {
        console.log("Couldn't find BotOwner/MyServerCrap commands.");
        return;
    }

    jsfile.forEach((f, i) => {
        let props = require(`./commands/BotOwner/MyServerCrap/${f}`);
        console.log(`${f} loaded!`);
        bot.commands.set(props.help.name, props);
    });
});
// End of Getting Commands.
//=============================================================================================================================================================================================