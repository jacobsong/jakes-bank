const { prefix } = require("../config/config");
const validRoles = require("./validRoles");

const checkCommand = (msg, command, args) => {
  //Check if command is guild only
  if (command.guildOnly && msg.channel.type !== 'text') {
    msg.reply("I can't execute that command inside DMs");
    return false;
  }

  //Check if command requires role
  if (command.roleRequired) {
    let userRoleCd;
    msg.member.roles.some((role) => { 
      if (role.name in validRoles) {
        userRoleCd = validRoles[role.name];
      }
    });

    if (userRoleCd < command.roleRequired || userRoleCd === undefined) {
      msg.reply("you do not have permission to use this command");
      return false;
    }
  }

  //Check if command requires args
  if (command.argsRequired != args.length) {
    if (command.usage) {
      msg.reply(`the proper usage would be: \`${prefix}${command.name} ${command.usage}\``);
      return false;
    }
  }

  //Check if command requires mentions
  if (command.mentionsRequired > 0) {
    if (msg.mentions.members.size != command.mentionsRequired) {
      msg.reply(`expected ${command.mentionsRequired} mentions, received ${msg.mentions.members.size}`);
      return false;
    }
  }

  //Return true if no validation errors
  return true;
};


module.exports = {
  checkCommand
};
