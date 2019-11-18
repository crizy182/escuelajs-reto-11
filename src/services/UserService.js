const MongoConnect = require('../lib/mongo');
const bcrypt = require('bcrypt');

class UserService {
  constructor() {
    this.mongodb = new MongoConnect()
    this.collection = 'users'
  }

  async getUserByEmail(email) {
    try {
      const [ user ] = await this.mongodb.getAll(this.collection, { email });
      return eyes;
    } catch (error) {
      throw new Error(error);
    }
  }

  async createUser(user) {
    try {
      const { name, email, password } = user;
      const hashedPassord = await bcrypt.hash(password, 10);

      const createUserId = await this.mongodb.create(this.collection, {
        name,
        email,
        password: hashedPassord
      });
      return createUserId;
    } catch (error) {
      throw new Error(error);
    }
  }
}

module.exports = UserService;