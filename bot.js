const fs = require('fs');
const Discord = require("discord.js");
const mongoose = require("mongoose");
const validator = require("./services/validator");
const config = require("./config/config");


// Initialize Discord and import commands
const client = new Discord.Client({ disabledEvents: ["TYPING_START"] });
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));
client.commands = new Discord.Collection();
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}


// Verify connected and set presence
client.once("ready", () => {
  console.log("Connected as " + client.user.tag);
  client.user.setPresence({ game: { name: `type ${config.prefix}help` } });
});


// Connect to MongoDB Atlas
mongoose.connect(config.mongoURI, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true }).then(
  () => { console.log("MongoDB connected...\n"); },
  err => { console.log("MongoDB could not connect...\n" + err); }
);


// Respond to commands
client.on("message", async message => {
  if (!message.content.startsWith(config.prefix) || message.author.bot) return;

  const args = message.content.slice(config.prefix.length).split(' ');
  const commandName = args.shift().toLowerCase();

  if (!client.commands.has(commandName)) return;

  const command = client.commands.get(commandName);
  const isValid = validator.checkCommand(message, command, args);
  if (isValid === false) return;

  try {
    command.execute(message, args);
  } catch (error) {
    console.error(error);
    message.reply("there was an error trying to execute that command");
  }

});


// Login with bot token
try {
  client.login(config.token);
} catch (e) {
  console.log("Failed to login to Discord");
}
