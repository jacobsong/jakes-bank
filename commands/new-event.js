const Event = require("../models/Event");

module.exports = {
  name: "new-event",
  description: "Create a new gladiator event for people to wager on (respond within 60 seconds)",
  guildOnly: true,
  roleRequired: 1, // 0=None, 1=Staff, 2=Admin
  argsRequired: 0,
  mentionsRequired: 0,
  usage: undefined,
  async execute(msg, args) {
    try {
      const filter = (response) => {
        return msg.author.id === response.author.id;
      }

      await msg.reply("Who's the 1st gladiator?");
      const glad1 = await msg.channel.awaitMessages(filter, { max: 1, time: 60000, errors: ["time"] });

      await msg.reply("Who's the 2nd gladiator?");
      const glad2 = await msg.channel.awaitMessages(filter, { max: 1, time: 60000, errors: ["time"] });

      await msg.reply("Enter Date/Time of the match (ex: 2/5 7:00pm EST):");
      const date = await msg.channel.awaitMessages(filter, { max: 1, time: 60000, errors: ["time"] });

      await msg.reply("Enter the stream link:");
      const stream = await msg.channel.awaitMessages(filter, { max: 1, time: 60000, errors: ["time"] });

      await new Event({
        creatorId: msg.author.id,
        creatorName: msg.author.tag,
        creatorAvatar: msg.author.avatarURL,
        date: date.first().content,
        glad1: glad1.first().content,
        glad2: glad2.first().content,
        stream: stream.first().content
      }).save();

      msg.reply("Event has been created")
      
    } catch (e) {
      return;
    }
  },
};