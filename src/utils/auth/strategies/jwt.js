const passport = require('passport')
const { Strategy, ExtractJwt } = require('passport-jwt')
const boom = require('@hapi/boom')

const UserService = require('../../../services/UserService')
const { config } = require('../../../config')

passport.use(
  new Strategy(
    {
      secretOrKey: config.authJwtSecret,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
    },
    async (tokenPayload, cb) => {
      const userService = new UserService()
      const {email} = tokenPayload;
      try {
        const user = await userService.getUserByEmail(email)

        if (!user) {
          return cb(boom.unauthorized(), false)
        }

        delete user.password

        cb(null, user)
      } catch (error) {
        cb(error)
      }
    }
  )
)