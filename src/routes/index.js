const express = require('express');
const path = require('path');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const ProductService = require('../services/ProductService');
const UserService = require('../services/UserService');
const receipt = '../assets/receipt.pdf';
const { config } = require('../config');

require('../utils/auth/strategies/jwt');
require('../utils/auth/strategies/basic');

const platziStore = (app) => {
  const router = express.Router();
  app.use('/api/', router);

  const productService = new ProductService();
  const userService = new UserService();

  router.get('/', (req, res) => {
    res.send(`API v2`);
  });

  router.get('/receipts', (req, res, next) => {
    let file = path.join(__dirname, receipt);
    res.sendFile(file);
  });

  router.get('/products', async (req, res, next) => {
    const storeProducts = await productService.getProducts()
    res.status(200).json(storeProducts);
  });

  router.get('/products/:id', async (req, res, next) => {
    const { id } = req.params
    const storeProducts = await productService.getProductById(id)
    res.status(200).json(storeProducts);
  });

  router.put(
    '/products/:id',
    passport.authenticate('jwt',{ session: false }),
    async (req, res, next) => {
      try{
        const { id } = req.params
        const { body: product } = req
        const storeProducts = await productService.updateProductById({ id, ...product })
        res.status(200).json(storeProducts);
      } catch(error){
        next(error);
      }
    }
  );

  router.delete(
    '/products/:id',
    passport.authenticate('jwt', { session: false }),
    async (req, res, next) => {
      try {
        const { id } = req.params;
        const storeProducts = await productService.deleteProductById(id);
        res.status(200).json(storeProducts);
      } catch (error) {
        next(error);
      }
    }
  );

  router.post('/sign-up', async (req, res, next) =>{
    try {
      const {body: user} = req;
      const createUserId = await userService.createUser(user);
      res.status(201).json({createUserId});
    } catch (error) {
      next(error);
    }
  })

  router.post('/sign-in', async (req, res, next) =>{
    passport.authenticate('basic',(error, user)=> {
      try {
        if (error || !user){
          next(error);
          return;
        }

        req.login(user, {session: false}, async (cbError) =>{
          if (cbError) {
            next(cbError);
            return;
          }

          const {_id: id, ...userData} = user;
          const { authJwtSecret } = config;
          const payload = {sub: id, ...userData};
          const token = jwt.sign(payload, authJwtSecret, {expiresIn: '15m'});

          return res.status(200).json({token, user: { id, ...userData }});
        });
      } catch (error) {
        next(err);
      }
    })(req, res, next);
  })

  router.get('*', (req, res) => {
    res.status(404).send('Error 404');
  });
}

module.exports = platziStore;