const gameModel   = require("../models/game/gameModel");
const tableModel  = require("../models/table/tableModel");
const playerModel = require("../models/players/playerModel");
const gameController = {};

gameController.createGame = async (gameName, numPlayers, numRounds, minBet) => {
    let chips = 10;
    return await gameModel.createGame(
        gameName, 
        chips,
        numPlayers, 
        numRounds, 
        minBet
    );
};

gameController.getAllGames = async () => {
    return await gameModel.getAllGames();
};


gameController.joinGame = async (req, res) => {
    const result = {};

    const { gameId } = req.params;
    const { userId} = req.body;

    try {
        // Create a new player
        const player = await playerModel.createPlayer(userId, gameId);

        // Retrieve the current game data
        //const currentGameData = await gameModel.getGameData(gameId);

        // Update the game data with the new player
        //const updatedGameData = currentGameData.joinGame(player);

        // Save the updated game data
        //await gameModel.updateGame(gameId, updatedGameData);

        result.status = "success";
        result.message = "Player joined the game successfully.";
        result.player = player;
        res.status(200).json(result);
        res.j
    } catch (err) {
        result.error = err.message;
        res.status(500).json(result);
    }
};

gameController.leaveGame = async (req, res) => {
    const result = {};

    const { gameId, userId } = req.params;

    try {
        // Remove the player from the game
        const player = await playerModel.leaveGame(userId, gameId);

        // Retrieve the current game data
        const currentGameData = await gameModel.getGameData(gameId);

        // Update the game data with the player removed
        const updatedGameData = currentGameData.leaveGame(player);

        // Save the updated game data
        await gameModel.updateGame(gameId, updatedGameData);

        result.status = "success";
        result.message = "Player left the game successfully.";
        result.player = player;
        res.status(200).json(result);
    } catch (err) {
        result.error = err.message;
        res.status(500).json(result);
    }
};


module.exports = gameController;
