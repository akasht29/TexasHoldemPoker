const pgp        = require("pg-promise")();
const connection = pgp(process.env.DB_URL);

module.exports = connection;