const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { SaveRedirectUrl } = require("../middleware.js");

const userController = require("../controllers/users.js");

router.route("/signup")
    // take to the signup form page
    .get(userController.renderSignupForm)
    // submit form data to the database
    .post(wrapAsync(userController.signup));

router.route("/login")
    // take to the login page
    .get(userController.renderLoginForm)
    // submit login form and check with the database data
    // authenticate by using passport middleware
    .post(SaveRedirectUrl,
        passport.authenticate("local", { failureRedirect: '/login', failureFlash: true }), userController.login);


router.get("/logout", userController.logout);

module.exports = router;
