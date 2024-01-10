if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require('method-override');
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js"); 

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, "public")));
app.engine("ejs", ejsMate);


const dbUrl = process.env.ATLASDB_URL;
// for cloud database deploy
const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto:{
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});

store.on("error", ()=>{
    console.log("ERROR IN MONGO SESSION STORE", err);
})

// set cookies 
const sessionOption = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie:{
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    }
}

// 'mongodb://127.0.0.1:27017/wanderlust'



main().catch(err => console.log(err));

async function main() {
    await mongoose.connect(dbUrl);
}

const port = 3000;

// app.get("/", (req, res) => {
//     res.send("working");
// });

app.use(session(sessionOption));
app.use(flash());

//for authenticate user
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// app.get("/demouser", async(req,res)=>{
//     let fakeUser = new User({
//         email: "abc@gmail.com",
//         username: "abc"
//     });

//     let registeredUser = await User.register(fakeUser, "abc");
//     res.send(registeredUser);
// })

app.use('/listings', listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/",userRouter);


app.get("*", (req, res, next) => {
    next(new ExpressError(404, "Page not Found!"));
})

app.use((err, req, res, next) => {
    let { status = 500, message = "something went wrong!" } = err;
    // res.status(status).send(message);
    res.status(status).render("./listings/error.ejs", { message });
})

app.listen(port, () => {
    console.log(`listening to port ${port}`);
})

