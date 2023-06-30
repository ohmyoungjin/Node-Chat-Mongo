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
const url = process.env.mongoServer ;
const client = new MongoClient(url);
const dbName = 'test';

let mongoDB;

/**
 * 트랜잭션 관련 함수
 */
async function withTransaction(session, callback) {
    try {
        await session.startTransaction();
                
        await callback(session);

        await session.commitTransaction();        
        
    } catch (error) {
        await session.abortTransaction();        
    } finally {                
        session.endSession();
    }
}
    
/**
 * MongoCollection name String Converter 
 */
function stringConverter(collectionName) {    
    if(typeof(collectionName) != 'string') {        
        return collectionName.toString();
    } else {        
        return collectionName;
    }
}

async function insertMongo(doc) {        

    const session = client.startSession();

    await withTransaction(session, async (session) => { 

        let collectName = stringConverter(doc.roomId);        
        if(doc.type == 'whiteBoard') {
            collectName = collectName + '_WhiteBoard';
        } else if(doc.type == 'TALK') {
            collectName = collectName + '_History';
        }                

        mongoDB.collection(collectName).insertOne(doc, function(err, res) {                           
        });           
    })
    
}

/**
 * 방에 대한 모든 정보 찾기 
 */
async function findAllMongo(doc) {    
    let findResult;    
    let collectName = stringConverter(doc.roomId);
    
    const session = client.startSession();    

    await withTransaction(session, async (session) => { 
        findResult = await mongoDB.collection(collectName).find({}).toArray()        
    })    
    return findResult;
}

/**
 * 방에 대한 조건에 해당하는 값 찾기 
 */
async function findConditionMongo(doc) {    
    let collectName = stringConverter(doc.roomId);        
    let conditionKey = doc.conditionKey;        
    let conditionValue = doc.conditionValue;
    let findResult;    

    // 동적 쿼리 생성
    let query = {};
    query[conditionKey] = conditionValue;        

    const session = client.startSession();        

    await withTransaction(session, async (session) => {         
        findResult = await mongoDB.collection(collectName).find(query).toArray();        
    })  
    return findResult;      
}

/**
 * 방에 대한 조건 update
 */
async function updateMongo(doc) {
    let collectName = stringConverter(doc.roomId);
    let conditionKey = doc.conditionKey.toString();        
    let conditionValue = doc.conditionValue;
    let updateKey = doc.updateKey.toString();
    let updateValue = doc.updateValue;
    
    // 동적 쿼리 생성
    let query = {};
    query[conditionKey] = conditionValue;    

    let updateQuery = {};
    updateQuery[updateKey] = updateValue;

    const session = client.startSession();    

    await withTransaction(session, async (session) => { 
        mongoDB.collection(collectName).updateOne(query, {$set: updateQuery});
    })        
}

/**
 * 방에 대한 조건 delete
 */
async function deleteMongo(doc) {
    let collectName = stringConverter(doc.roomId);
    let conditionKey = doc.conditionKey.toString();        
    let conditionValue = doc.conditionValue;    
    
    // 동적 쿼리 생성
    let deleteQuery = {};
    deleteQuery[conditionKey] = conditionValue;    
    
    const session = client.startSession();        
    await withTransaction(session, async (session) => { 
        mongoDB.collection(collectName).deleteMany(deleteQuery);
    })        
}

async function deleteCollection(doc) { 
    /**
     * 추후 정책에 따른 삭제 로직 추가 
     */
    let collectName = stringConverter(doc.roomId);
    mongoDB.dropCollection(collectName);             
}


// app.get('/', (req, res) => {
//     res.send("hello!");    
//     logger.info("User In!");
// })

app.post('/health', (req, res) => {
    return res.status(200).send(exceptionDto.errorCode.CODE_0);
}) 

app.post('/chatHistory/insert', async (req, res ) => {    
    try {
        await chatValidation.chatMessage(req, res);
        let doc = {
            roomId : req.body.roomId,
            sender : req.body.sender,
            text : req.body.text,
            time : req.body.time,
            type : req.body.type
        }
            
        await insertMongo(doc);   
        res.json(doc);
    } catch(e) {
        console.error(e);
        res.json({rtnMessage: "success", rtnCode: "000000", rtnDtlMessage: "에러"});
    }                
})

app.post('/chatHistory/findAll', async (req, res) => {
    let doc = {
        roomId : req.body.roomId,        
    }        
    try {        
        let roomList  = await findAllMongo(doc);           
        res.status(200).send(roomList);
     } catch (e) {
        logger.error(e);
        res.status(400).send(exceptionDto.errorCode.CODE_2)
     }    
})

app.post('/chatHistory/findCondition', async (req, res) => {
    let doc = {
        roomId : req.body.roomId,        
        conditionKey : req.body.conditionKey,
        conditionValue : req.body.conditionValue
    }    

    try {
        let roomList = await findConditionMongo(doc); 
        console.log("roomList =>" , roomList);           
        res.status(200).send(roomList);
     } catch (e) {        
        logger.error(e);
        res.status(400).send(exceptionDto.errorCode.CODE_2)
     }       
})

app.post('/chatHistory/update', async (req, res) => {
    let doc = {
        roomId : req.body.roomId,        
        conditionKey : req.body.conditionKey,
        conditionValue : req.body.conditionValue,
        updateKey : req.body.updateKey,
        updateValue : req.body.updateValue
    }            

    try {
        await updateMongo(doc);    
        res.status(200).send(exceptionDto.errorCode.CODE_0);
     } catch (e) {
        logger.error(e);
        res.status(400).send(exceptionDto.errorCode.CODE_3)
     }   
})

app.post('/chatHistory/delete', async (req, res) => {
    let doc = {
        roomId : req.body.roomId,        
        conditionKey : req.body.conditionKey,
        conditionValue : req.body.conditionValue,        
    }    

    try {
        await deleteMongo(doc);             
        res.status(200).send(exceptionDto.errorCode.CODE_0);
     } catch (e) {
        logger.error(e);
        res.status(400).send(exceptionDto.errorCode.CODE_4)
     }           
})

/**
 * 정책에 따른 collection 삭제
 */
app.post('/collection/delete', async (req, res) => {
    let doc = {
        roomId : req.body.roomId
    }    

    try {
       await deleteCollection(doc, res)        
        res.status(200).send(exceptionDto.errorCode.CODE_0);
    } catch (e) {
        logger.error(e);
        res.status(400).send(exceptionDto.errorCode.CODE_4);        
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

