const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");

const listingController = require("../controllers/listings.js");
const multer  = require('multer');
const { storage } = require("../cloudConfiq.js");
const upload = multer({ storage });

// Show all Listing data
router.route("/")
    .get(wrapAsync(listingController.index));

// Add data to database
router
.post("/create",isLoggedIn, upload.single("listing[image]"), validateListing, wrapAsync(listingController.createListing));


// Take to the create listing form page
router.get("/create", isLoggedIn, listingController.newRenderForm);

// Edit listing Page
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.editRenderForm));

router.route("/:id")
    // Show details of a specific listing data
    .get(wrapAsync(listingController.showListingDetails))
    // Update data to database
    .patch(isLoggedIn, isOwner, upload.single("listing[image]"), validateListing, wrapAsync(listingController.updateListing))
    // Delete data from database
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));



module.exports = router;