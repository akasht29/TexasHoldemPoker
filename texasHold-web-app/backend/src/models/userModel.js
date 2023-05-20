const db     = require("../database/connection");
const bcrypt = require("bcrypt");

const userModel = {};

userModel.createUser = async (username, email, password) => {
    return await db.one(
        "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *",
        [username, email, password]
    );
};

userModel.getUserNameById = async (user_id) => {
    const value = parseInt(user_id, 10);
    const query = `SELECT username FROM users WHERE user_id = ${user_id}`; 
    const result = await db.one(query, [value]);
    console.log("backend = " + result.username);
    return result.username;
};

userModel.getUserById = (user_id) => {
    return new Promise((resolve, reject) => {
        const query = `SELECT user_id, username, email FROM users WHERE user_id = $1`;
        const values = [user_id];

        db.query(query, values)
            .then((result) => {
                if (result.rowCount > 0) {
                    resolve(result.rows[0]);
                }
            })
            .catch((err) => {
                reject(err);
            });
    });
};

userModel.getUserByUsername = (username) => {
    const query = `SELECT user_id, username, password, email FROM users WHERE username = $1`;
    const values = [username];
    db.one(
        query,
        values
    )
    .then((user) => {
        console.log("user:", user);
        return user;
    })

    return null;
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

userModel.comparePassword = (password, hashedPassword) => {
    return bcrypt.compare(password, hashedPassword);
};

userModel.login = async (username, password) => {
    try {
        const user = await userModel.getUserByUsername(username);
        if (user) {
            const passwordMatch = await userModel.comparePassword(password, user.password);
            if (passwordMatch) {
                delete user.password;

                const token = jwt.sign({ sub: user.user_id }, process.env.JWT_SECRET, { expiresIn: "1h" });

                await userModel.storeAuthToken(user.user_id, token);

                user.auth_token = token;

                return user;
            } else {
                throw new CustomError("Incorrect password", 401);
            }
        } else {
            throw new CustomError("User not found", 404);
        }
    } catch (err) {
        throw err;
    }
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

userModel.storeAuthToken = (user_id, auth_token) => {
    return new Promise((resolve, reject) => {
        const query = `UPDATE users SET auth_token = $1 WHERE user_id = $2`;
        const values = [auth_token, user_id];

        db.query(query, values)
            .then((result) => {
                if (result.rowCount > 0) {
                    resolve();
                } else {
                    reject(new CustomError("No rows affected", 404));
                }
            })
            .catch((err) => {
                reject(err);
            });
    });
};

userModel.clearAuthToken = (user_id) => {
    return new Promise((resolve, reject) => {
        const query = `UPDATE users SET auth_token = null WHERE user_id = $1`;
        const values = [user_id];

        db.query(query, values)
            .then((result) => {
                if (result.rowCount > 0) {
                    resolve();
                } else {
                    reject(new CustomError("No rows affected", 404));
                }
            })
            .catch((err) => {
                reject(err);
            });
    });
};


userModel.getAuthTokenByUserId = (user_id) => {
    return new Promise((resolve, reject) => {
        const query = `SELECT auth_token FROM users WHERE user_id = $1`;
        const values = [user_id];

        db.query(query, values)
            .then((result) => {
                if (result.rows.length > 0) {
                    resolve(result.rows[0].auth_token);
                } else {
                    reject(new CustomError("User not found", 404));
                }
            })
            .catch((err) => {
                reject(err);
            });
    });
};

module.exports = userModel;
