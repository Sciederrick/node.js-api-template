const jwt = require("jsonwebtoken");

const {
  findExistingUser,
  createNewUser,
  findAndUpdateToken,
  createToken,
  deleteToken,
  deleteMultipleTokens,
  updatePassword
} = require("./../model/auth.model");

const helpers = require("../util/helper.util");
const mailgun = require("./../util/mailgun.util");
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
    console.log(
      "🚀 ~ file: auth.controller.js:20 ~ controller.registerUser= ~ user:",
      user
    );

    const tokenId = createRandomString(20);
    const token = jwt.sign(
      { id: tokenId, user_id: user._id, email },
      process.env.TOKEN_KEY,
      { expiresIn: helpers.generateTokenExpiration() }
    );
    user.token = token;

    const ONE_HR = 60 * 60 * 1000; // minutes, seconds, milliseconds

    await createToken(tokenId, token, ONE_HR, user._id);
    console.log(
      "🚀 ~ file: auth.controller.js:28 ~ controller.registerUser= ~ user.token:",
      user.token
    );
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
    const newToken = await createToken(
      tokenId,
      token,
      helpers.generateTokenExpiration(),
      user._id
    );

    console.log(
      "🚀 ~ file: auth.controller.js:76 ~ returnres.status ~ newToken:",
      newToken
    );
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
    extend = typeof extend == "boolean" ? extend : false;
    id = typeof id == "string" && id.trim().length > 0 ? id : false;
    if (!(id && extend))
      return res.status(400).json({ message: "Invalid input", status: 400 });

    console.log(
      "🚀 ~ file: auth.controller.js:97 ~ controller.extendTokenValidity= ~ id:",
      id
    );
    const ONE_HR_EXTENSION = 60 * 60 * 1000; // minutes, seconds, milliseconds
    const extendedToken = await findAndUpdateToken(id, ONE_HR_EXTENSION);
    console.log(
      "🚀 ~ file: auth.controller.js:97 ~ controller.extendTokenValidity= ~ extendedToken:",
      extendedToken
    );
    if (!extendedToken)
      return res.status(404).json({
        message: "Access token not found",
        status: 404,
      });

    return res.status(200).json({
      message: "Session extended successfully.",
      status: 200,
      expires: extendedToken.expires,
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
    if (!(userIds?.length > 0))
      return res.status(400).json({
        message: "Invalid ids",
        status: 400,
      });
    userIds.forEach((id, index) => {
      if (typeof id != "string" || id.trim().length == 0)
        return res.status(400).json({
          message: "Invalid id format",
          status: 400,
        });
      userIds[index] = id.trim();
    });

    const deleted = await deleteMultipleTokens(userIds);
    return res.status(200).json({
      message: "Resources deleted successfully",
      deleted: deleted?.deletedCount,
      status: 500,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Something went wrong.",
      status: 500,
    });
  }
};

controller.createPasswordResetLink = async (req, res, _) => {
  try {
    let { email } = req.body;
    email =
      typeof email == "string" && email.trim().length > 0
        ? email.trim()
        : false;
    if (!email)
      return res.status(400).json({
        message: "Invalid email",
        status: 400,
      });

    const foundUser = await findExistingUser(email);
    if (!foundUser)
      return res.status(404).json({
        message: "User not found",
        status: 404,
      });

    const secret = foundUser.password + "-" + foundUser.createdAt.getTime();
    const token = jwt.encode({ id: foundUser._id, email }, secret);
    const resetLink = `${process.env.BASE_URL}/v1/api/auth/resetpassword/${foundUser._id}/${token}`;
    mailgun.send(
      "passwordReset",
      "devacc454@gmail.com",
      resetLink,
      (err, data) => {
        if (!err && data) {
          return res.sendStatus(200);
        } else {
          return res
            .status(408)
            .json({
              Error: `Email forwarding failed with ${err}, contact admin for support.`,
            });
        }
      }
    );
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Something went wrong.",
      status: 500,
    });
  }
};

controller.createPasswordResetForm = async (req, res, _) => {
  try {
    const { id, token } = req.params;
    const foundUser = await findExistingUser(id);
    const secret = foundUser.password + "-" + foundUser.createdAt.getTime();
    const payload = jwt.verify(token, secret);

    return res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
      * {
            box-sizing: border-box;
      }
    
            body {
                background-color: #f6f9fc;
                color: #333;
                font-family: 'Arial', sans-serif;
                text-align: center;
                margin: 0;
                padding: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
            }
    
            .container {            
                border-radius: 6px;            
                max-width: 400px;
                width: 100%;
                padding: 20px;
                display: flex;
                flex-direction: column;
                align-items: center;
            }
      
      .bg-white { background-color: #fff; }
    
      .shadow-md { box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); } 
    
            h1 {
                font-size: 28px;
                margin-bottom: 20px;
            }
    
            input[type="password"] {
                width: 100%;
                padding: 10px;
                margin: 10px 0;
                border: 1px solid #ccc;
                border-radius: 4px;
                transition: border-color 0.3s;
            }
    
            input[type="password"]:focus {
                outline-color: #00a9e0; /* Blue outline on focus */
            }
    
            input[type="submit"] {
                width: 100%;
                padding: 10px;
                background-color: #00a9e0;
                color: #fff;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-weight: 700;
            }
    
            input[type="submit"]:hover {
                background-color: #0092c6;
            }
    
            .logo-container {
                display: flex;
          width: 100%;
                justify-items: left;
                margin-bottom: 20px;
          padding: 10px;
            }
    
            .logo {
                width: 48px;
                height: 48px;
            }
    
            /* Media queries for responsiveness */
            @media (max-width: 768px) {
                .container {
                    width: 95%;
                }
            }
        </style>
    </head>
    <body>
      <div class="container">
        <div class="logo-container">
            <img class="logo" src="https://via.placeholder.com/48" alt="Logo">
        </div>
        <div class="container bg-white shadow-md">
          <h1>Password Reset</h1>
          <form>
            <input type="password" placeholder="New Password" required>
            <input type="hidden" name="id" value="${payload.id}" />
            <input type="hidden" name="token" value="${token}" />
            <input type="submit" value="Reset Password">
          </form>
        <div>
      </div>
    </body>
    </html>
    `);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Something went wrong.",
      status: 500,
    });
  }
};

controller.resetPassword = async (req, res, _) => {
  try {
    let { id, token, password } = req.body;
    id = typeof id == 'string' && id.trim().length > 0 ? id.trim() : false;
    token = typeof token == 'string' && token.trim().length > 0 ? token.trim() : false;
    password = typeof password == 'string' && password.trim().length > 0 ? password.trim() : false;

    if (!(id && token && password)) return res.status(400).json({ message: "Invalid form", status: 400 });

    const foundUser = await findExistingUser(id);
    const secret = foundUser.password + "-" + foundUser.createdAt.getTime();
    const payload = jwt.verify(token, secret);

    await updatePassword(payload.id, password);

    return res.status(200).json({ message: "Password reset successfully", status: 200 });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Something went wrong.",
      status: 500,
    });  
  }
};

module.exports = controller;
