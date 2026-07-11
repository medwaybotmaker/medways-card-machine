require("dotenv").config();

const express = require("express");
const fs = require("fs");

const {
  Client,
  GatewayIntentBits,
  Events,
  REST,
  Routes,
  SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");

const app = express();
app.get("/", (req, res) => res.send("Medway's Card Machine Online!"));
app.listen(process.env.PORT || 3000);

// ---------------- BOT ----------------

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// ---------------- DATABASE ----------------

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

// ---------------- READY ----------------

client.once(Events.ClientReady, async () => {
  console.log(`${client.user.tag} online`);

  const commands = [
    new SlashCommandBuilder()
      .setName("ping")
      .setDescription("Check if the bot is online"),

    new SlashCommandBuilder()
      .setName("start")
      .setDescription("Start playing"),

    new SlashCommandBuilder()
      .setName("profile")
      .setDescription("View your profile")
  ].map(c => c.toJSON());

  const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

  try {
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );

    console.log("Slash commands registered.");
  } catch (err) {
    console.error(err);
  }
});

// ---------------- COMMANDS ----------------

client.on(Events.InteractionCreate, async interaction => {

  if (!interaction.isChatInputCommand()) return;

  const users = loadUsers();

  // /ping

  if (interaction.commandName === "ping") {
    return interaction.reply({
      content: "🏓 Pong!",
      ephemeral: true
    });
  }

  // /start

  if (interaction.commandName === "start") {

    if (users[interaction.user.id]) {
      return interaction.reply({
        content: "You already have an account! Use **/profile**.",
        ephemeral: true
      });
    }

    users[interaction.user.id] = {
      username: interaction.user.username,
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
      .setColor("Blue")
      .setTitle("🥚 Welcome to Medway's Card Machine!")
      .setDescription("Your account has been created!")
      .addFields(
        {
          name: "🎁 Rewards",
          value: "🥚 Starter Eggs: **3**\n💎 Gems: **100**"
        },
        {
          name: "⭐ Level",
          value: "1",
          inline: true
        }
      );

    return interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }

  // /profile

  if (interaction.commandName === "profile") {

    if (!users[interaction.user.id]) {
      return interaction.reply({
        content: "Use **/start** first!",
        ephemeral: true
      });
    }

    const p = users[interaction.user.id];

    const embed = new EmbedBuilder()
      .setColor("Green")
      .setTitle(`${interaction.user.username}'s Profile`)
      .addFields(
        {
          name: "⭐ Level",
          value: String(p.level),
          inline: true
        },
        {
          name: "💎 Gems",
          value: String(p.gems),
          inline: true
        },
        {
          name: "🥚 Starter Eggs",
          value: String(p.eggs.starter),
          inline: true
        },
        {
          name: "🃏 Cards",
          value: String(p.cards.length),
          inline: true
        }
      );

    return interaction.reply({
      embeds: [embed],
      ephemeral: true
    });

  }

});

client.login(process.env.TOKEN);
