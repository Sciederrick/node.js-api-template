const express = require('express');
const router = express.Router();

const { deleteMultipleUsers } = require("../controller/user.controller");

router
    .route("/")
    /**
     * Delete multiple users
     */
    .delete(deleteMultipleUsers)

module.exports = router;

