const express = require('express');
const app = express();
const port = 3000;

/**
 * log 관련
 */
const morgan = require('morgan');
const logger = require("./logconfig");

/**
 * CORS 관련 설정
 */
app.all('/*', function(req, res, next) {	
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	next();
});

/**
 * mongoDB Setting
 */
const mongoose = require('mongoose');
let mongo = require('mongodb').MongoClient;
const mongodbConfig ='mongodb://maeng:1234@localhost:27017/test?authSource=admin';
const ChatMessage = require('./schema/ChatMessage.js');
const mongoConnection = require('./schema/dbConnection');
let mongoDB;

// function ConnectMongo() {
//     logger.info("MongoDB Connection start !", mongo);   
//  mongoose.connect("mongodb://maeng:1234@localhost:27017/test?authSource=admin")
//   .then(() => {
//     console.log("Connected to MongoDB => test");
//   })
//   .catch((err) => {
//     console.log(err);
//   });
// }

// mongoose.connection.on('error', (error) => {
//     logger.error('몽고디비 연결 에러', error);
//   });
  
//   mongoose.connection.on('disconnected', () => {
//     logger.error('몽고디비 연결이 끊겼습니다. 연결을 재시도 합니다');
//     connect();
//   });

function InsertMongo() {
    logger.info("Mongo DB :", mongoDB);
    let databaseInfo = mongoDB.db('test');
    doc = {"RoomCode":"111", "u_domain":"222", "PORT": "333"};
    databaseInfo.collection("study").insertOne(doc, function(err, res) {
            if (err) throw err;
           logger.info("1 document inserted");
            //mdb.close();
    });
}

app.get('/', (req, res) => {
    res.send("hello!");
    logger.info("User In!");
})

/**
 * Server start
 */
app.listen(port, () => {
    logger.info("Server Start !");   
    mongoConnection();
})


