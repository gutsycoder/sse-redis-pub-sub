const express = require('express');
const app = express();
const redis = require('redis');
const bodyParser = require('body-parser');
const cors = require('cors');

const publisher = redis.createClient({
  host: '127.0.0.1',
  port: 6379,
});
publisher.connect();
publisher.on('connect', () => {
  console.log('Redis publisher connected');
});

publisher.on('error', (err) => {
  console.error('Redis publisher connection error:', err);
});

const subscriber = redis.createClient({
  host: '127.0.0.1',
  port: 6379,
});
subscriber.connect();
subscriber.on('connect', () => {
  console.log('Redis subscriber connected');
});


subscriber.on('error', (err) => {
  console.error('Redis subscriber connection error:', err);
});

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('public'));

// SSE endpoint
app.get('/events', (req, res) => {
    console.log("reached here");
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  subscriber.subscribe('events', (err, count) => {
    console.log(err,count);
    if (err) {
      console.error('Error subscribing to Redis channel:', err);
    } else {
      console.log(`Subscribed to Redis channel. Count: ${count}`);

      subscriber.on('message', (channel, message) => {
        res.write(`data: ${message}\n\n`);
      });

      req.on('close', () => {
        subscriber.unsubscribe('events');
      });
    }
  });
});

// Publishing endpoint
app.post('/publish', (req, res) => {
  const { message } = req.body;
  publisher.publish('events', message);
  res.status(200).send('Message Published');
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server Is Running On Port ${PORT}`);
});