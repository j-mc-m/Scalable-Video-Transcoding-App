const express = require('express');
const router = express.Router();

/* GET status */
router.get('/:id', function (req, res, next) {
    res.send('respond with a resource');
});

module.exports = router;
