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
  return await Token.findOneAndUpdate(
    { _id: id },
    { expires: Date.now() + milliseconds },
    { new: true }
  );
};

model.createToken = async (token, expiresAt, userId) => {
  return await Token.create({
    accessToken: token,
    expires: expiresAt,
    userId: userId,
  });
};

model.deleteToken = async (id) => {
  await Token.deleteOne({ id: id });
};

module.exports = model;
