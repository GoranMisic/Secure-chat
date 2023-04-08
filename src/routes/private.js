import dotenv from 'dotenv';
import express from 'express';
import jwt from 'jsonwebtoken';

import { db } from '../database.js';
import { validateNewChannel } from '../validate.js';
import { createTimeStamp } from './public.js';

dotenv.config();

const router = express.Router();

router.get('/', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.sendStatus(401);
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET);
    res.status(200).send({ userName: decoded.userName });
  } catch (err) {
    console.error(err);
    res.sendStatus(401);
  }
});

router.delete('/:id', async (req, res) => {
  const { name: channelName, user } = req.body;
  const id = Number(req.params.id);

  const maybeChannel = db.data.channelData.find(
    (channel) => channelName === channel.name
  );

  if (!maybeChannel) {
    return res.status(400).send('No channel found');
  }

  const maybeMessage = maybeChannel.messages;

  if (!maybeMessage) {
    return res.status(400).send('No message found');
  }

  const messageIndex = maybeMessage.findIndex((message) => id === message.id);

  if (messageIndex === -1) {
    return res.status(400).send('message with requested ID does not exist!');
  }

  if (maybeMessage[messageIndex].userName !== user) {
    return res.sendStatus(401);
  }

  maybeMessage[messageIndex] = { deleted: true };

  db.write();

  res.status(200).send(maybeChannel);
});

router.put('/:id', (req, res) => {
  const { name: channelName, user, message: newMessage } = req.body;
  const id = Number(req.params.id);

  const maybeChannel = db.data.channelData.find(
    (channel) => channelName === channel.name
  );

  if (!maybeChannel) {
    return res.status(400).send('Cannot find channel');
  }

  const maybeMessage = maybeChannel.messages;

  if (!maybeMessage) {
    return res.status(400).send('Cannot find message');
  }

  const messageIndex = maybeMessage.findIndex((message) => id === message.id);

  if (messageIndex === -1) {
    return res.status(400).send('message with requested ID does not exist!');
  }

  const thisMessage = maybeMessage[messageIndex];

  if (thisMessage.userName !== user) {
    return res.sendStatus(401);
  }

  thisMessage.timeEdited = createTimeStamp();
  thisMessage.message = newMessage;

  db.write();

  res.sendStatus(200);
});

router.post('/', (req, res) => {
  const { name, private: status } = req.body;

  const channelValidated = validateNewChannel(name);

  if (!channelValidated) {
    return res.sendStatus(400);
  }

  const newChannel = {
    name,
    messages: [],
    private: status,
  };

  db.data.channelData.unshift(newChannel);
  db.write();

  res.status(200).send(newChannel);
});

export default router;