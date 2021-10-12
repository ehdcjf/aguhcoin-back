const express = require('express');
const router = express.Router();
const exchangeController = require('./exchange.controller');



router.get('/all', exchangeController.getAll)
router.post('/buy', exchangeController.createOrderBuy)
router.post('/sell', exchangeController.createOrderSell)
router.post('/cancle', exchangeController.deleteOrder)
// router.post('/gara', exchangeController.garaInput)

module.exports = router