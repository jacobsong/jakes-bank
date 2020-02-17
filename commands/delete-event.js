const Discord = require("discord.js");
const Event = require("../models/Event");

module.exports = {
  name: "delete-event",
  description: "Delete a gladiator event",
  guildOnly: true,
  roleRequired: 1, // 0=None, 1=Staff, 2=Admin
  argsRequired: 0,
  mentionsRequired: 0,
  usage: undefined,
  async execute(msg, args) {
    const embed = new Discord.RichEmbed().setColor("RED");

    try {
      const events = await Event.find({});
      
      if (events === null) {
        msg.reply("No event found");
        return;
      }

      let desc = "";
      events.forEach((event, i) => {
        desc += `**${i + 1}.** - ${event.glad1} vs ${event.glad2}\n`;
      });
      embed.setDescription(desc).setAuthor("Enter the event # you want to delete: ");

      const filter = (response) => {
        return msg.author.id === response.author.id;
      }

      let choice;
      try { 
        msg.channel.send(embed);
        choice = await msg.channel.awaitMessages(filter, { max: 1, time: 60000, errors: ["time"] });
      } catch (e) { return }
        
      const idx = parseInt(choice.first().content) - 1;
      if ((idx <= events.length) && (idx >= 0)) {
        const event = events[idx];
        await Event.deleteOne({ _id: event._id })
        msg.reply("Successfully deleted that event");
      } else {
        msg.reply("Not a valid event number");
        return;
      }
      
    } catch (e) {
      msg.reply("There was an error");
      return;
    }

    return;
  },
};