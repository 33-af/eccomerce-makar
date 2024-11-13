const express = require('express');
const router = express.Router();
const {auth} = require('../middleware/authMiddleware');
const bannerController = require('../controllers/banner');

router.post('/addBanner',  auth,  bannerController.addBanner);
router.get('/',  bannerController.allBanners);
router.get('/getOneBanner/:id', auth,  bannerController.getBannerById);
router.put('/updateBanner/:id',  auth, bannerController.updateBanner);
router.delete('/removeBanner/:id', auth,  bannerController.removeBanner);

module.exports = router;
