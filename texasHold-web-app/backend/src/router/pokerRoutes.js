const express          = require('express');
const router           = express.Router();
const pokerController  = require("../controllers/pokerController");
const playerController = require("../controllers/playerController");
const gameModel        = require("../models/gameModel");
const playerModel      = require('../models/playerModel');
const gameController   = require('../controllers/gameController');

// returns the players current hand as a json object to the client
router.get('/:gameId/getHandCards', async (_request, _response) => {
    // console.log(request.session);
});

router.get('/:gameId/getCommunityCards', async (_request, _response) => {
    //
});


router.head('/:gameId/allIn', async (request, response) => {
    try {
        const gameId   = request.params.gameId;
        const playerId = request.session.player.playerId;
        const io       = request.app.get("io");
        const username = request.session.user.username;

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
        
        await pokerController.nextTurn(gameId);

        if (await pokerController.endOfRoundNonsense(gameId, io) == 1) {
            console.log('game over');
            // response.redirect(`${process.env.API_BASE_URL}/game/over`);
        }

        response.status(200).send("player moved");
    }
    catch (error) { 
        console.log(error.message);
        response.status(500).send("server error");
    }
});

router.head('/:gameId/call', async (request, response) => {
    try {
        const gameId   = request.params.gameId;
        const playerId = request.session.player.playerId;
        const io       = request.app.get("io");
        const username = request.session.user.username;

        if (!(await pokerController.canPlayerMove(playerId))) {
            response.status(400).send("player cant move");
            return;
        }

        await pokerController.handleBlindBets(gameId, playerId);

        // call logic here
        {
            const playerInfo = await playerModel.getPlayerData(playerId);
            const gameInfo   = await gameModel.getGameData(gameId);
            const highestBet = await pokerController.getHighestBet(gameId);
            const amount     = highestBet - playerInfo.curr_bet;

            await pokerController.bet(
                gameId,
                playerId,
                amount
            );
        }

        await pokerController.nextTurn(gameId);

        if (await pokerController.endOfRoundNonsense(gameId, io) == 1) {
            console.log('game over');
            // response.redirect(`${process.env.API_BASE_URL}/game/over`);
        }

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
        const username = request.session.user.username;

        if (!(await pokerController.canPlayerMove(playerId))) {
            response.status(400).send("player cant move");
            return;
        }

        await pokerController.handleBlindBets(gameId, playerId);

        // fold logic here
        {
            await playerModel.setToFolded(playerId);
        }
        
        await pokerController.nextTurn(gameId);

        if (await pokerController.endOfRoundNonsense(gameId, io) == 1) {
            console.log('game over');
            // response.redirect(`${process.env.API_BASE_URL}/game/over`);
        }

        response.status(200).send("player moved");
    }
    catch (error) { 
        console.log(error.message);
        response.status(500).send("server error");
    }
});

router.post('/:gameId/raise', async (request, response) => {
    try {
        const gameId   = request.params.gameId;
        const playerId = request.session.player.playerId;
        const io       = request.app.get("io");
        const username = request.session.user.username;

        if (!(await pokerController.canPlayerMove(playerId))) {
            response.status(400).send("player cant move");
            return;
        }

        await pokerController.handleBlindBets(gameId, playerId);

        // call logic here
        {
            const amount = (await gameModel.getGameData(gameId)).min_bet;
           
            await pokerController.bet(
                gameId,
                playerId,
                amount
            );
        }

        await pokerController.nextTurn(gameId);

        if (await pokerController.endOfRoundNonsense(gameId, io) == 1) {
            console.log('game over');
            // response.redirect(`${process.env.API_BASE_URL}/game/over`);
        }

        response.status(200).send("player moved");
    }
    catch (error) { 
        console.log(error.message);
        response.status(500).send("server error");
    }
});

module.exports = router;