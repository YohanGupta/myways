const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost:27017/myways')
const db = mongoose.connection
db.on("error", console.error.bind(console, "Connection error"))
db.once("open", () => {
    console.log("Database Connected")
})
const Blogs = require('../models/blogs')
const datas = require('./data')

const seedDb = async () => {
    await Blogs.deleteMany({})
    await Blogs.insertMany(datas)
}

seedDb()