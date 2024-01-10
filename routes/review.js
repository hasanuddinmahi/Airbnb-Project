const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utils/wrapAsync.js");
const Review = require("../models/reviews.js");
const Listing = require("../models/listing.js");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware.js");

const reviewController = require("../controllers/reviews.js");

//review to the database
router.post("/", isLoggedIn, validateReview, wrapAsync(reviewController.createReview));

// delete review from the database
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(reviewController.distroyReview));

module.exports = router;