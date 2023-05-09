const db = require("../../database/db");
const { CustomError } = require("../../middleware/customErrorHandler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userModel = {};

userModel.createUser = (username, password, email) => {
  return new Promise(async (resolve, reject) => {
      try {
          const existingUser = await userModel.getUserByUsername(username);
          const existingEmail = await userModel.getUserByEmail(email);
          if (existingUser) {
              reject(new CustomError("Username already exists", 409));
          }
          if (existingEmail) {
              reject(new CustomError("Email already exists", 409));
          } else {
              const hashedPassword = await bcrypt.hash(password, 10);
              const query = `INSERT INTO users (username, password, email) VALUES ($1, $2, $3) RETURNING *`;
              const values = [username, hashedPassword, email];

              db.query(query, values)
                  .then(async (result) => {
                      if (result.rowCount > 0) {
                          const user = result.rows[0];

                          // Generate token for the new user
                          const token = jwt.sign({ sub: user.user_id }, process.env.JWT_SECRET, { expiresIn: "1h" });

                          // Store the token in the database
                          await userModel.storeAuthToken(user.user_id, token); // Add await here

                          // Add the token to the user object
                          user.auth_token = token;

                          resolve(user); // Resolve after storing the token
                      } else {
                          reject(new CustomError("No rows affected", 404));
                      }
                  })
                  .catch((err) => {
                      reject(err);
                  });
          }
      } catch (err) {
          reject(err);
      }
  });
};



userModel.getUserById = (user_id) => {
    return new Promise((resolve, reject) => {
        const query = `SELECT user_id, username, email FROM users WHERE user_id = $1`;
        const values = [user_id];

        db.query(query, values)
            .then((result) => {
                if (result.rowCount > 0) {
                    resolve(result.rows[0]);
                } else {
                    reject(new CustomError("User not found", 404));
                }
            })
            .catch((err) => {
                reject(err);
            });
    });
};

userModel.getUserByUsername = (username) => {
    return new Promise((resolve, reject) => {
        const query = `SELECT user_id, username, password, email FROM users WHERE username = $1`;
        const values = [username];

        db.query(query, values)
            .then((result) => {
                if (result.rowCount > 0) {
                    resolve(result.rows[0]);
                } else {
                    resolve(null);
                }
            })
            .catch((err) => {
                reject(err);
            });
    });
};

userModel.getUserByEmail = (username) => {
    return new Promise((resolve, reject) => {
        const query = `SELECT user_id, username, password, email FROM users WHERE email = $1`;
        const values = [username];

        db.query(query, values)
            .then((result) => {
                if (result.rowCount > 0) {
                    resolve(result.rows[0]);
                } else {
                    resolve(null);
                }
            })
            .catch((err) => {
                reject(err);
            });
    });
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
