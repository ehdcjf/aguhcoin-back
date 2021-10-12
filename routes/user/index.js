const express = require('express');
const router = express.Router();
const userController = require('./user.controller')


router.post('/idcheck', userController.idCheck)
router.post('/join', userController.createUser)
router.post('/login', userController.loginUser)
router.post('/logout', userController.logoutUser)
router.post('/join', userController.createUser)
// 유저 거래내역, 미체결 내역
router.post('/txlog', userController.txHistory)
router.post('/outstandinglog', userController.outstandingLog)
// 지환 추가, 미체결 내역
router.post('/nontd',userController.nontd);
module.exports = router
