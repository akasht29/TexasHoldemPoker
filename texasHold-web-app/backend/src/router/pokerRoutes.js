const express = require('express');
const router  = express.Router();
const pokerController = require("../controllers/pokerController");
const gameModel   = require("../models/game/gameModel");

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
    
    if (await pokerController.isPlayerFolded(playerId)) {
        response.status(400).json({ message: "You have folded. Please wait for the next round." });
    }

    if (!(await pokerController.isPlayersTurn(gameId, playerId))) {
        response.status(400).json({ message: "Please wait for your turn." });
    }
    
    const minBet = await gameModel.getMinBet(gameId);

    if (
        (await  pokerController.isBigBlind(playerId)) &&
        ((await pokerController.getPotSize(playerId)) == 0)
    ) {
        pokerController.bet(
            gameId,
            playerId,
            minBet
        );
    }

    if (
        (await pokerController.isSmallBlind(playerId)) &&
        ((await pokerController.getPotSize(playerId)) <= minBet)
    ) {
        pokerController.bet(
            gameId,
            playerId,
            minBet / 2
        );
    }

    localActions();
    
    await pokerController.nextTurn(gameId);

    if (await pokerController.isGameOver(gameId)) {
        // display standings
        response.redirect(`poker/${gameId}/standings`);

        // TODO: Somehow, we have to rediret all players in the current game to the standings.
    }
    else if (await pokerController.isNewRound(gameId)) {
        // deal cards
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
        await universalActionsWrapper(request, response, action, () => {
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
        await universalActionsWrapper(request, response, action, () => {
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
        await universalActionsWrapper(request, response, action, () => {
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
        await universalActionsWrapper(request, response, action, () => {
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
        await universalActionsWrapper(request, response, action, () => {
            // raise logic here
        });
    }
    catch (error) {
        console.log(error.message);
        response.status(500).json({ message: error.message });
    }
});

module.exports = router;