require("dotenv").config();

const fs = require("fs");
const path = require("path");
const express = require("express");

const {
  Client,
  GatewayIntentBits,
  Events,
  REST,
  Routes,
  SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");

// ------------------------------
// EXPRESS (Render Keep Alive)
// ------------------------------

const app = express();

app.get("/", (req, res) => {
  res.send("Medway's Card Machine V2 is online.");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Web server running on port ${PORT}`);
});

// ------------------------------
// DISCORD CLIENT
// ------------------------------

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// ------------------------------
// DATABASE
// ------------------------------

const dataFolder = path.join(__dirname, "data");

if (!fs.existsSync(dataFolder)) {
  fs.mkdirSync(dataFolder);
}

const usersFile = path.join(dataFolder, "users.json");

if (!fs.existsSync(usersFile)) {
  fs.writeFileSync(usersFile, JSON.stringify({}, null, 2));
}

function loadUsers() {
  return JSON.parse(fs.readFileSync(usersFile, "utf8"));
}

function saveUsers(data) {
  fs.writeFileSync(usersFile, JSON.stringify(data, null, 2));
}

// ------------------------------
// CARD LIST
// ------------------------------

const starterCards = [
  {
    id: "cat",
    name: "Cat",
    rarity: "Common",
    power: 10
  },
  {
    id: "dog",
    name: "Dog",
    rarity: "Common",
    power: 12
  },
  {
    id: "bunny",
    name: "Bunny",
    rarity: "Common",
    power: 11
  },
  {
    id: "fox",
    name: "Fox",
    rarity: "Common",
    power: 13
  },
  {
    id: "bear",
    name: "Bear",
    rarity: "Uncommon",
    power: 18
  },
  {
    id: "wolf",
    name: "Wolf",
    rarity: "Uncommon",
    power: 20
  },
  {
    id: "lion",
    name: "Lion",
    rarity: "Rare",
    power: 30
  },
  {
    id: "dragon",
    name: "Dragon",
    rarity: "Rare",
    power: 35
  }
];

// ------------------------------
// HELPERS
// ------------------------------

function createUser(id, username) {
  return {
    id,
    username,
    level: 1,
    xp: 0,
    gems: 100,
    eggs: {
      starter: 3
    },
    cards: []
  };
}

function getUser(id, username) {
  const users = loadUsers();

  if (!users[id]) {
    return null;
  }

  if (users[id].username !== username) {
    users[id].username = username;
    saveUsers(users);
  }

  return users[id];
}

function randomCard() {
  const roll = Math.random() * 100;

  if (roll <= 60) {
    const commons = starterCards.filter(c => c.rarity === "Common");
    return commons[Math.floor(Math.random() * commons.length)];
  }

  if (roll <= 90) {
    const uncommons = starterCards.filter(c => c.rarity === "Uncommon");
    return uncommons[Math.floor(Math.random() * uncommons.length)];
  }

  const rares = starterCards.filter(c => c.rarity === "Rare");
  return rares[Math.floor(Math.random() * rares.length)];
}

// ------------------------------
// SLASH COMMANDS
// ------------------------------

const commands = [

new SlashCommandBuilder()
.setName("start")
.setDescription("Create your profile"),

new SlashCommandBuilder()
.setName("profile")
.setDescription("View your profile"),

new SlashCommandBuilder()
.setName("open")
.setDescription("Open one Starter Egg"),

new SlashCommandBuilder()
.setName("cards")
.setDescription("View your cards"),

new SlashCommandBuilder()
.setName("eggs")
.setDescription("View your eggs"),

new SlashCommandBuilder()
.setName("help")
.setDescription("Show all commands"),

new SlashCommandBuilder()
.setName("ping")
.setDescription("Bot latency")

].map(c => c.toJSON());

// ------------------------------
// REGISTER COMMANDS
// ------------------------------

client.once(Events.ClientReady, async () => {

  console.log(`${client.user.tag} is online.`);

  try {

    const rest = new REST({
      version: "10"
    }).setToken(process.env.TOKEN);

    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      {
        body: commands
      }
    );

    console.log("Slash commands registered.");

  } catch (err) {
    console.error(err);
  }

});
// ------------------------------
// INTERACTION HANDLER
// ------------------------------

client.on(Events.InteractionCreate, async (interaction) => {

  if (!interaction.isChatInputCommand()) return;

  const users = loadUsers();
  const id = interaction.user.id;
  const username = interaction.user.username;

  // --------------------------
  // /PING
  // --------------------------

  if (interaction.commandName === "ping") {

    return interaction.reply({
      content: `Pong! ${client.ws.ping}ms`,
      ephemeral: true
    });

  }

  // --------------------------
  // /HELP
  // --------------------------

  if (interaction.commandName === "help") {

    const embed = new EmbedBuilder()
      .setTitle("Medway's Card Machine")
      .setDescription(
`**Available Commands**

/start - Create your profile
/profile - View your profile
/open - Open a Starter Egg
/cards - View your cards
/eggs - View your eggs
/help - Show this menu
/ping - Check bot latency`
      );

    return interaction.reply({
      embeds: [embed],
      ephemeral: true
    });

  }

  // --------------------------
  // /START
  // --------------------------

  if (interaction.commandName === "start") {

    if (users[id]) {

      return interaction.reply({
        content: "You have already started your adventure.",
        ephemeral: true
      });

    }

    users[id] = createUser(id, username);

    saveUsers(users);

    const embed = new EmbedBuilder()
      .setTitle("Welcome!")
      .setDescription(
`Your account has been created.

Starting Rewards:
• 100 Gems
• 3 Starter Eggs

Use **/open** to hatch your first card!`
      );

    return interaction.reply({
      embeds: [embed],
      ephemeral: true
    });

  }

  // --------------------------
  // Remaining commands require
  // an account
  // --------------------------

  if (!users[id]) {

    return interaction.reply({
      content: "You haven't started yet. Use **/start** first.",
      ephemeral: true
    });

  }

  // Keep username updated
  users[id].username = username;

  // --------------------------
  // /PROFILE
  // --------------------------

  if (interaction.commandName === "profile") {

    const user = users[id];

    const embed = new EmbedBuilder()
      .setTitle(`${username}'s Profile`)
      .addFields(
        {
          name: "Level",
          value: `${user.level}`,
          inline: true
        },
        {
          name: "Gems",
          value: `${user.gems}`,
          inline: true
        },
        {
          name: "Starter Eggs",
          value: `${user.eggs.starter}`,
          inline: true
        },
        {
          name: "Cards",
          value: `${user.cards.length}`,
          inline: true
        }
      );

    return interaction.reply({
      embeds: [embed],
      ephemeral: true
    });

  }

  // --------------------------
  // /EGGS
  // --------------------------

  if (interaction.commandName === "eggs") {

    const user = users[id];

    const embed = new EmbedBuilder()
      .setTitle("Your Eggs")
      .setDescription(
`Starter Eggs: **${user.eggs.starter}**`
      );

    return interaction.reply({
      embeds: [embed],
      ephemeral: true
    });

  }
    // --------------------------
  // /CARDS
  // --------------------------

  if (interaction.commandName === "cards") {

    const user = users[id];

    if (user.cards.length === 0) {
      return interaction.reply({
        content: "You don't have any cards yet. Open a Starter Egg with **/open**!",
        ephemeral: true
      });
    }

    const list = user.cards
      .map((card, index) =>
        `${index + 1}. ${card.name} • ${card.rarity} • ${card.power} Power`
      )
      .join("\n");

    const embed = new EmbedBuilder()
      .setTitle(`${username}'s Cards`)
      .setDescription(list);

    return interaction.reply({
      embeds: [embed],
      ephemeral: true
    });

  }

  // --------------------------
  // /OPEN
  // --------------------------

  if (interaction.commandName === "open") {

    const user = users[id];

    if (user.eggs.starter <= 0) {
      return interaction.reply({
        content: "You don't have any Starter Eggs left.",
        ephemeral: true
      });
    }

    user.eggs.starter--;

    const card = randomCard();

    user.cards.push({
      id: card.id,
      name: card.name,
      rarity: card.rarity,
      power: card.power
    });

    // Hidden XP
    user.xp += 10;

    while (user.xp >= user.level * 100) {
      user.xp -= user.level * 100;
      user.level++;
    }

    saveUsers(users);

    const embed = new EmbedBuilder()
      .setTitle("Egg Opened!")
      .setDescription(
`You received:

**${card.name}**
Rarity: **${card.rarity}**
Power: **${card.power}**

Starter Eggs Left: **${user.eggs.starter}**`
      );

    return interaction.reply({
      embeds: [embed],
      ephemeral: true
    });

  }

});

// ------------------------------
// LOGIN
// ------------------------------

client.login(process.env.TOKEN);
