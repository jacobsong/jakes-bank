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
    if (msg.channel.name === "wagering") {
      const embed = new Discord.RichEmbed().setColor("GREEN");

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
          choice = parseInt(choice.first().content) - 1;
          if ((choice <= events.length) && (choice >= 0)) {
            event = events[choice];
          } else {
            msg.reply("Not a valid event number");
            return;
          }

          if (event.closed) {
            msg.reply("Betting is closed for this event");
            return;
          }

          msg.reply("Enter your wager amount:");
          wagerAmt = await msg.channel.awaitMessages(filter, { max: 1, time: 60000, errors: ["time"] });
          wagerAmt = parseInt(wagerAmt.first().content);
          if (wagerAmt <= 0 || isNaN(wagerAmt)) {
            msg.reply("Not a valid amount");
            return;
          }
          
          msg.reply(`Enter who your wager is for:\nType 1 for ${event.glad1}\nType 2 for ${event.glad2}`);
          wagerFor = await msg.channel.awaitMessages(filter, { max: 1, time: 60000, errors: ["time"] });
          wagerFor = parseInt(wagerFor.first().content);
          if (![1, 2].includes(wagerFor)) {
            msg.reply("Not a valid choice");
            return;
          }
        } catch (e) { return }
        
        const wallet = await Wallet.findOne({ userId: msg.author.id });
        
        if (wallet === null) {
          msg.reply("You don't have a wallet yet. Run the \`wallet\` command to create one");
          return;
        }

        if (wagerAmt > wallet.balance) {
          msg.reply("You don't have enough money");
          return;
        }

        const exists = await Event.exists({ _id: event._id, wagers: { $elemMatch: { _id: msg.author.id } } })
        if (exists) {
          msg.reply("You already placed a wager for this event");
          return;
        }

        const poolField = `glad${wagerFor}Pool`;
        await Event.updateOne(
          { _id: event._id },
          { 
            $inc: { [poolField]: wagerAmt },
            $push: { wagers: { _id: msg.author.id, userName: msg.author.tag, wagerAmt: wagerAmt, wagerFor: wagerFor } } 
          }
        )
        wallet.balance -= wagerAmt;
        wallet.save();

        msg.reply("Successfully placed your wager");

      } catch (e) {
        msg.reply("There was an error");
        return;
      }

      return;
    }
  },
};