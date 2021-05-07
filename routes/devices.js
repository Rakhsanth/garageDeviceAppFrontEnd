// 3rd party modules
const express = require('express');
// custom modules
const {
    getAllDevices,
    getDevice,
    createDevice,
    editDevice,
    deleteDevice,
    imageUpload,
} = require('../controllers/devices');
const { protected } = require('../middlewares/authHandler');
const advancedResults = require('../utils/advancedResults');
const Device = require('../models/Device');

const router = express.Router();

const populate = {};

router
    .route('/')
    .get(protected, advancedResults(Device, 'devices'), getAllDevices)
    .post(protected, createDevice);
router
    .route('/:id')
    .get(protected, getDevice)
    .put(protected, editDevice)
    .delete(protected, deleteDevice);
router.route('/:id/image').put(protected, imageUpload);

module.exports = router;
