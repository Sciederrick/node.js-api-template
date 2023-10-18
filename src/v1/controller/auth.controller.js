const jwt = require("jsonwebtoken");

const { findExistingUser, createNewUser, findAndUpdateToken, createToken, deleteToken } = require("./../model/auth.model");

const helpers = require("../util/helper.util");

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

    const token = jwt.sign(
      { user_id: user._id, email },
      process.env.TOKEN_KEY,
      { expiresIn: helpers.generateTokenExpiration() }
    );
    user.token = token;
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

    const token = helpers.generateToken(user);

    const newToken = await createToken(token, helpers.generateTokenExpiration(), user._id)

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
    const { id, extend } = req.body;
    const token = typeof id == "Number" ? id : false;
    if (!(token && extend))
      res.status(400).json({ message: "Invalid input", status: 400 });

    const ONE_HR_EXTENSION = 60 * 60 * 1000 // minutes, seconds, milliseconds
    const extendedToken = await findAndUpdateToken(id, ONE_HR_EXTENSION);
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

module.exports = controller;
