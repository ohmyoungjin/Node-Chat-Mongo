const express = require('express');
const app = express();

/**
 * json, encode 설정
 */
app.use(express.json());
app.use(express.urlencoded({extended: true}))
const port = 3000;

/**
 * log 관련
 */
const morgan = require('morgan');
const logger = require("./logconfig");
/**
 * 검증 관련
 */
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
 * exception 관련
 */
const exceptionDto = require('./excepction/exceptionDto');
/**
 * 몽고 DB 관련 설정 
 */
const { MongoClient } = require('mongodb');
const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);
const dbName = 'test';

let mongoDB;

async function InsertMongo(doc) {    
    console.log("InsertMongo doc =>", doc);
    let collectName = doc.roomCode.toString();    
    if(doc.type == 'whiteBoard') {
        collectName = collectName + '_WhiteBoard';
    } else if(doc.type == 'text') {
        collectName = collectName + '_History';
    }        
    logger.info("collentName : " + collectName)
    mongoDB.collection(collectName).insertOne(doc, function(err, res) {                           
    });   
}

/**
 * 방에 대한 모든 정보 찾기 
 */
async function findAllMongo(doc) {
    let collectName = doc.RoomCode.toString();
    let findResult = mongoDB.collection(collectName).find({}).toArray();
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

    let findResult = mongoDB.collection(collectName).find(query).toArray();
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

    let updateResult = mongoDB.collection(collectName).updateOne(query, {$set: updateQuery});
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
    
    let deleteResult = mongoDB.collection(collectName).deleteMany(deleteQuery);
    console.log('delete documents =>', deleteResult);    
}

async function deleteCollection(doc) { 
    /**
     * 추후 정책에 따른 삭제 로직 추가 
     */
    let collectName = doc.roomCode.toString();
    mongoDB.dropCollection(collectName);     
    console.log("finish!222");      
    
}


app.get('/', (req, res) => {
    res.send("hello!");    
    logger.info("User In!");
})

app.post('/health', req, res => {
    return res.status(200).send(exceptionDto.errorCode.CODE_0);
}) 

app.post('/insert', async (req, res ) => {
    try {
        await chatValidation.chatMessage(req, res);
        let doc = {
            roomCode : req.body.roomCode,
            sender : req.body.sender,
            text : req.body.text,
            type : req.body.type
        }
            
        await InsertMongo(doc, res);   
        return res.status(200).send(exceptionDto.errorCode.CODE_0);
    } catch(e) {
        return res.status(400).send(exceptionDto.errorCode.CODE_1, e)
    }
    
        
    res.send("Ok");
})

app.post('/findAll', async (req, res) => {
    let doc = {
        roomCode : req.body.RoomCode,        
    }
        
    try {
        await findAllMongo(doc);   
        return res.status(200).send(exceptionDto.errorCode.CODE_0);
     } catch (e) {
        return res.status(400).send(exceptionDto.errorCode.CODE_2)
     }    
})

app.post('/findCondition', async (req, res) => {
    let doc = {
        roomCode : req.body.roomCode,        
        conditionKey : req.body.condition,
        conditionValue : req.body.conditionResult
    }    

    try {
        await findConditionMongo(doc);    
        return res.status(200).send(exceptionDto.errorCode.CODE_0);
     } catch (e) {
        return res.status(400).send(exceptionDto.errorCode.CODE_2)
     }       
})

app.post('/update', async (req, res) => {
    let doc = {
        roomCode : req.body.roomCode,        
        conditionKey : req.body.condition,
        conditionValue : req.body.conditionResult,
        updateKey : req.body.updateKey,
        updateValue : req.body.updateValue
    }            

    try {
        await updateMongo(doc);    
        return res.status(200).send(exceptionDto.errorCode.CODE_0);
     } catch (e) {
        return res.status(400).send(exceptionDto.errorCode.CODE_3)
     }   
})

app.post('/delete', async (req, res) => {
    let doc = {
        roomCode : req.body.roomCode,        
        conditionKey : req.body.condition,
        conditionValue : req.body.conditionResult,        
    }    

    try {
        await deleteMongo(doc);             
        return res.status(200).send(exceptionDto.errorCode.CODE_0);
     } catch (e) {
        return res.status(400).send(exceptionDto.errorCode.CODE_4)
     }           
})

/**
 * 정책에 따른 collection 삭제
 */
app.post('/collection/delete', async (req, res) => {
    let doc = {
        roomCode : req.body.roomCode
    }    
    
    try {
       await deleteCollection(doc, res)        
        return res.status(200).send(exceptionDto.errorCode.CODE_0);
    } catch (e) {
        return res.status(400).send(exceptionDto.errorCode.CODE_4, e);        
    }            
})

/**
 * Server start
 */
app.listen(port, () => {
    logger.info("Server Start !");       
    main();    
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

