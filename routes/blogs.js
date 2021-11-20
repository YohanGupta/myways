const express = require('express');
const router = express.Router(); 
const wrapAsync = require('../utils/wrapAsync');
const { blogSchemaJoi } = require('../JoiSchema.js');
const { isLoggedIn } = require('../middleware');

const AppError = require('../utils/AppError');
const Blogs = require('../models/blogs');

const validateBlog = (req, res, next) => {
    const { error } = blogSchemaJoi.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new AppError(msg, 400)
    } else {
        next();
    }
}

router.get('/', wrapAsync(async (req, res) => {
    const blogs = await Blogs.find({})
    res.render('blogs/index', {blogs})
}))

router.get('/new', isLoggedIn, wrapAsync(async (req, res) => {
    res.render('blogs/new')
}))

router.post('/', isLoggedIn, validateBlog, wrapAsync(async (req, res) => {
    const blog = new Blogs(req.body)
    await blog.save()
    req.flash('success', 'Successfully made a new blog!');
    res.redirect(`/blogs/${blog._id}`)    
}))

router.get('/:id', wrapAsync(async (req, res) => {
    const blog = await Blogs.findById(req.params.id)
    if(!blog){
        req.flash('error', 'Cannot find that blog')
        return res.redirect('/blogs')
    }
    res.render('blogs/show', {blog})
}))

router.get('/:id/edit', isLoggedIn, wrapAsync(async (req, res) => {
    const blog = await Blogs.findById(req.params.id)
    if(!blog){
        req.flash('error', 'Cannot find that blog')
        return res.redirect('/blogs')
    }
    res.render('blogs/edit', {blog})
}))

router.put('/:id', isLoggedIn, validateBlog, wrapAsync(async (req, res) => {
    const blog = await Blogs.findByIdAndUpdate(req.params.id, req.body, {new : true})
    req.flash('success', 'Successfully updated blog')
    res.redirect(`/blogs/${blog._id}`)
}))

router.delete('/:id', isLoggedIn, wrapAsync(async (req, res) => {
    await Blogs.findByIdAndDelete(req.params.id)
    req.flash('success', 'Successfully deleted blog')
    res.redirect('/blogs')
}))

module.exports = router;