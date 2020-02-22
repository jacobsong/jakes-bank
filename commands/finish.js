const Discord = require("discord.js");
const Event = require("../models/Event");
const Wallet = require("../models/Wallet");

module.exports = {
  name: "finish",
  description: "Finish an event",
  guildOnly: true,
  roleRequired: 1, // 0=None, 1=Staff, 2=Admin
  argsRequired: 0,
  mentionsRequired: 0,
  usage: undefined,
  async execute(msg, args) {
    const embed = new Discord.RichEmbed().setColor("PURPLE");
    const embed2 = new Discord.RichEmbed().setColor("PURPLE");

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
      embed.setDescription(desc).setAuthor("Enter the event # you want to finish: ");

      const filter = (response) => {
        return msg.author.id === response.author.id;
      }

      let choice;
      let event;
      let winner;
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
        
        msg.reply(`Enter who won this event:\nType 1 for ${event.glad1}\nType 2 for ${event.glad2}`);
        winner = await msg.channel.awaitMessages(filter, { max: 1, time: 60000, errors: ["time"] });
        winner = parseInt(winner.first().content);
        if (![1, 2].includes(winner)) {
          msg.reply("Not a valid choice");
          return;
        }
      } catch (e) { return }

      let winnersPool;
      let losersPool;
      if (winner === 1) {
        winnersPool = event.glad1Pool;
        losersPool = event.glad2Pool;
      } else {
        winnersPool = event.glad2Pool;
        losersPool = event.glad1Pool;
      }

      let desc2 = "**Winners**\n\`\`\`";
      const winningBets = event.wagers.filter(wager => wager.wagerFor === winner);
      const winningIDs = [];
      winningBets.forEach(bet => winningIDs.push(bet._id));
      const winnersWallets = await Wallet.find({ userId: { $in: winningIDs } });
      winnersWallets.forEach(wallet => {
        const winnersBet = winningBets.find(x => x._id === wallet.userId);
        const rate = parseFloat((winnersBet.wagerAmt/winnersPool).toFixed(2));
        const cut = Math.round(rate * losersPool);
        wallet.balance += cut + winnersBet.wagerAmt;
        wallet.wins += 1;
        wallet.totalWinnings += cut;
        wallet.save();
        desc2 += `${wallet.userName} won ${cut} + ${winnersBet.wagerAmt}(original bet)\n`;
      });

      desc2 += "\`\`\`\n\n**Losers**\n\`\`\`"
      const losingBets = event.wagers.filter(wager => wager.wagerFor != winner);
      const losingIDs = [];
      losingBets.forEach(bet => losingIDs.push(bet._id));
      const losersWallets = await Wallet.find({ userId: { $in: losingIDs } });
      losersWallets.forEach(wallet => {
        const losersBet = losingBets.find(x => x._id === wallet.userId);
        wallet.totalLosses += losersBet.wagerAmt;
        wallet.losses += 1;
        wallet.save();
        desc2 += `${wallet.userName} lost ${losersBet.wagerAmt}\n`;
      });
      desc2 += "\`\`\`"

      await Event.deleteOne({ _id: event._id });

      embed2.setDescription(desc2);

      msg.channel.send(embed2);

    } catch (e) {
      msg.reply("There was an error");
      return;
    }

    return;
  },
};