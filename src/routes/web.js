const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.send('Hello World');
})

router.get('/customer', (req, res) => {
    res.send([1, 2, 3]);
})
router.get('/customer/:id/:id2', (req, res) => {
    // res.send(req.params.id);
    // res.send(req.params.id2);
    res.send(req.query);
})

module.exports = router;