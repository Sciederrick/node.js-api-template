const jwt = require("jsonwebtoken");

const { findExistingUser, createNewUser, findAndUpdateToken, createToken, deleteToken, deleteMultipleTokens } = require("./../model/auth.model");

const helpers = require("../util/helper.util");
const { createRandomString } = require("../../../tests/util/helper.util");

const controller = {};

controller.registerUser = async (req, res, _) => {
  const { email, password } = req.body;
  try {
    const existingUser = await findExistingUser(email);
    if (existingUser != null)
      return res
        .status(409)
        .json({ message: "User with that email already exits", status: 409 });

    const encryptedPassword = helpers.hash(password);
    const user = await createNewUser(email, encryptedPassword, "client");
    console.log("🚀 ~ file: auth.controller.js:20 ~ controller.registerUser= ~ user:", user)

    const tokenId = createRandomString(20);
    const token = jwt.sign(
      { id: tokenId, user_id: user._id, email },
      process.env.TOKEN_KEY,
      { expiresIn: helpers.generateTokenExpiration() }
    );
    user.token = token;

    const ONE_HR = 60 * 60 * 1000 // minutes, seconds, milliseconds

    await createToken(tokenId, token, ONE_HR, user._id);
    console.log("🚀 ~ file: auth.controller.js:28 ~ controller.registerUser= ~ user.token:", user.token)
    return res.status(201).json(user);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Something went wrong.",
      status: 500,
    });
  }
};

controller.loginUser = async (req, res, _) => {
  let { email, password } = req.body;
  try {
    email = typeof email == "string" && email.trim() != "" ? email : false;
    password =
      typeof password == "string" && email.trim() != "" ? password : false;

    if (!(email && password))
      return res.status(400).json({
        message: "Invalid credentials",
        status: 400,
      });

    let user = await findExistingUser(email);
    const isLoginSuccessful = user && user.password == helpers.hash(password);

    if (!isLoginSuccessful) {
      return res.status(400).json({
        message: "Invalid credentials",
        status: 400,
      });
    }

    const tokenId = createRandomString(16);
    const token = helpers.generateToken(tokenId, user);
    const newToken = await createToken(tokenId, token, helpers.generateTokenExpiration(), user._id)

    console.log("🚀 ~ file: auth.controller.js:76 ~ returnres.status ~ newToken:", newToken)
    return res.status(200).json({
      email: user.email,
      role: user.role,
      token: newToken.accessToken,
      status: 200,
      message: "Logged in successfully.",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Something went wrong.",
      status: 500,
    });
  }
};

controller.extendTokenValidity = async (req, res, _) => {
  try {
    let { id, extend } = req.body;
    extend = typeof extend == 'boolean' ? extend : false;
    id = typeof id == "string" && id.trim().length > 0 ? id : false;
    if (!(id && extend))
      return res.status(400).json({ message: "Invalid input", status: 400 });

    console.log("🚀 ~ file: auth.controller.js:97 ~ controller.extendTokenValidity= ~ id:", id)
    const ONE_HR_EXTENSION = 60 * 60 * 1000 // minutes, seconds, milliseconds
    const extendedToken = await findAndUpdateToken(id, ONE_HR_EXTENSION);
    console.log("🚀 ~ file: auth.controller.js:97 ~ controller.extendTokenValidity= ~ extendedToken:", extendedToken)
    if (!extendedToken) return res.status(404).json({
      message: "Access token not found",
      status: 404
    });

    return res.status(200).json({
      message: "Session extended successfully.",
      status: 200,
      expires: extendedToken.expires
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Something went wrong.",
      status: 500,
    });
  }
};

controller.deleteToken = async (req, res, _) => {
  try {
    const { id } = req.body;
    const tokenId = typeof id == "string" ? id : false;
    if (!tokenId)
      return res.status(400).json({ message: "Invalid input", status: 400 });

    await deleteToken(tokenId);
    return res.status(200).json({
      message: "Session stopped successfully.",
      status: 200,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Something went wrong.",
      status: 500,
    });
  }
};

controller.deleteMultipleTokens = async (req, res, _) => {
  try {
    let { userIds } = req.body;
    if (!(userIds?.length > 0)) return res.status(400).json({
        message: "Invalid ids",
        status: 400
    });
    userIds.forEach((id, index) => {
        if (typeof id != 'string' || id.trim().length == 0)  return res.status(400).json({
            message: "Invalid id format",
            status: 400
        });
        userIds[index] = id.trim();
    });

    const deleted = await deleteMultipleTokens(userIds);
    return res.status(200).json({
        message: "Resources deleted successfully",
        deleted: deleted?.deletedCount,
        status: 500
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Something went wrong.",
      status: 500,
    });
  } 
};

module.exports = controller;
