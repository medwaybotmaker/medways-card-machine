require("dotenv").config();

const express = require("express");
const fs = require("fs");

const { Client, GatewayIntentBits } = require("discord.js");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.send("Medway's Card Machine is online!");
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

function loadUsers() {
    try {
        const data = fs.readFileSync("./data/users.json");
        return JSON.parse(data);
    } catch {
        return { players: {} };
    }
}

function saveUsers(users) {
    fs.writeFileSync("./data/users.json", JSON.stringify(users, null, 2));
}

client.once("ready", () => {
    console.log(`${client.user.tag} is online!`);
});

client.on("messageCreate", async (message) => {

    if (message.author.bot) return;
    if (!message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // ---------------- PING ----------------

    if (command === "ping") {
        return message.reply("🏓 Pong!");
    }

    // ---------------- START ----------------

    if (command === "start") {

        const users = loadUsers();

        if (!users.players)
            users.players = {};

        if (users.players[message.author.id]) {
            return message.reply(
                "❌ You have already started!\nUse **!profile** to view your profile."
            );
        }

        users.players[message.author.id] = {

            level: 1,
            xp: 0,

            gems: 100,

            starterEggs: 3,

            cards: [],

            wins: 0,
            losses: 0,

            joined: new Date().toISOString()

        };

        saveUsers(users);

        return message.reply(
`# 🎉 Welcome to Medway's Card Machine!

Your profile has been created!

## 🎁 You received

🥚 **3 Starter Eggs**

💎 **100 Gems**

━━━━━━━━━━━━━━━━

### 📊 Current Stats

⭐ Level **1**

🃏 Cards **0**

💎 Gems **100**

🥚 Starter Eggs **3**

━━━━━━━━━━━━━━━━

Type **!open** to hatch your first egg!`
        );
    }

});
client.login(process.env.TOKEN);
