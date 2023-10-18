const mongoose = require("mongoose")

const User = require("../../../mongo/models/users");
const Token = require("../../../mongo/models/tokens");

const model = {};

model.findExistingUser = async (email) => await User.findOne({ email });

model.createNewUser = async (email, encryptedPassword, role) => {
  return await User.create({
    email: email.toLowerCase(), // sanitize: convert email to lowercase
    password: encryptedPassword,
    role: role,
  });
};

model.findAndUpdateToken = async (id, milliseconds) => {
  console.log("🚀 ~ file: auth.model.js:19 ~ model.findAndUpdateToken= ~ id:", id)
  return await Token.findByIdAndUpdate(
    id,
    { expires: Date.now() + milliseconds },
    { new: true }
  );
};

model.createToken = async (id, token, expiresAt, userId) => {
  return await Token.create({
    _id: id,
    accessToken: token,
    expires: expiresAt,
    userId: userId,
  });
};

model.deleteToken = async (id) => {
  await Token.deleteOne({ _id: id });
};

model.deleteMultipleTokens = async (arrayOfUserIds) => {
  console.log("🚀 ~ file: auth.model.js:41 ~ model.deleteMultipleTokens ~ arrayOfIds:", arrayOfUserIds)
  await Token.deleteMany({ userId: { $in: arrayOfUserIds }});
};

module.exports = model;
