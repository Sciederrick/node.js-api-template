const mongoose = require("mongoose")

const User = require("../../../mongo/models/users");
const Token = require("../../../mongo/models/tokens");

const model = {};

model.findExistingUser = async (emailOrId) => {
  const emailPattern = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  const isEmail = emailPattern.test(emailOrId);
  if (isEmail) {
    await User.findOne({ email });
  } else {
    await User.findOne({ _id: emailOrId });
  }
}

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
  await Token.deleteMany({ userId: { $in: arrayOfUserIds }});
};

model.updatePassword = async (id, newPassword) => {
  await User.updateOne({ _id: id }, { password: newPassword }, { new: true });
}

module.exports = model;
