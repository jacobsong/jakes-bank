const mongoose = require("mongoose");
const { Schema } = mongoose;

const eventSchema = new Schema(
  {
    creatorId: String,
    creatorName: String,
    creatorAvatar: String,
    date: String,
    glad1: String,
    glad2: String,
    stream: String,
    glad1Pool: { type: Number, default: 0 },
    glad2Pool: { type: Number, default: 0 },
    wagers: [ { _id: String, userName: String, wagerAmt: Number, wagerFor: Number } ]
  }
);

module.exports = Event = mongoose.model("events", eventSchema);
