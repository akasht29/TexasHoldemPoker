/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.createTable('game', {
    game_id: 'SERIAL PRIMARY KEY',
    game_name:      { type: 'VARCHAR(255)', notNull: true },
    chips:          { type: 'INTEGER', notNull: true },
    num_players:    { type: 'INTEGER', notNull: true }, // the maxiumum number of players in the game
    num_turns:      { type: 'INTEGER', notNull: true }, // the maxiumum number of rounds in the game
    min_bet:        { type: 'INTEGER', notNull: true },
    curr_turn:      { type: 'INTEGER', notNull: true, default: 0 },
    curr_round_pot: { type: 'INTEGER', notNull: true, default: 0 },
    deck:           { type: 'INTEGER[]' },
    players:        { type: 'INTEGER[]' }, // stores player id
    gameStatus:     { type: 'BOOLEAN', default: false },
    communitycards: { type: 'INTEGER[]', default: '{}' },
  });

  pgm.createTable('users', {
    user_id: 'SERIAL PRIMARY KEY',
    username: { type: 'VARCHAR(255)', notNull: true, unique: true },
    password: { type: 'VARCHAR(255)', notNull: true },
    email: { type: 'VARCHAR(255)', notNull: true, unique: true },
  });

  pgm.createTable('players', {
    player_id: 'SERIAL PRIMARY KEY',
    user_id: {
      type: 'INTEGER',
      notNull: true,
      unique: true,
      references: 'users(user_id)'
    },
    game_id: {
      type: 'INTEGER',
      notNull: true,
      references: 'game(game_id)'
    },
    chips: { type: 'INTEGER' },
    folded: { type: 'BOOLEAN', default: false },
    curr_bet: { type: 'INTEGER' },
    hand: { type: 'INTEGER[]' }

  });
};

exports.down = pgm => {
  pgm.dropTable('players');
  pgm.dropTable('users');
  pgm.dropTable('game');
};
