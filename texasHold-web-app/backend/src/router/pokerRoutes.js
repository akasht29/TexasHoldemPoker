const express          = require('express');
const router           = express.Router();
const pokerController  = require("../controllers/pokerController");
const playerController = require("../controllers/playerController");
const gameModel        = require("../models/gameModel");
const playerModel      = require('../models/playerModel');
const gameController = require('../controllers/gameController');

// returns the players current hand as a json object to the client
router.get('/:gameId/getHandCards', async (_request, _response) => {
    // console.log(request.session);
});

router.get('/:gameId/getCommunityCards', async (_request, _response) => {
    //
});

universalActionsWrapper = async (request, response, action, localActions) => {
    const io       = request.app.get("io");
    const username = request.session.user.username;
    const gameId   = request.params.gameId;
    const playerId = request.session.player.playerId;
    
    if (await playerController.isPlayerFolded(playerId)) {
        response.status(400).json({ message: "You have folded. Please wait for the next round." });
        return;
    }

    if (!(await playerController.isPlayersTurn(playerId))) {
        response.status(400).json({ message: "Please wait for your turn." });
        return;
    }
    
    const minBet = await gameModel.getMinBet(gameId);
    
    if (
        (await  playerController.isBigBlind(playerId)) &&
        ((await pokerController.getPotSize(playerId)) == 0)
    ) {
        pokerController.bet(
            gameId,
            playerId,
            minBet
        );
    }
    
    if (
        (await playerController.isSmallBlind(playerId)) &&
        ((await pokerController.getPotSize(playerId)) <= minBet)
    ) {
        pokerController.bet(
            gameId,
            playerId,
            minBet / 2
        );
    }

    await localActions();
    
    if (await pokerController.roundOver(gameId)) {
        console.log('round over! round over! round over! round over! ')
        await gameController.incrementRound(gameId);
        
        if (await gameController.isGameOver(gameId)) {
            console.log("game over! game over! game over! game over! game over!");

            // TODO: Rediret all players in the current game to the standings page.
            response.redirect(`poker/${gameId}/standings`);
            return;
        }

        await pokerController.clearCards(gameId);
        await pokerController.dealCardsToPlayers(gameId);
        await pokerController.unfoldPlayers(gameId);
        let newDealer = await gameController.incrementDealer(gameId);
        await gameModel.setTurn(gameId, newDealer);
    }
    else {
        await pokerController.nextTurn(gameId);
    }
    
    const gameInfo = await gameModel.getGameData(gameId);
    io.in(parseInt(request.params.gameId)).emit("GAME_UPDATE", {
        // info passed to clients goes here
        username,
        action,
        gameInfo,
    });

    response.status(200).json({ message: "success" });
}

router.head('/:gameId/pass', async (request, response) => {
    try {
        const action = "PASS";
        await universalActionsWrapper(request, response, action, async () => {
            // pass logic here
        });
    }
    catch (error) {
        console.log(error.message);
        response.status(500).json({ message: error.message });
    }
});

router.head('/:gameId/allIn', async (request, response) => {
    try {
        const action = "ALLIN";
        await universalActionsWrapper(request, response, action, async () => {
            // all in logic here
        });
    }
    catch (error) {
        console.log(error.message);
        response.status(500).json({ message: error.message });
    }
});

router.head('/:gameId/call', async (request, response) => {
    try {
        const action = "CALL";
        await universalActionsWrapper(request, response, action, async () => {
            // call logic here
        });
    }
    catch (error) { 
        console.log(error.message);
        response.status(500).json({ message: error.message });
    }
});

router.head('/:gameId/fold', async (request, response) => {
    try {
        const action = "FOLD";
        await universalActionsWrapper(request, response, action, async () => {
            // fold logic here
        });
    }
    catch (error) {
        console.log(error.message);
        response.status(500).json({ message: error.message });
    }
});

router.post('/:gameId/raise', async (request, response) => {
    try {
        const action = "RAISE";
        await universalActionsWrapper(request, response, action, async () => {
            // raise logic here
        });
    }
    catch (error) {
        console.log(error.message);
        response.status(500).json({ message: error.message });
    }
});

module.exports = router;