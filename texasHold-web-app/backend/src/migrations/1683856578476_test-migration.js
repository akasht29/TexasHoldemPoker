/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.createTable('game', {
    game_id: 'SERIAL PRIMARY KEY',
    game_name:      { type: 'VARCHAR(255)', notNull: true },
    chips:          { type: 'INTEGER', notNull: true, default: 1000 },
    num_players:    { type: 'INTEGER', notNull: true, default: 3 }, // the maxiumum number of players in the game
    num_rounds:     { type: 'INTEGER', notNull: true, default: 5 }, // the maxiumum number of rounds in the game
    min_bet:        { type: 'INTEGER', notNull: true, default: 0 },
    curr_turn:      { type: 'INTEGER', notNull: true, default: 0 },
    curr_dealer:    { type: 'INTEGER', notNull: true, default: 0 },
    curr_round:     { type: 'INTEGER', notNull: true, default: 0 },
    curr_round_pot: { type: 'INTEGER', notNull: true, default: 0 },
    deck:           { type: 'INTEGER[]' },
    players:        { type: 'INTEGER[]' }, // stores player id
    communitycards: { type: 'INTEGER[]', default: '{}' },
  });

  pgm.createTable('users', {
    user_id: 'SERIAL PRIMARY KEY',
    username: { type: 'VARCHAR(255)', notNull: true, unique: true },
    password: { type: 'VARCHAR(255)', notNull: true },
    email: { type: 'VARCHAR(255)',    notNull: true, unique: true },
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
    chips:    { type: 'INTEGER', notNull: true, default: 1000 },
    status:   { type: 'INTEGER', notNull: true, default: 3 }, // 0 == folded, 1 == called, 2 == all in, 3 == other
    curr_bet: { type: 'INTEGER', notNull: true, default: 0 },
    hand: { type: 'INTEGER[]' }

  });
};

exports.down = pgm => {
  pgm.dropTable('players');
  pgm.dropTable('users');
  pgm.dropTable('game');
};
