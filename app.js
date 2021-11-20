if(process.env.NODE_ENV !== "production"){
    require('dotenv').config()
}

const express = require('express')
const path = require('path')
const ejsMate = require('ejs-mate')
const mongoose = require('mongoose')
const session = require('express-session');
const flash = require('connect-flash');
const AppError = require('./utils/AppError');
const methodOverride = require('method-override')
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
// const MongoSt ore = require('connect-mongo')

const userRoutes = require('./routes/users');
const blogRoutes = require('./routes/blogs');


const MongoStore = require('connect-mongo')(session)
// const dbUrl = process.env.DB_URL
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/myways'
// mongodb://localhost:27017/myways
mongoose.connect(dbUrl)
 
const db = mongoose.connection
db.on("error", console.error.bind(console, "Connection error"))
db.once("open", () => {
    console.log("Database Connected")
})

const app = express()

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '/views'))

app.use(express.urlencoded({extended : true}))
app.use(methodOverride('_method'))

const secret = process.env.SECRET || 'thisshouldbeabettersecret!'

const store = new MongoStore({
    url: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60
});

store.on("error", function(e){
    console.log("SESSION STORE ERROR", e)
})

const sessionConfig = {
    store,
    name: 'session',
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig))
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    console.log(req.session)
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})


app.use('/', userRoutes);
app.use('/blogs', blogRoutes)

app.all('*', (req, res, next) => {
    next(new AppError("Invalid Request", 400))
})

//error handler
app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something Went Wrong" } = err
    res.status(statusCode).render('error', {err})
})

const port = process.env.PORT || 3000
app.listen(port, (req, res) => {
    console.log("Listening at 3000 port...")
})