//todo set your .env
module.exports ={
    database:{
        host: process.env.HOST,
        port: process.env.DATA_BASE_PORT,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DATA_BASE
    },

    PORT: process.env.PORT,
};