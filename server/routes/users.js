const express = require('express');
const router = express.Router();
const {auth} = require('../middleware/authMiddleware');
const { register, current } = require('../controllers/users')




router.post('/register', register);

router.get('/current', auth, current)

module.exports = router