const winston = require('winston');
const winstonDaily = require('winston-daily-rotate-file');
const process = require('process');
const { combine, timestamp, label, printf } = winston.format;
 
//* 로그 파일 저장 경로 → 루트 경로/logs 폴더
const logDir = `C:/logs/matechat/app/%DATE%/`;
 
//* log 출력 포맷 정의 함수
const logFormat = printf(({ level, message, label, timestamp }) => {
   return `${timestamp} [${label}] [${level}]: ${message}`; // 날짜 [시스템이름] 로그레벨 메세지
});
 
/*
 * Log Level
 * error: 0, warn: 1, info: 2, http: 3, verbose: 4, debug: 5, silly: 6
 */
const logger = winston.createLogger({
   //* 로그 출력 형식 정의
   format: combine(
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      label({ label: 'CHAT' }), // 어플리케이션 이름
      logFormat, // log 출력 포맷
      //? format: combine() 에서 정의한 timestamp와 label 형식값이 logFormat에 들어가서 정의되게 된다. level이나 message는 콘솔에서 자동 정의
   ),
   //* 실제 로그를 어떻게 기록을 한 것인가 정의
   transports: [
      //* info 레벨 로그를 저장할 파일 설정 (info: 2 보다 높은 error: 0 와 warn: 1 로그들도 자동 포함해서 저장)
      new winstonDaily({
         level: 'info', // info 레벨에선
         datePattern: 'YYYYMMDD', // 파일 날짜 형식
         dirname: logDir, // 파일 경로
         filename: `MATECHAT.log`,
         maxFiles: 30, // 최근 30일치 로그 파일을 남김
         zippedArchive: true,
      }),      
   ],   
	exceptionHandlers: [
	      new winstonDaily({
	         level: 'error',
	         datePattern: 'YYYYMMDD',
	         dirname: logDir,
	         filename: `MATECHAT.log`,
	         maxFiles: 30,
	         zippedArchive: true,
	      }),
   ],   
});
 

logger.add(
   new winston.transports.Console({
      format: winston.format.combine(
         winston.format.colorize(), // log level별로 색상 적용하기
         logFormat, 
      ),
   }),
);


 
module.exports = logger;