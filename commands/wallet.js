const Discord = require("discord.js");
const Wallet = require("../models/Wallet");

module.exports = {
  name: "wallet",
  description: "Display your balance and stats",
  guildOnly: true,
  roleRequired: 0, // 0=None, 1=Staff, 2=Admin
  argsRequired: 0,
  mentionsRequired: 0,
  usage: undefined,
  async execute(msg, args) {
    const embed = new Discord.RichEmbed().setColor("GOLD");

    try {
      let wallet = await Wallet.findOne({ userId: msg.author.id });
      
      if (wallet === null) {
        wallet = await new Wallet({
          userId: msg.author.id,
          userName: msg.author.tag
        }).save();
      }

      embed.setAuthor(`${msg.author.tag}'s Wallet`, msg.author.avatarURL)
        .addField(`**Balance**`, wallet.balance)
        .addField(`**Wins**`, wallet.wins, true)
        .addBlankField(true)
        .addField(`**Losses**`, wallet.losses, true)
        .addField(`**Total Winnings**`, wallet.totalWinnings, true)
        .addBlankField(true)
        .addField(`**Total Losses**`, wallet.totalLosses, true)
        .setFooter("Jake's Bank is not FDIC Insured");
      msg.channel.send(embed);

    } catch (e) {
      msg.reply("There was an error");
      return;
    }

    return;
  },
};