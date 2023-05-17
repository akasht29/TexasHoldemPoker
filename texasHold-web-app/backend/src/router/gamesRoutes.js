const express          = require('express');
const router           = express.Router();
const gameController   = require('../controllers/gameController');
const playerController = require('../controllers/playerController');
const { GAME_STARTING } = require('../../../shared/constants');

router.get('/waiting-room/:gameId', async (request, response) => {
    try {
        const gameId = request.params.gameId;
        const userId = request.session.user.user_id;

        // check if there is room in the game
        if (await gameController.gameFull(gameId)) {
            response.redirect('/user/lobby');
        }

        

        // generate a new player id for the user if needed
        let playerId;
        if (request.session?.player?.playerId) {
            // if this block executes, it just means (at least in theory) 
            // that the the player refreshed the page.
            playerId = request.session.player.playerId;
        }
        else {
            player = { 
                playerId: await playerController.addPlayer(gameId, userId)
            };
            request.session.player = player;
            playerId = player.playerId;
        }
        
        console.log("playerData:", request.session.player, playerId);
        // check if the game has started.
        if (await gameController.gameStarted(gameId)) {
            response.redirect(`/game/room/${gameId}`);
        }

        response.render('game-waiting-room', { 
            gameId: gameId, 
            lobbyOwner: await gameController.firstPlayer(gameId, playerId) 
        });
    }
    catch (error) {
        console.log("game waiting-room error:", error.message);
    }
});

router.get('/room/:gameId/start', (request, response) => {
    try {
        // TODO: 
        // Redirect all players to `/game/room/${gameId}`

        const gameId = request.params.gameId;

        io.to(gameId).emit(GAME_STARTING);

        response.render('game-room', { gameId: gameId });
    }
    catch (error) {
        console.log("game room start error:",)
    }
});

router.get('/room/:gameId', async (request, response) => {
    try {
        // TODO: 
        // Check if the player is in the game If there is room, add 
        // the player. Otherwise, redirect the player back to the lobby

        const gameId = request.params.gameId;

        if (await gameController.gameFull(gameId)) {
            redirect("user/lobby");
        }

        response.render('game-room', { gameId: gameId });
    }
    catch (error) {
        console.log("game room error:", error.message);
    }
});

router.get('/room/:gameId/leave', async (request, response) => {
    console.log("SUPERDOUBLYGIGANTICMARKEREXTRAVAGANZA!!!!");
    console.log("playerId:", JSON.stringify(request.session.player.playerId));
    await playerController.removePlayer(
        request.params.gameId, 
        request.session.player.playerId
    );
    request.session.player = null;
    console.log("SUPERDOUBLYGIGANTICMARKEREXTRAVAGANZA!!!!");
    await gameController.deleteGameIfEmpty(request.params.gameId);

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
        
        response.redirect(`/game/waiting-room/${newGameInfo.game_id}`);
    }
    catch (error) {
        console.log(error.message);
        response.status(500).json({ message: error.message });
    }
});

module.exports = router;
