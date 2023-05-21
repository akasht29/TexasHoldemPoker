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

universalActionsWrapper = async (request, response, localActions) => {
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
        await gameController.incrementRound(gameId);
        
        if (await gameController.isGameOver(gameId)) {

            // TODO: Rediret all players in the current game to the standings page.
            response.redirect(`poker/${gameId}/standings`);
            return;
        }
        else {
            await pokerController.clearCards(gameId);
            await pokerController.dealCardsToPlayers(gameId);
            await pokerController.unfoldPlayers(gameId);
            let newDealer = await gameController.incrementDealer(gameId);
            await gameModel.setTurn(gameId, newDealer);
        }
    }
    else {
        await pokerController.nextTurn(gameId);
    }

    response.status(200).json({ message: "success" });
}

router.head('/:gameId/pass', async (request, response) => {
    try {
        await universalActionsWrapper(request, response, async () => {
            // check if pass is valid
            let canPass = true;
            if (!canPass) {
                // TODO: CHECK If the current player can pass
                response.status(400);
            }

            await pokerController.nextTurn(gameId);

            io.in(parseInt(request.params.gameId)).emit("PASS", {
                // info passed to clients goes here
                username: username
            });

            response.status(200);
        });
    }
    catch (error) {
        console.log(error.message);
        response.status(500).json({ message: error.message });
    }
});

router.head('/:gameId/allIn', async (request, response) => {
    try {
        await universalActionsWrapper(request, response, async () => {
            // all in logic here
            let playerInfo = await playerModel.getPlayerData(request.session.player.playerId);

            await pokerController.bet(
                request.params.gameId,
                request.session.player.playerId,
                playerInfo.chips
            );

            await playerModel.setToAllIn(request.session.player.playerId);

            io.in(parseInt(request.params.gameId)).emit("ALLIN", {
                // info passed to clients goes here
                username: username
            });
        });
    }
    catch (error) {
        console.log(error.message);
        response.status(500).json({ message: error.message });
    }
});

router.head('/:gameId/call', async (request, response) => {
    try {
        await universalActionsWrapper(request, response, async () => {
            let highestBet = await pokerController.getHighestBet(request.params.gameId);
            let playerInfo = await playerModel.getPlayerData(request.session.player.playerId);
            let amount = highestBet - playerInfo.curr_bet;
            
            await pokerController.bet(
                request.params.gameId,
                request.session.player.playerId,
                amount
            );

            playerInfo = await playerModel.getPlayerData(request.session.player.playerId);

            if (playerInfo.chips == 0) {
                await playerModel.setToAllIn(request.session.player.playerId);
            }

            io.in(parseInt(request.params.gameId)).emit("CALL", {
                username: username,
                chips: playerInfo.chips,
                curr_bet: playerInfo.curr_bet
            });
        });
    }
    catch (error) { 
        console.log(error.message);
        response.status(500).json({ message: error.message });
    }
});

router.head('/:gameId/fold', async (request, response) => {
    try {
        await universalActionsWrapper(request, response, async () => {
            await playerModel.setToFolded(request.session.player.playerId);

            io.in(parseInt(request.params.gameId)).emit("FOLD", {
                username: username,
                chips: playerInfo.chips,
                curr_bet: playerInfo.curr_bet
            });
        });
    }
    catch (error) {
        console.log(error.message);
        response.status(500).json({ message: error.message });
    }
});

router.post('/:gameId/raise', async (request, response) => {
    try {
        await universalActionsWrapper(request, response, async () => {
            // raise logic here
            let amount = request.body.amount;

            await pokerController.bet(
                request.params.gameId,
                request.session.player.playerId,
                amount
            );

            io.in(parseInt(request.params.gameId)).emit("RAISE", {
                username: username,
                chips: playerInfo.chips,
                curr_bet: playerInfo.curr_bet
            });
        });
    }
    catch (error) {
        console.log(error.message);
        response.status(500).json({ message: error.message });
    }
});

module.exports = router;