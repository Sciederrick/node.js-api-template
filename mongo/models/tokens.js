const mongoose = require("mongoose");

const tokensSchema = new mongoose.Schema(
  {
    accessToken: { type: String, required: true },
    expires: { type: Number, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamp: true, _id: true, autoIndex: true }
);

module.exports = mongoose.model("Token", tokensSchema);
