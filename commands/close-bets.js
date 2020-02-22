const Discord = require("discord.js");
const Event = require("../models/Event");

module.exports = {
  name: "close-bets",
  description: "Close betting for an event so that no more bets can be placed",
  guildOnly: true,
  roleRequired: 1, // 0=None, 1=Staff, 2=Admin
  argsRequired: 0,
  mentionsRequired: 0,
  usage: undefined,
  async execute(msg, args) {
    if (msg.channel.name === "wagering") {
      const embed = new Discord.RichEmbed().setColor("ORANGE");

      try {
        const events = await Event.find({});
        
        if (events.length === 0) {
          msg.reply("No event found");
          return;
        }

        let desc = "";
        events.forEach((event, i) => {
          desc += `**${i + 1}.** - ${event.glad1} vs ${event.glad2}\n`;
        });
        embed.setDescription(desc).setAuthor("Enter the event # you want to close bets: ");

        const filter = (response) => {
          return msg.author.id === response.author.id;
        }

        let choice;
        let event;
        
        msg.channel.send(embed);
        choice = await msg.channel.awaitMessages(filter, { max: 1, time: 60000, errors: ["time"] });
        choice = parseInt(choice.first().content) - 1;
        if ((choice <= events.length) && (choice >= 0)) {
          event = events[choice];
        } else {
          msg.reply("Not a valid event number");
          return;
        }

        if (event.closed) {
          msg.reply("Event is already closed for bets");
          return;
        } else {
          event.closed = true;
          event.save();
        }
        
        msg.reply("Successfully closed betting");

      } catch (e) {
        msg.reply("There was an error");
        return;
      }

      return;
    }
  }
};