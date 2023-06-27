/**
 * 요청 받은 파라미터 검증 로직
 */
const Joi = require('joi');
const chatMessage_validation = {
    chatMessage : async (req, res, next) => {        
        const body = req.body;
        const chatMessageSchema = Joi.object().keys({
            roomCode : Joi.number().min(1).max(999999).required(),
            sender : Joi.string().min(1).max(20).required(),
            userNick : Joi.string().required(),
            text : Joi.string(),
            time : Joi.string(),
            type : Joi.string().min(1).max(10)
        });

        try { //검사 시작
            await chatMessageSchema.validateAsync(body);
            
        } catch (e) {
            console.log("ChatMessage error", e);
            return res.status(400).json({code: 400, message: e.message});
        }        
    }
}

module.exports = chatMessage_validation;