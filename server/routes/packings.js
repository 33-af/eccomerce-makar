const express = require('express');
const router = express.Router();
const packingController = require('../controllers/packing')
const { auth } = require('../middleware/authMiddleware');


router.get('/', packingController.allPacking)
router.post('/addPackage', auth, packingController.addPack)
router.get('/getOnePackage/:id', auth, packingController.onePackage)
router.delete('/removePacking/:id', auth, packingController.removePacking)
router.put('/updatePacking/:id', auth, packingController.updatePacking)

module.exports = router
