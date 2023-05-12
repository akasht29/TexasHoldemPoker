const express          = require('express');
const router           = express.Router();
const gameController   = require('../controllers/gameController');
const {authMiddleware} = require('../middleware/auth');
const { getAllGames } = require('../models/game/gameModel');

router.get('/waiting-room/:gameId', (request, response) => {
    try {
        // TODO: ADD PLAYER TO GAME
        const gameId   = request.params.gameId;
        const playerId = request.session.user;
    
        // gameController.addPlayer(gameId, playerId);

        response.render('game-waiting-room', { 
            gameId: gameId, 
            lobbyOwner: true 
        });
    }
    catch (error) {
        console.log("game room error:", error.message);
    }
});

router.get('/room/:gameId', (request, response) => {
    try {
        // TODO: 
        // Check if the player is in the game If there is room, add 
        // the player otherwise, redirect the player back to the lobby

        const gameId = request.params.gameId;

        response.render('game-room', { gameId: gameId });
    }
    catch (error) {
        console.log("game room error:",)
    }
});

router.post('/room/:gameId/leave', (request, response) => {
    const gameId   = request.params.gameId;
    const playerId = req.session.user;

    // gameController.removePlayer(gameId, playerId);

    console.redirect('/lobby')
});

router.post('/create', async (request, response) => {
    try {
        let newGameInfo = await gameController.createGame(
            request.body.gameName,
            request.body.maxPlayers,
            request.body.maxRounds,
            request.body.minBet
        );

        if (!newGameInfo) {
            throw new Error("Could not make game");
        }

        console.log(newGameInfo);

        response.redirect(`/game/waiting-room/${newGameInfo.game_id}`);
    }
    catch (error) {
        console.log(error.message);
        response.status(500).json({ message: error.message });
    }
});

module.exports = router;
