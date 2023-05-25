const express          = require('express');
const router           = express.Router();
const pokerController  = require("../controllers/pokerController");
const gameModel        = require("../models/gameModel");
const playerModel      = require('../models/playerModel');

// returns the players current hand as a json object to the client
router.get('/:gameId/getHand', async (request, response) => {
    const gameId     = request.params.gameId;
    const playerId   = request.session.player.playerId;
    const playerInfo = await playerModel.getPlayerData(playerId);
    
    response.status(200).json({ hand: playerInfo.hand })
});

router.head('/:gameId/allIn', async (request, response) => {
    try {
        const gameId   = request.params.gameId;
        const playerId = request.session.player.playerId;
        const io       = request.app.get("io");

        if (await pokerController.isPlayerDead(gameId, playerId)) {
            response.status(400).send("player is dead");
            return;
        }
        else {
            console.log('bye');
        }

        if (!(await pokerController.canPlayerMove(playerId))) {
            response.status(400).send("player cant move");
            return;
        }

        await pokerController.handleBlindBets(gameId, playerId);

        // all in logic here
        {
            const playerInfo = await playerModel.getPlayerData(playerId);
            await pokerController.bet(
                gameId,
                playerId,
                playerInfo.chips
            );
        }

        await pokerController.endOfRoundNonsense(gameId, io);

        response.status(200).send("player moved");
    }
    catch (error) { 
        response.status(500).send("server error");
    }
});

router.head('/:gameId/call', async (request, response) => {
    try {
        const gameId   = request.params.gameId;
        const playerId = request.session.player.playerId;
        const io       = request.app.get("io");

        if (await pokerController.isPlayerDead(gameId, playerId)) {
            response.status(400).send("player is dead");
            return 1;
        }

        if (!(await pokerController.canPlayerMove(playerId))) {
            response.status(400).send("player cant move");
            return;
        }

        await pokerController.handleBlindBets(gameId, playerId);

        // call logic here
        {
            const playerInfo = await playerModel.getPlayerData(playerId);
            const highestBet = await pokerController.getHighestBet(gameId);
            const amount     = Math.min(playerInfo.curr_bet, highestBet);


            await pokerController.bet(
                gameId,
                playerId,
                amount
            );

            await playerModel.setToCalled(playerId);
        }

        await pokerController.endOfRoundNonsense(gameId, io);

        response.status(200).send("player moved");
    }
    catch (error) { 
        console.log(error.message);
        response.status(500).send("server error");
    }
});

router.head('/:gameId/fold', async (request, response) => {
    try {
        const gameId   = request.params.gameId;
        const playerId = request.session.player.playerId;
        const io       = request.app.get("io");

        if (await pokerController.isPlayerDead(gameId, playerId)) {
            response.status(400).send("player is dead");
            return;
        }

        if (!(await pokerController.canPlayerMove(playerId))) {
            response.status(400).send("player cant move");
            return;
        }

        await pokerController.handleBlindBets(gameId, playerId);

        // fold logic here
        {
            await playerModel.setToFolded(playerId);
        }

        if (await pokerController.endOfRoundNonsense(gameId, io) == 1) {
            // response.redirect(`${process.env.API_BASE_URL}/game/over`);
        }

        response.status(200).send("player moved");
    }
    catch (error) { 
        response.status(500).send("server error");
    }
});

router.post('/:gameId/raise', async (request, response) => {
    try {
        const gameId   = request.params.gameId;
        const playerId = request.session.player.playerId;
        const io       = request.app.get("io");

        if (await pokerController.isPlayerDead(gameId, playerId)) {
            response.status(400).send("player is dead");
            return;
        }

        if (!(await pokerController.canPlayerMove(playerId))) {
            response.status(400).send("player cant move");
            return;
        }

        await pokerController.handleBlindBets(gameId, playerId);

        // raise logic here
        {
            const amount = (await gameModel.getGameData(gameId)).min_bet;
           
            await pokerController.bet(
                gameId,
                playerId,
                amount
            );

            await playerModel.setToOther(playerId);
        }

        await pokerController.endOfRoundNonsense(gameId, io);

        response.status(200).send("player moved");
    }
    catch (error) { 
        response.status(500).send("server error");
    }
});

module.exports = router;