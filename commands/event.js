const Meetup = require("../models/Meetup");

module.exports = {
  name: "new-meetup",
  description: "Create a new meetup for people to rsvp for (respond within 60 seconds)",
  guildOnly: true,
  roleRequired: 1, // 0=None, 1=Staff, 2=Admin
  argsRequired: 0,
  mentionsRequired: 0,
  usage: undefined,
  async execute(msg, args) {
    try {
      const count = await Meetup.countDocuments({});
      if (count > 9) {
        msg.reply("You are at the limit of 10 meetups");
        return;
      }

      const filter = (response) => {
        return msg.author.id === response.author.id;
      }

      await msg.reply("What is the meetup description?");
      const description = await msg.channel.awaitMessages(filter, { max: 1, time: 60000, errors: ["time"] });

      await msg.reply("Where will the meetup take place?");
      const location = await msg.channel.awaitMessages(filter, { max: 1, time: 60000, errors: ["time"] });

      await msg.reply("What date is the meetup?");
      const date = await msg.channel.awaitMessages(filter, { max: 1, time: 60000, errors: ["time"] });

      await msg.reply("Who is the Point of Contact (POC)?");
      const poc = await msg.channel.awaitMessages(filter, { max: 1, time: 60000, errors: ["time"] });

      const newId = await getNextSequenceValue('meetupId');
      if (newId === false) {
        msg.reply("There was a database error");
        return;
      }

      await new Meetup({
        _id: newId,
        creatorId: msg.author.id,
        creatorName: msg.author.tag,
        creatorAvatar: msg.author.avatarURL,
        desc: description.first().content,
        location: location.first().content,
        date: date.first().content,
        poc: poc.first().content
      }).save();

      msg.reply("Meetup has been created")
      
    } catch (e) {
      return;
    }
  },
};