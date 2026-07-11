require("dotenv").config();

const { REST, Routes, SlashCommandBuilder } = require("discord.js");

const commands = [
  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Check if the bot is online"),

  new SlashCommandBuilder()
    .setName("start")
    .setDescription("Start your card adventure"),

  new SlashCommandBuilder()
    .setName("profile")
    .setDescription("View your profile"),

  new SlashCommandBuilder()
    .setName("eggs")
    .setDescription("View your eggs"),

  new SlashCommandBuilder()
    .setName("open")
    .setDescription("Open a Starter Egg"),

  new SlashCommandBuilder()
    .setName("help")
    .setDescription("View all commands")
].map(command => command.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log("Registering slash commands...");

    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );

    console.log("Slash commands registered!");
  } catch (error) {
    console.error(error);
  }
})();
