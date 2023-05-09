const userModel = require('../models/users/userModel');
const jwt = require('jsonwebtoken');
const userController = {};

userController.createUser = (req, res) => {
  const { username, password, email } = req.body;

  userModel.createUser(username, password, email)
    .then((user) => {
      const token = user.auth_token;
      delete user.auth_token;
      res.status(201).json({ message: 'User created successfully', user, token });
    })
    .catch((err) => {
      res.status(err.status || 500).json({ message: err.message });
    })
};

userController.getUserById = (req, res) => {
  const { id } = req.params;

  userModel.getUserById(id)
    .then((user) => {
      if (!user) {
        throw new Error('User not found');
      }
      res.status(200).json(user);
    })
    .catch((err) => {
      res.status(err.status || 500).json({ message: err.message });
    });
};



userController.login = (req, res, next) => {
  const { username, password } = req.body;

  userModel.login(username, password)
    .then(async (user) => {
      req.session.userId = user.user_id;
      const token = user.auth_token;
      delete user.auth_token;

      res.status(200).json({ user, token });
    })
    .catch((err) => {
      next(err);
    });
};

userController.logout = async (req, res, next) => {
  if (req.method === 'POST' || req.method === 'GET') {
    try {
      await userModel.clearAuthToken(req.user.sub);
      userModel.logout(req);
      res.status(200).json({ message: 'User logged out successfully' });
    } catch (err) {
      next(err);
    }
  } else {
    next(new CustomError('Invalid HTTP method', 405));
  }
};

userController.getCurrentUser = (req, res, next) => {
  userModel.getCurrentUser(req)
    .then((user) => {
      res.status(200).json(user); // Send the response with user data
    })
    .catch((err) => {
      res.status(err.status || 500).json({ message: err.message });
    });
};

module.exports = userController;
