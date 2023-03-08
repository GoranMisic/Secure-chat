import { db } from './database.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';


function isStringEmpty(str) {
    return str.trim() === '';
}

function UserNameAvailable(userName) {
    return db.data.userData.some(user => user.userName === userName);
}

function ChannelNameAvailable(name) {
    return !db.data.channelData.some(channel => channel.name === name);
}

export function validateSignUp(userName, password) {
    return !isStringEmpty(userName) && !isStringEmpty(password) && !UserNameAvailable(userName);
}

export function validateNewChannel(name) {
    return !isStringEmpty(name) && ChannelNameAvailable(name);
}



export function authenticateUser(username, password) {
  const user = db.data.userData.find((user) => user.username === username);

  if (!user) {
    return false;
  }

  return bcrypt.compareSync(password, user.password);
}

export function createToken(username) {
  const user = { username };
  const token = jwt.sign(user, process.env.SECRET, { expiresIn: '1h' });
  user.token = token;

  return user;
}

export function checkAuth(req, res, next) {
  let token = req.body.token || req.query.token;

  if (!token) {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) {
      res.sendStatus(401);
      return;
    }

    token = authorizationHeader.substring(7);
  }

  try {
    jwt.verify(token, process.env.SECRET);
    next();
  } catch (error) {
    console.log('Invalid token!');
    res.sendStatus(401);
  }
}

