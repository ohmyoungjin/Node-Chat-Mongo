const mongoose = require('mongoose');
const logger = require("../logconfig");
// 기본 요청 url : mongodb://localhost:27017/admin
const dbUrl = 'mongodb://' +
    'maeng:1234' + // 관리자아이디 : 비밀번호
    '@' +
    'localhost' + // host
    ':27017' + // port
    '/admin'; // db : admin db는 로그인을 위한 db 

// 몽구스 연결 함수
const connect = () => {
    logger.info("start!!");
  // 만일 배포용이 아니라면, 디버깅 on
//   if (process.env.NODE_ENV !== 'production') {
     mongoose.set('debug', true); // 몽고 쿼리가 콘솔에서 뜨게 한다.
//   }

//   mongoose.connect(dbUrl, {
//     dbName: 'test', // 실제로 데이터 저장할 db명
//     useNewUrlParser: true,
//     useCreateIndex: true,
//   }, (error) => {
//     if (error) {
//       console.log('몽고디비 연결 에러', error);
//     } else {
//       console.log('몽고디비 연결 성공');
//     }
//   });
    mongoose.connect("mongodb://maeng:1234@localhost:27017/test?authSource=admin")
      .then(() => {
        logger.info("Connected to MongoDB => test");
      })
      .catch((err) => {
        logger.error(err);
      });
};

// 몽구스 커넥션에 이벤트 리스너를 달게 해준다. 에러 발생 시 에러 내용을 기록하고, 연결 종료 시 재연결을 시도한다.
mongoose.connection.on('error', (error) => {
  logger.error('몽고디비 연결 에러', error);
});

mongoose.connection.on('disconnected', () => {
  logger.error('몽고디비 연결이 끊겼습니다. 연결을 재시도합니다.');
  connect(); // 연결 재시도
});

module.exports = connect;