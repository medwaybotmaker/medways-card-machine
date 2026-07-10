require("dotenv").config();

const express = require("express");
const fs = require("fs");
const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.send("Medway's Card Machine is Online!");
});

app.listen(PORT, () => {
    console.log(`Web server running on port ${PORT}`);
});

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const PREFIX = "!";

// ---------- DATABASE ----------

function loadUsers() {
    try {
        return JSON.parse(fs.readFileSync("./data/users.json"));
    } catch {
        return {};
    }
}

function saveUsers(users) {
    fs.writeFileSync("./data/users.json", JSON.stringify(users, null, 2));
}

// ---------- READY ----------

client.once("ready", () => {
    console.log(`${client.user.tag} is online!`);
});

// ---------- COMMANDS ----------

client.on("messageCreate", async (message) => {

    if (message.author.bot) return;
    if (!message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // PING

    if (command === "ping") {
        return message.reply("🏓 Pong!");
    }

    // START

    if (command === "start") {

        const users = loadUsers();

        if (users[message.author.id]) {
            return message.reply("❌ You have already started! Use **!profile**.");
        }

        users[message.author.id] = {

            username: message.author.username,

            level: 1,
            xp: 0,

            gems: 100,

            eggs: {
                starter: 3
            },

            cards: [],

            wins: 0,
            losses: 0
        };

        saveUsers(users);

        const embed = new EmbedBuilder()
            .setColor("#00d4ff")
            .setTitle("🥚 Welcome to Medway's Card Machine!")
            .setDescription("Your adventure begins now!")
            .addFields(
                {
                    name: "🎁 Rewards",
                    value:
                        "🥚 **Starter Eggs:** 3\n💎 **Gems:** 100"
                },
                {
                    name: "📊 Current Stats",
                    value:
                        "⭐ **Level:** 1\n🃏 **Cards:** 0"
                },
                {
                    name: "▶️ Next Step",
                    value:
                        "Use **!open** to hatch your first egg!"
                }
            )
            .setFooter({
                text: "Good luck collecting every PS99 card!"
            });

        return message.reply({ embeds: [embed] });

    }

});

client.login(process.env.TOKEN);
