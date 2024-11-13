const express = require('express');
const router = express.Router();
const {auth} = require('../middleware/authMiddleware');
const  SausageControler = require('../controllers/sausage')

router.get('/',   SausageControler.allSausages)
router.post('/addSausage', auth, SausageControler.addSausage )
router.get('/getOneSausage/:id', auth, SausageControler.oneSausage)

router.delete('/removeSausage/:id', auth, SausageControler.removeSausage)
router.put('/updateSausage/:id', auth, SausageControler.updateSausage)

module.exports = router
