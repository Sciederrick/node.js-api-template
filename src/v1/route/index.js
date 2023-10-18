const express = require('express');

const authRouter = require('./auth.route');

const router = express.Router();


/**
 * GET api/v1/ status check
 */
router.get('/', (_, res) => {
    res.json({'message': 'ok'});
});

router.use('/auth', authRouter);


module.exports = router;