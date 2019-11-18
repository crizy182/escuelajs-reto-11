const joi = require('@hapi/joi');

const userSchema = {
    name: joi.string().max(100).required(),
    email: joi.string().email().required(),
    password: joi.string().required(),
    isAdmin: joi.boolean()
};

const createUserSchema = {
    ...userSchema,
    isAdmin: joi.boolean()
};


module.exports = { createUserSchema }; 