var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/', function(req, res) {
  const id = req.params.id
  if(!id) {
    res.status(400).send("No ID")
  }
  const s3Key = req.params.s3Key
  if(!s3Key) {
    res.status(400).send("No S3 Key")
  }

})

module.exports = router;
