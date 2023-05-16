
const db = require("../../database/connection");
const playerModel = {};
const pgarray = require('pg-array');


playerModel.createPlayer = async (user_id, game_id) => {
    const chips = await playerModel.getChips(game_id);


    const insertStr = "INSERT INTO players (user_id, game_id, chips) ";
    const valuesStr = "VALUES ($1, $2, $3) RETURNING player_id";
    const query = insertStr + valuesStr;
    const values = [user_id, game_id, chips];

    const playerInfo = await db.one(query, values);

    return playerInfo.player_id;
};

playerModel.getChips = async (game_id) => {
    const value = parseInt(game_id, 10);
    if (isNaN(value)) {
        throw new Error("Invalid game ID. Please provide a valid integer.");
    }

    const query = "SELECT chips FROM game WHERE game_id = $1";
    const result = await db.one(query, [value]);
    return result.chips;
};



playerModel.addPlayer = async (game_id) => {
    const playerArr = []
    let query = "SELECT player_id FROM players WHERE game_id = $1"
    let result = await db.many(query, [game_id])
    for(let i = 0; i < result.length ; i++){
        playerArr.push(result[i].player_id);

    }

    console.log(playerArr);
    
    query = "UPDATE game SET players = $1 WHERE game_id = $2";
    const values = [pgarray(playerArr), game_id];
    await db.none(query, values);

    // await playerModel.changeStatus(2)
    // await playerModel.getAllPlayers(1);


    

};

playerModel.removePlayer = async (playerId) => {
    const query = "DELETE FROM players WHERE player_id = $1";
    await db.none(
        query,
        [ playerId ]
    );
}

playerModel.changeStatus = async (player_id) => {
  
    query = "UPDATE players SET folded = True WHERE player_id = $1";
    const values = [player_id];
    await db.none(query, values);


};

playerModel.getAllPlayers = async (game_id) => {
    query = "SELECT players FROM game WHERE game_id = $1";
    const values = [game_id];
    await db.one(query, values);

};



playerModel.updateDeck = async(game_id, deck) => {
    let query = "Update game SET deck = $1 WHERE game_id = $2"
    let values = [pgarray(deck), game_id];
    await db.none(query, values);
}


playerModel.addCards = async(game_id, player_id) => {
    let deck = await playerModel.getDeck(game_id);
    let playerHand = deck.splice(0,2);
    console.log(deck);
    let query = "Update players SET hand = $1 WHERE player_id = $2"
    let values = [playerHand, player_id];

    await db.none(query, values);

    await playerModel.updateDeck(game_id, deck);
   
}

playerModel.getDeck = async(game_id) => {
    query = "SELECT deck FROM game WHERE game_id = $1";
    result = await db.one(query, [game_id] );

    console.log(result.deck);
    return result.deck;
    

}



module.exports = playerModel;
