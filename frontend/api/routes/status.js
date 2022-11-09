const express = require('express');
const router = express.Router();
const { getStatusByDynamoUUID } = require("../middleware/dynamo");

/* GET status */
router.get('/:id', function (req, res, next) {

    if (req.params.id === null || req.params.id === undefined || req.params.id === '' || req.params.id.length !== 36) {
        return res.status(422).json({ status: false, message: "Invalid UUID" });
    }

    getStatusByDynamoUUID(req.params.id)
        .then((data) => {
            if (data === null || data === undefined || data === '') {
                return res.status(404).json({ status: false, message: "UUID not found" });
            }
            res.status(200).json({ status: true, message: 'File status', data });
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({ status: false, message: 'File status failed' });
        });

});

module.exports = router;
