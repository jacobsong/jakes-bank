const Discord = require("discord.js");
const Event = require("../models/Event");
const Wallet = require("../models/Wallet");

module.exports = {
  name: "bet",
  description: "Bet on an event",
  guildOnly: true,
  roleRequired: 0, // 0=None, 1=Staff, 2=Admin
  argsRequired: 0,
  mentionsRequired: 0,
  usage: undefined,
  async execute(msg, args) {
    const embed = new Discord.RichEmbed().setColor("GREEN");

    try {
      const wallet = await Wallet.findOne({ userId: msg.author.id });
      
      if (wallet === null) {
        msg.reply("You don't have a wallet yet. Run the \`wallet\` command to create one");
        return;
      }
      
      const events = await Event.find({});
      
      if (events.length === 0) {
        msg.reply("No event found");
        return;
      }

      let desc = "";
      events.forEach((event, i) => {
        desc += `**${i + 1}.** - ${event.glad1} vs ${event.glad2}\n`;
      });
      embed.setDescription(desc).setAuthor("Enter the event # you want to bet on: ");

      const filter = (response) => {
        return msg.author.id === response.author.id;
      }

      let choice;
      let event;
      let wagerAmt;
      let wagerFor;
      try {
        msg.channel.send(embed);
        choice = await msg.channel.awaitMessages(filter, { max: 1, time: 60000, errors: ["time"] });
        const idx = parseInt(choice.first().content) - 1;
        if ((idx <= events.length) && (idx >= 0)) {
          event = events[idx];
        } else {
          msg.reply("Not a valid event number");
          return;
        }
        msg.reply("Enter your wager amount:");
        msg.reply(`Enter who your wager is for: (1) for `);
      } catch (e) { return }
        
      

    } catch (e) {
      msg.reply("There was an error");
      return;
    }

    return;
  },
};