const { EmbedBuilder } = require("discord.js");

const { loadUsers, saveUsers } = require("../utils/database");

module.exports = {

    name: "start",

    async execute(interaction) {

        const users = loadUsers();

        if (users[interaction.user.id]) {

            return interaction.reply({

                content:
                    "❌ You already have an account!\nUse **/profile**.",

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

            .setTitle("🥚 Welcome!")

            .setDescription("Your journey begins!")

            .addFields(

                {

                    name: "Rewards",

                    value:

                        "🥚 Starter Eggs: **3**\n💎 Gems: **100**"

                },

                {

                    name: "Current Level",

                    value: "⭐ 1"

                }

            );

        interaction.reply({

            embeds: [embed],

            ephemeral: true

        });

    }

};
