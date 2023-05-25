const db = require("../database/connection");
const gameModel = require("./gameModel");
const playerModel = {};
const pgarray = require("pg-array");

playerModel.createPlayer = async (user_id, game_id) => {
  const chips = await playerModel.getChips(game_id);

  const insertStr = "INSERT INTO players (user_id, game_id, chips) ";
  const valuesStr = "VALUES ($1, $2, $3) RETURNING player_id";
  const query = insertStr + valuesStr;
  const values = [user_id, game_id, chips];

  try {
    const playerInfo = await db.one(query, values);
    return playerInfo.player_id;
  } catch (error) {
    throw error;
  }
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

playerModel.getHand = async (playerId) => {
  const query = "SELECT hand FROM players WHERE player_id = $1";
  const result = await db.one(query, [playerId]);

  return result.hand;
};

playerModel.setHand = async (playerId, newHand) => {
  const query = "UPDATE players SET hand = $2 WHERE player_id = $1";

  await db.none(query, [playerId, newHand]);
};

playerModel.addPlayer = async (game_id) => {
  let playerArr = [];
  let query = "SELECT player_id FROM players WHERE game_id = $1";
  let result = await db.many(query, [game_id]);

  for (let i = 0; i < result.length; i++) {
    playerArr.push(result[i].player_id);
  }

  query = "UPDATE game SET players = $1 WHERE game_id = $2";
  const values = [pgarray(playerArr), game_id];
  await db.none(query, values);
};

playerModel.removePlayer = async (playerId) => {
  const query = "DELETE FROM players WHERE player_id = $1";

  await db.none(query, [playerId]);
};

playerModel.setToFolded = async (playerId) => {
  const query = "UPDATE players SET status = $1 WHERE player_id = $2";
  const values = [0, playerId];

  await db.none(query, values);
};

playerModel.setToCalled = async (playerId) => {
  const query = "UPDATE players SET status = $2 WHERE player_id = $1";

  await db.none(query, [playerId, 1]);
};

playerModel.setToAllIn = async (playerId) => {
  const query = "UPDATE players SET status = $2 WHERE player_id = $1";

  await db.none(query, [playerId, 2]);
};

playerModel.setToOther = async (playerId) => {
  const query = "UPDATE players SET status = $2 WHERE player_id = $1";

  await db.none(query, [playerId, 3]);
};

playerModel.getAllPlayers = async (gameId) => {
  const query = "SELECT * FROM players WHERE game_id = $1";

  return await db.any(query, [gameId]);
};

playerModel.getPlayerData = async (playerId) => {
  const query = "SELECT * FROM players WHERE player_id = $1";

  return await db.one(query, [playerId]);
};

playerModel.getPlayerbyUserIdInGame = async (user_id, gameId) => {
  const query =
    "SELECT player_id FROM players WHERE user_id = $1 AND game_id = $2";

  const result = await db.one(query, [user_id, gameId]);
  return result;
};

playerModel.setChipsAndBet = async (playerId, chips, bet) => {
  const query =
    "UPDATE players SET chips = $1, curr_bet = $2 WHERE player_id = $3";

  return await db.none(query, [chips, bet, playerId]);
};

playerModel.getPlayerByUserId = async (userId) => {
  const query = "SELECT player_id FROM players WHERE user_id = $1";

  return await db.one(query, [userId]);
};

playerModel.getGameIdByUserId = async (userId) => {
  const query = "SELECT game_id FROM players WHERE user_id = $1";

  return await db.one(query, [userId]);
};

module.exports = playerModel;
