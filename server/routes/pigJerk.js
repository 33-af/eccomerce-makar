const express = require('express');
const router = express.Router();
const {auth} = require('../middleware/authMiddleware');
const pigJerkController = require('../controllers/pigJerk')


router.get('/',  pigJerkController.allPigJerks)
router.post('/addPigJerks', auth, pigJerkController.addPigJerks)
router.get('/getOnePigJerk/:id', auth, pigJerkController.onePigJerk)
router.delete('/removePigJerk/:id', auth, pigJerkController.removePigJerk)
router.put('/updatePigJerk/:id', auth, pigJerkController.updatePigJerk)

module.exports = router
