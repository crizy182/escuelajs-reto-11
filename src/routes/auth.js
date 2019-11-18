const express = require("express");
const passport = require("passport");
const boom = require("@hapi/boom");
const jwt = require("jsonwebtoken");
const UsersService = require("../services/UserService");
const validationHandler = require("../utils/middleware/validationHandler");
const { createUserSchema } = require("../utils/schemas/users");

const { config } = require("../config");

//Basic Strategy
require("../utils/auth/strategies/basic");

function authApi(app) {
  const router = express.Router();
  app.use("/api/auth", router);

  const usersService = new UsersService();

  router.post("/sin-in", async function(req, res, next) {
    passport.authenticate("basic", function(error, user) {
      try {
        if (error || !user) {
          res.status(401).json({
            message: "Not authorized",
            error
          });
        }

        req.login(
          user,
          {
            session: false
          },
          async function(error) {
            if (error) {
              res.status(401).json({
                message: "Not authorized",
                error
              });
            }

            const { _id: id, namne, email } = user;

            const payload = {
              sub: id,
              name,
              email
            };

            const token = jwt.sign(payload, config.authJwtSecret, {
              expiresIn: "15m"
            });

            return res.status(200).json({
              token,
              user: { id, name, email }
            });
          }
        );
      } catch (error) {
        res.status(401).json({ message: "Not authorized", error });
      }
    })(req, res, next);
  });
  router.post(
    "/sign-up", 
    validationHandler(createUserSchema), 
    async function( req, res, next) {
    const { body: user } = req;

    try {
      const createdUserId = await usersService.createUser({ user });

      res.status(201).json({
        data: createdUserId,
        message: "user created"
      });
    } catch (error) {
      res.status(401).json({
        message: "Error with the sign up",
        error
      });
    }
  });
}

module.exports = authApi;
