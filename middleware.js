const Listing = require("./models/listing");
const Review = require("./models/reviews.js")
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");

// checked logged in
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        // redirect url save
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must logged in to create listing");
        return res.redirect("/login");
    }
    next();
}

// redirect after login
module.exports.SaveRedirectUrl = (req, res, next)=> {
 if(req.session.redirectUrl){
    res.locals.redirectUrl = req.session.redirectUrl;
 }
 next();
}

// Owner varify
module.exports.isOwner = async (req,res,next) =>{
    let { id } = req.params; 
    let listing = await Listing.findById(id);
    if (!listing.owner.equals(res.locals.currUser._id)) {
        req.flash("error", "You don't have permission");
        return res.redirect(`/listings/${id}`);
    }

    next();
}

// Validate Listing
module.exports.validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
}

// Validate Review
module.exports.validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
}


// Author varify
module.exports.isReviewAuthor = async (req,res,next) =>{
    let { id, reviewId } = req.params; 
    let review = await Review.findById(reviewId);
    if (!review.author.equals(res.locals.currUser._id)) {
        req.flash("error", "You didn't create this review");
        return res.redirect(`/listings/${id}`);
    }

    next();
}
