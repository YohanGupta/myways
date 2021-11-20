const mongoose = require('mongoose')

const BlogsSchema = new mongoose.Schema({
    title : String, 
    image : String, 
    description : String, 
    date : String
})

const model = new mongoose.model('Blogs', BlogsSchema)
module.exports = model