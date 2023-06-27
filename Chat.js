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
const chatValidation = require('./validation/ChatMessage');
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
    console.log("InsertMongo doc =>", doc);
    let collectName = doc.roomCode.toString();    
    if(doc.type == 'whiteBoard') {
        collectName = collectName + '_WhiteBoard';
    } else if(doc.type == 'text') {
        collectName = collectName + '_History';
    }        
    logger.info("collentName : " + collectName)
    mongoDB.collection(collectName).insertOne(doc, function(err, res) {
            if (err) { throw err }
            else {
                logger.info("Insert Success");    
                res.send("OK");            
            }           
            //mdb.close();
    });   
}

/**
 * 방에 대한 모든 정보 찾기 
 */
async function findAllMongo(doc) {
    let collectName = doc.RoomCode.toString();
    let findResult = await mongoDB.collection(collectName).find({}).toArray();
    console.log('Found documents =>', findResult);    
}

/**
 * 방에 대한 조건에 해당하는 값 찾기 
 */
async function findConditionMongo(doc) {
    let collectName = doc.roomCode.toString();
    let conditionKey = doc.conditionKey.toString();        
    let conditionValue = doc.conditionValue;
    
    // 동적 쿼리 생성
    let query = {};
    query[conditionKey] = conditionValue;    

    let findResult = await mongoDB.collection(collectName).find(query).toArray();
    console.log('Found documents =>', findResult);    
}

/**
 * 방에 대한 조건 update
 */

async function updateMongo(doc) {
    let collectName = doc.roomCode.toString();
    let conditionKey = doc.conditionKey.toString();        
    let conditionValue = doc.conditionValue;
    let updateKey = doc.updateKey.toString();
    let updateValue = doc.updateValue;
    
    // 동적 쿼리 생성
    let query = {};
    query[conditionKey] = conditionValue;    

    let updateQuery = {};
    updateQuery[updateKey] = updateValue;

    let updateResult = await mongoDB.collection(collectName).updateOne(query, {$set: updateQuery});
    console.log('Update documents =>', updateResult);    
}

/**
 * 방에 대한 조건 delete
 */

async function deleteMongo(doc) {
    let collectName = doc.roomCode.toString();
    let conditionKey = doc.conditionKey.toString();        
    let conditionValue = doc.conditionValue;    
    
    // 동적 쿼리 생성
    let deleteQuery = {};
    deleteQuery[conditionKey] = conditionValue;    
    
    let deleteResult = await mongoDB.collection(collectName).deleteMany(deleteQuery);
    console.log('delete documents =>', deleteResult);    
}

app.get('/', (req, res) => {
    res.send("hello!");    
    logger.info("User In!");
})

app.post('/insert', (req, res ) => {
    chatValidation.chatMessage(req, res);
    let doc = {
        roomCode : req.body.roomCode,
        sender : req.body.sender,
        text : req.body.text,
        type : req.body.type
    }
    logger.info("req=>" + JSON.stringify(req.body));
    InsertMongo(doc);        
})

app.post('/findAll', (req, res) => {
    let doc = {
        RoomCode : req.body.RoomCode,        
    }
    logger.info("req=>" + JSON.stringify(req.body));
    findAllMongo(doc);    
    res.send("select!");
})

app.post('/findCondition', (req, res) => {
    let doc = {
        RoomCode : req.body.roomCode,        
        conditionKey : req.body.condition,
        conditionValue : req.body.conditionResult
    }
    logger.info("req=>" + JSON.stringify(req.body));
    findConditionMongo(doc);    
    res.send("select!");
})

app.post('/update', (req, res) => {
    let doc = {
        RoomCode : req.body.roomCode,        
        conditionKey : req.body.condition,
        conditionValue : req.body.conditionResult,
        updateKey : req.body.updateKey,
        updateValue : req.body.updateValue
    }
    logger.info("req=>" + JSON.stringify(req.body));
    updateMongo(doc);    
    res.send("update!");
})

app.post('/delete', (req, res) => {
    let doc = {
        RoomCode : req.body.roomCode,        
        conditionKey : req.body.condition,
        conditionValue : req.body.conditionResult,        
    }
    logger.info("req=>" + JSON.stringify(req.body));
    deleteMongo(doc);    
    res.send("delete!");
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

