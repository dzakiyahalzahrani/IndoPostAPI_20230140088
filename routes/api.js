const express = require('express');
const router = express.Router();
const c = require('../controllers/wilayahController');

router.get('/provinces', c.getProvinces);
router.get('/regencies', c.getRegencies);
router.get('/districts', c.getDistricts);
router.get('/villages', c.getVillages);

module.exports = router;
