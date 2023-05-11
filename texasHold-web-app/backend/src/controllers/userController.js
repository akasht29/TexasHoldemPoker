const userModel = require('../models/users/userModel');
const jwt       = require('jsonwebtoken');
const bcrypt    = require("bcrypt");
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



userController.login = async (email, password) => {
  let user = await userModel.getUserByEmail(email);
  console.log("marker", user);

  if (!user) {
    return null;
  }

  if (
    (user.email != email) ||
    !bcrypt.compare(password, user.password)
  ) {
    console.log("passwords do not match");
    return null;
  }

  return user;
}

userController.logout = async (req, res, next) => {
  if (req.method === 'POST' || req.method === 'GET') {
    try {
      await userModel.clearAuthToken(req.user.sub);
      userModel.logout(req);
      res.status(200).json({ message: 'User logged out successfully' });
    } catch (error) {
      next(error);
    }
  } 
  else {
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
