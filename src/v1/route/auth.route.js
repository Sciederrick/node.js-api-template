const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  extendTokenValidity,
  deleteToken,
  deleteMultipleTokens,
  createPasswordResetLink,
  getPasswordResetForm,
  resetPassword
} = require("./../controller/auth.controller");

router
  .route("/register")
  /**
   * register with email and password
   */
  .post(registerUser);

router
  .route("/login")
  /**
   * login with email and password
   */
  .post(loginUser);

router
  .route("/token")
  /**
   * Extend the duration of the token
   */
  .put(extendTokenValidity);

router
  .route("/token")
  /**
   * Delete the token
   */
  .delete(deleteToken);

router
  .route("/token/all")
  /**
   * Delete the token
   */
  .delete(deleteMultipleTokens);

router
  .route("/passwordreset/link")
  /**
   * Forgot password
   */
  .post(createPasswordResetLink);

router
  .route("/passwordreset/:id/:token")
  /**
   * 
   */
  .get(getPasswordResetForm);

router
  .route("/passwordreset")
  /**
   * Reset password
   */
  .post(resetPassword);

module.exports = router;
