const mongoose = require("mongoose");

const tokensSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true }, 
    accessToken: { type: String, required: true },
    expires: { type: Date, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamp: true, autoIndex: false }
);

module.exports = mongoose.model("Token", tokensSchema);
