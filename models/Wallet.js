const mongoose = require("mongoose");
const { Schema } = mongoose;

const walletSchema = new Schema(
  {
    userId: String,
    userName: String,
    balance: { type: Number, default: 100 },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    totalWinnings: { type: Number, default: 0 },
    totalLosses: { type: Number, default: 0 }
  }
);

module.exports = Wallet = mongoose.model("wallets", walletSchema);
