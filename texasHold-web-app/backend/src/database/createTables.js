const { Client } = require("pg");
const config = require("../development");

class CreateTableError extends Error {
    constructor(message) {
        super(message);
        this.name = "CreateTableError";
    }
}

const createTables = () => {
    const client = new Client(config.database);

    return client
        .connect()
        .then(() => {
            return client.query(
                
                `
                CREATE TABLE IF NOT EXISTS game (
                    game_id SERIAL PRIMARY KEY,
                    game_name VARCHAR(255) NOT NULL,
                    chips INTEGER NOT NULL,
                    num_players INTEGER NOT NULL,
                    num_rounds INTEGER NOT NULL,
                    min_bet INTEGER NOT NULL,
                    curr_round INTEGER DEFAULT 0,
                    main_pot INTEGER NOT NULL DEFAULT 0,
                    curr_round_pot INTEGER NOT NULL DEFAULT 0,
                    curr_player_turn INTEGER NOT NULL DEFAULT 0
                );
                
                CREATE TABLE IF NOT EXISTS users (
                    user_id SERIAL PRIMARY KEY,
                    username VARCHAR(255) NOT NULL UNIQUE,
                    password VARCHAR(255) NOT NULL,
                    email VARCHAR(255) NOT NULL UNIQUE,
                    auth_token VARCHAR(255)
                );
                
                CREATE TABLE IF NOT EXISTS players (
                    player_id SERIAL PRIMARY KEY,
                    user_id INTEGER NOT NULL REFERENCES users(user_id),
                    game_id INTEGER REFERENCES game(game_id),
                    chips INTEGER,
                    folded BOOLEAN DEFAULT false,
                    curr_bet INTEGER,
                    hand VARCHAR(4),
                    UNIQUE (user_id, game_id)
                );
                
                CREATE TABLE IF NOT EXISTS CARDS (
                    card_id SERIAL PRIMARY KEY,
                    game_id INTEGER NOT NULL REFERENCES game(game_id),
                    community_cards VARCHAR(255),
                    deck VARCHAR(255)
                );
                `
            );
        })
        .then(() => {
            return { success: true, message: "Tables created successfully" };
        })
        .catch((error) => {
            throw new CreateTableError(`Error creating tables: ${error.message}`);
        })
        .finally(() => {
            return client.end();
        });
};

module.exports = { createTables, CreateTableError };
