const express = require('express');
const router = express.Router();
const meatJerksController= require('../controllers/meatJerks')

const {auth} = require('../middleware/authMiddleware');


router.get('/',  meatJerksController.allMeatJerks)
router.post('/addMeatJerks', auth, meatJerksController.addMeatJerks);
router.get('/getOneMeatJerk/:id',  auth, meatJerksController.oneMeatJerks);  // Добавлен слэш перед "getOneMeatJerk"
router.delete('/removeMeatJerk/:id', auth,  meatJerksController.removeMeatJerk)
router.put('/updateMeatJerk/:id', auth,meatJerksController. updateMeatJerk)

module.exports = router
