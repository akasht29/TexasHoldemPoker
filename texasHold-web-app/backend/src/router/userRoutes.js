const express = require('express');
const userController = require('../controllers/userController');
const { authMiddleware, redirectToLobbyIfAuthenticated } = require('../middleware/auth');
const { getUserByUsername } = require('../models/users/userModel');
const router = express.Router();

// User routes
router.post('/register', (request, response) => {
  const { username, email, password } = request.body;
  try {
    // check if request has necessary fields
    if (
      !request.body.hasOwn("username") ||
      !request.body.hasOwn("email")    ||
      !request.body.hasOwn("password")
    ) {
      response.status(400).json({ message: "Information missing." })
    }

    const { id } = userController.createUser(
      username,
      email,
      password
    );

    if (!id) {
      throw new Error("Failed to create user");
    }

    request.session.user = {
      id,
      username,
      email
    };

    response.status(200).json();
  }
  catch (error) {
    response.status(500).json({ message: error.message });
  }
});

router.post('/login', async (request, response) => {
  try {
    console.log(request.body);

    if (
      !("email" in request.body) ||
      !("password" in request.body)
    ) {
      console.log("oops");
      response.status(400).json({ message: "Information missing." });
    }

    const { email, password } = request.body;
    console.log(email, ",", password);
    
    let user = await userController.login(email, password);

    if (!user) {
      throw new Error("Could not log in.");
    }

    response.locals.user = user;
    response.redirect("/user/lobby");
  }
  catch (error) {
    console.log("login error: ", error.message);
    response.render("login");
  }
});

// we will handle the authMiddleware part differently
router.post('/logout', userController.logout);

// Front-end routes
router.get('/register',(req, res) => {
  res.render('register');
});

router.get('/login', (_req, res) => {
  res.render('login', {user: res.locals.user});
});

router.get('/lobby', (req, res) => {
  res.render('lobby');
});

module.exports = router;
