const express = require('express');
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}))
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
 * 몽고 DB 관련 설정 
 */
const { MongoClient } = require('mongodb');
const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);
const dbName = 'test';

let mongoDB;

function InsertMongo(doc) {    
    let collectName = doc.RoomCode.toString();
    logger.info("doctype " + doc.type)
    if(doc.type == 'whiteBoard') {
        logger.info("in!!")
        collectName = collectName + '_WhiteBoard';
    }        
    logger.info("collentName : " + collectName)
    mongoDB.collection(collectName).insertOne(doc, function(err, res) {
            if (err) { throw err }
            else {
                logger.info("1 document inserted");
            }           
            //mdb.close();
    });   
}

app.get('/', (req, res) => {
    res.send("hello!");    
    logger.info("User In!");
})

app.post('/insert', (req, res) => {
    let doc = {
        RoomCode : req.body.RoomCode,
        sender : req.body.sender,
        text : req.body.text,
        type : req.body.type
    }
    logger.info("req=>" + JSON.stringify(req.body));
    InsertMongo(doc);
    logger.info("insert In!");
    res.send("insert!");
})

/**
 * Server start
 */
app.listen(port, () => {
    logger.info("Server Start !");   
    //ConnectMongo();
    main();
    //mongoConnection();
})

/**
 * 서버 초기 세팅 
 */
async function main() {
    // Use connect method to connect to the server
    await client.connect();
    console.log('Connected successfully to server');
    mongoDB = client.db(dbName);      
    return 'done';
}

