import express from 'express';
import { db } from '../database.js';

const router = express.Router();

router.get('/channels', (req, res) => {
  const channelsArray = db.data.channelData.map((element) => ({
    name: element.name,
    private: element.private
  }));

  res.send(channelsArray);
});

router.get('/channels/:name/messages', (req, res) => {
  const channelName = req.params.name;
  const maybeChannel = db.data.channelData.find(
    (channel) => channelName === channel.name
  );

  if (maybeChannel) {
    res.send(maybeChannel.messages);
  } else {
    res.sendStatus(404);
  }
});

router.post('/channels/:name', (req, res) => {
  const channelName = req.params.name;
  const { message, userName } = req.body;

  const maybeChannel = db.data.channelData.find(
    (channel) => channelName === channel.name
  );

  if (!maybeChannel) {
    res.sendStatus(400);
    return;
  }

  const id = maybeChannel.messages.length + 1;

  const newMessage = {
    id,
    message,
    timeCreated: createTimeStamp(),
    userName
  };

  maybeChannel.messages.unshift(newMessage);
  db.write();
  res.status(200).send(maybeChannel);
});

export function createTimeStamp() {
  const now = new Date();
  const plainText = now.toDateString();
  const timeDate = `${plainText} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
  return timeDate;
}

export default router;
































