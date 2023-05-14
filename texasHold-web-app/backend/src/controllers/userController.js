const userModel = require('../models/users/userModel');
const jwt       = require('jsonwebtoken');
const bcrypt    = require("bcrypt");
const userController = {};

userController.createUser = async (newUsername, newEmail, newPassword) => {
  // const salt = bcrypt.genSalt(process.env.SECRET);
  // const hash = 
  return await userModel.createUser(newUsername, newEmail, newPassword);
};

userController.getUserById = async (userId) => {
  return await userModel.getUserById(userId);
};

userController.login = async (email, password) => {
  let user = await userModel.getUserByEmail(email);

  if (!user) {
    return null;
  }

  if ( !bcrypt.compare(password, user.password) ) {
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
