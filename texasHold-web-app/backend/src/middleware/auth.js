const userModel = require('../models/users/userModel');
const jwt = require('jsonwebtoken');

async function authMiddleware(req, res, next) {
  // Get the token from the Authorization header
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get the stored token from the database
    const storedToken = await userModel.getAuthTokenByUserId(decoded.sub);

    // Compare the token from the header with the stored token
    if (token !== storedToken) {
    
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = decoded;

    // Set res.local.user
    const user = await userModel.getUserById(decoded.sub);
    if(user){
      res.locals.user = user;
    }

    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
}

async function redirectToLobbyIfAuthenticated(req, res, next) {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    if (token) {
      try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get the stored token from the database
        const storedToken = await userModel.getAuthTokenByUserId(decoded.sub);

        // Compare the token from the header with the stored token
        if (token === storedToken) {
          return res.redirect('/lobby');
        }
      } catch (error) {
        console.error('Invalid token:', error);
      }
    }
  }

  next();
}


module.exports ={
  authMiddleware,redirectToLobbyIfAuthenticated
} ;
