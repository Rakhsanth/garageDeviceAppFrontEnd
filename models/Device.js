// 3rd party modules
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// core modules
const path = require('path');

const deviceSchema = new Schema({
    image: {
        data: {
            type: Buffer,
            default: null,
        },
        contentType: {
            type: String,
            default: null,
        },
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [
            true,
            'Each device needs to be associated with a user who created it',
        ],
    },
    device: {
        type: String,
        maxlength: [50, 'Device name can only have maximum of 50 characters'],
        required: [true, 'Please provide Device name'],
    },
    os: {
        type: String,
        maxlength: [25, 'OS can only have maximum of 25 characters'],
        required: [true, 'Please provide OS'],
    },
    manufacturer: {
        type: String,
        maxlength: [
            100,
            'Manufacturer name can only have a maximum of 100 characters',
        ],
        required: [true, 'Please provide the manufacturer'],
    },
    lastCheckedoutDate: {
        type: Date,
        default: null,
    },
    lastCheckedoutBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        default: null,
    },
    isCheckedout: {
        type: Boolean,
        required: [true, 'Please provide is checked out or not'],
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Device', deviceSchema);
