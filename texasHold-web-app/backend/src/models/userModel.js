const db     = require("../database/connection");
const bcrypt = require("bcrypt");

const userModel = {};

userModel.createUser = async (username, email, password) => {
    return await db.one(
        "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *",
        [username, email, password]
    );
};




userModel.getUserByUsername = async (username) => {
    const query = `SELECT user_id, username, password, email FROM users WHERE username = $1`;
    const values = [username];
    let user = await db.one(
        query,
        values
    )
    return user;
};

userModel.getUserByEmail = async (email) => {
    const query = `SELECT user_id, username, password, email FROM users WHERE email = $1`;
    const values = [email];

    let user = await db.one(
        query,
        values
    )

    return user;
};

userModel.generateHashedPassword = async (password) => {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        console.log("hashed password:", hashedPassword);
        return hashedPassword;
      } catch (error) {
        console.error(error);
        throw error; 
      }

}
userModel.comparePassword = async (password, hashedPassword) => {
    
    const result = await bcrypt.compare(password, hashedPassword);
    console.log(result);
    return result;

};



userModel.logout = (req) => {
    // Clear session data
    req.session.destroy((err) => {
        if (err) {
            throw err;
        }
    });
};

userModel.getCurrentUser = async (req) => {
    try {
        // Get user ID from session data
        const userId = req.session.userId;
        if (userId) {
            // Get user by ID
            const user = await userModel.getUserById(userId);
            return user;
        } else {
            throw new CustomError("User not authenticated", 401);
        }
    } catch (err) {
        throw err;
    }
};







module.exports = userModel;
