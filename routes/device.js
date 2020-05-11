var express = require("express");
var router = express.Router();
const dparse = require("../bin/dparse");

/* GET device information */
router.get("/", function(req, res, next) {
  d = dparse();
  res.send(d);
});

module.exports = router;
