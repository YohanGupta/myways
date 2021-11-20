const Joi = require('joi')

module.exports.blogSchemaJoi = Joi.object({
    title : Joi.string().required(),
    image : Joi.string().required(),  
    description : Joi.string().required(),
    date : Joi.string().required()
})
