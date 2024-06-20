const express = require('express');
const app = express();
const redis = require('redis');
const bodyParser = require('body-parser');
const redisClient = redis.createClient();

app.use(bodyParser.json())
app.use(express.static('public'));


app.get('/events',(req,res)=>{
    res.setHeader('Content-Type','text/event-stream');
    res.setHeader('Cache-Control','no-cache');
    res.setHeader('Connection','keep-alive');

    redisClient.subscribe('events');
    redisClient.on('message',(channel,message)=>{
        res.write(`data: ${message}\n\n`);
    });
    req.on('close',()=>{
        redisClient.unsubscribe('events');
        redisClient.quit();
    })

});



const PORT= 3000;
app.listen(PORT,()=>{
    console.log(`Server Is Running On Port ${PORT}`);
});
