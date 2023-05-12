const express = require('express');
const userController = require('../controllers/userController');
const gameController = require('../controllers/gameController');
const { authMiddleware, redirectToLobbyIfAuthenticated } = require('../middleware/auth');
const { getUserByUsername } = require('../models/users/userModel');
const router = express.Router();

// User routes
router.post('/register', async (request, response) => {
  try {
    console.log(request);
    // check if request has necessary fields
    if (
      !('username' in request.body) ||
      !('email'    in request.body) ||
      !('password' in request.body)
    ) {
      response.status(400).json({ message: "Information missing." })
    }

    const { username, email, password } = request.body;

    console.log("username:", username);

    const newUser = await userController.createUser(
      username,
      email,
      password
    );

    if (!newUser) {
      throw new Error("Failed to create user");
    }

    console.log(newUser);

    request.session.user = {
      id: newUser.user_id,
      username: newUser.username,
      email: newUser.email
    };

    const games = await gameController.getAllGames();
    console.log("games:", JSON.stringify(games));

    response.redirect("/user/lobby",
      { games: games }
    );
  }
  catch (error) {
    response.status(500).json({ message: error.message });
  }
});

router.post('/login', async (request, response) => {
  try {
    console.log(request.sessionID);

    if (
      !("email"    in request.body) ||
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

    const {user_id, username } = user;

    request.session.user = {
      user_id,
      username,
      email
    };

    const games = await gameController.getAllGames();
    if (!games) {
      console.log("Problem will rogers");
    }
    console.log("games:", typeof(games[0]));

    request.session.games = games;
    response.redirect("/user/lobby")
  }
  catch (error) {
    console.log("login error: ", error.message);
    response.render("login");
  }
});

// we will handle the authMiddleware part differently
router.post('/logout', userController.logout);

// Front-end routes
router.get('/register',(_req, res) => {
  res.render('register');
});

router.get('/login', (_req, res) => {
  res.render('login', {user: res.locals.user});
});

router.get('/lobby', (req, res) => {
  res.render('lobby', { games: req.session.games } );
});

module.exports = router;
