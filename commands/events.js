const Discord = require("discord.js");
const Event = require("../models/Event");

module.exports = {
  name: "events",
  description: "Display all the gladiator events",
  guildOnly: true,
  roleRequired: 0, // 0=None, 1=Staff, 2=Admin
  argsRequired: 0,
  mentionsRequired: 0,
  usage: undefined,
  async execute(msg, args) {
    const embed = new Discord.RichEmbed().setColor("BLUE");
    const embed2 = new Discord.RichEmbed().setColor("BLUE");

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
      embed.setDescription(desc).setAuthor("Enter the event # you want the details for: ");

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
        let wagersList1 = "";
        let wagersList2 = "";
        const event = events[idx];
        const glad1Wagers = event.wagers.filter(wager => wager.wagerFor === 1);
        const glad2Wagers = event.wagers.filter(wager => wager.wagerFor === 2);
        
        glad1Wagers.forEach(bet => {
          wagersList1 += `${bet.userName} bet ${bet.wagerAmt}\n`;
        });
        
        glad2Wagers.forEach(bet => {
          wagersList2 += `${bet.userName} bet ${bet.wagerAmt}\n`;
        });

        embed2.setAuthor(`Event created by ${event.creatorName}`, event.creatorAvatar)
          .addField(`**Date**`, event.date, true)
          .addBlankField(true)
          .addField(`**Stream Link**`, event.stream, true)
          .addField(`**Gladiator #1**`, event.glad1, true)
          .addBlankField(true)
          .addField(`**Gladiator #2**`, event.glad2, true)
          .addField(`**${event.glad1}'s Wager Pool**`, event.glad1Pool, true)
          .addBlankField(true)
          .addField(`**${event.glad2}'s Wager Pool**`, event.glad2Pool, true)
          .addField(`**${event.glad1}'s Wagers**`, wagersList1 || "No bets", true)
          .addBlankField(true)
          .addField(`**${event.glad2}'s Wagers**`, wagersList2 || "No bets", true)
          .setFooter(`Event ID: ${event._id}`);
        msg.channel.send(embed2);
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