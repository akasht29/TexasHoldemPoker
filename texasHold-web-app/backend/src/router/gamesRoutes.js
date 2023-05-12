const express          = require('express');
const router           = express.Router();
const gameController   = require('../controllers/gameController');
const { getAllGames } = require('../models/game/gameModel');

router.get('/waiting-room/:gameId', async (request, response) => {
    try {
        const gameId   = request.params.gameId;
        const playerId = request.session.user;

        // check if the game has started.
        if (await gameController.gameStarted(gameId)) {
            response.redirect(`/game/room/${gameId}`)
        }

        response.render('game-waiting-room', { 
            gameId: gameId, 
            lobbyOwner: await gameController.firstPlayer(gameId) 
        });
    }
    catch (error) {
        console.log("game room error:", error.message);
    }
});

router.get('/room/:gameId/start', (request, response) => {
    try {
        // TODO: 
        // Redirect all players to `/game/room/${gameId}`

        const gameId = request.params.gameId;

        response.render('game-room', { gameId: gameId });
    }
    catch (error) {
        console.log("game room error:",)
    }
});

router.get('/room/:gameId/leave'), (request, response) => {
    // TODO:
    // Remove request.session.user from game gameId. 
    response.redirect('/user/lobby');
}

router.get('/room/:gameId', (request, response) => {
    try {
        // TODO: 
        // Check if the player is in the game If there is room, add 
        // the player. Otherwise, redirect the player back to the lobby

        const gameId = request.params.gameId;

        response.render('game-room', { gameId: gameId });
    }
    catch (error) {
        console.log("game room error:",)
    }
});

router.get('/room/:gameId/leave', (request, response) => {
    const gameId   = request.params.gameId;
    const playerId = request.session.user;

    // gameController.removePlayer(gameId, playerId);

    response.redirect('/user/lobby');
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
