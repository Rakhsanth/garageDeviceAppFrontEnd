// custom modules
const ErrorResponse = require('../utils/error');
const Device = require('../models/Device');
const asyncHandler = require('../middlewares/asyncHandler');
// core modules
const path = require('path');

// global constants
const megabytes = 1048576;

/*
route:          GET /devices
description:    To get all devices
auth:           Logged in user
*/
const getAllDevices = asyncHandler(async (request, response, next) => {
    response.status(200).json(response.advancedResults);
});
/*
route:          GET /devices/:id
description:    To get a device by its unique ID
auth:           Logged in user
*/
const getDevice = asyncHandler(async (request, response, next) => {
    const device = await Device.findById(request.params.id);
    if (!device) {
        return next(new ErrorResponse('Device does not exist', '404'));
    }

    response.status(200).json({
        success: true,
        data: device,
        error: false,
    });
});
/*
route:          POST /devices/
description:    To create a device
auth:           logged in users
*/
const createDevice = asyncHandler(async (request, response, next) => {
    request.body.user = request.user.id;

    // if file is being

    const device = await Device.create(request.body);

    response.status(201).json({ success: true, data: device, error: false });
});
/*
route:          PUT /devices/:id
description:    To update a device
auth:           logged in user
*/
const editDevice = asyncHandler(async (request, response, next) => {
    console.log(request.body);

    const device = await Device.findById(request.params.id);

    if (!device) {
        return next(new ErrorResponse('Device does not exist', 404));
    }

    if (request.query.check !== undefined) {
        if (request.body.isCheckedout !== undefined) {
            if (request.body.isCheckedout === device.isCheckedout) {
                if (request.body.isCheckedout) {
                    return next(
                        new ErrorResponse('Already checked out by someone', 400)
                    );
                } else {
                    return next(
                        new ErrorResponse('Already checked in by someone', 400)
                    );
                }
            } else {
                if (request.body.isCheckedout === false) {
                    if (
                        device.lastCheckedoutBy.toString() !== request.user.id
                    ) {
                        return next(
                            new ErrorResponse(
                                'Cannot check in as someone else has checked out this device',
                                401
                            )
                        );
                    }
                }
            }
        } else {
            return next(
                new ErrorResponse('provide check in / out details', 400)
            );
        }
    } else {
        if (request.body.isCheckedout !== undefined) {
            return next(
                new ErrorResponse('Cannot check in / out for this route', 400)
            );
        }
        if (device.user.toString() !== request.user.id) {
            return next(
                new ErrorResponse(
                    'Current user is not authorized to update this Device',
                    401
                )
            );
        }
    }

    if (request.body.isCheckedout === false) {
        delete request.body['lastCheckedoutBy'];
        delete request.body['lastCheckedoutDate'];
    }

    const updatedDevice = await Device.findByIdAndUpdate(
        request.params.id,
        request.body,
        { new: true, runValidators: true }
    );

    response.status(201).json({
        success: true,
        data: updatedDevice,
        error: false,
    });
});
/*
route:          DELETE /devices/:id
description:    To delete a device
auth:           logged in user
*/
const deleteDevice = asyncHandler(async (request, response, next) => {
    const device = await Device.findById(request.params.id);

    if (!device) {
        return next(new ErrorResponse('device doesnot exist', 404));
    }

    if (device.user.toString() !== request.user.id) {
        return next(
            new ErrorResponse(
                'You cannot remove device added by another person',
                401
            )
        );
    }

    await device.remove();

    response.status(201).json({
        success: true,
        message: 'device successfully removed',
        error: false,
    });
});

/*
route:          PUT /devices/:id/image
description:    To upload image of a device
auth:           logged in user
*/
const imageUpload = asyncHandler(async (request, response, next) => {
    const device = await Device.findById(request.params.id);

    if (!device) {
        return next(new ErrorResponse('device doesnot exist', 404));
    }

    if (device.user.toString() !== request.user.id) {
        return next(
            new ErrorResponse(
                'You cannot modify device added by another person',
                401
            )
        );
    }

    // check file in request
    if (!request.files) {
        return next(new ErrorResponse('please upload a file', 400));
    }
    if (request.files.file.mimetype.search(/(jpg|jpeg|png)/i) === -1) {
        return next(new ErrorResponse('please upload an image file', 400));
    }

    // if (device.image !== null) {
    //     // if already has an image delete that from GCP
    //     console.log('has an image already'.yellow);
    //     let filename = profile.picture.split('/');
    //     filename = filename[filename.length - 1];
    //     console.log(`deleting existing image ${filename}`);
    //     deleteImageFromBucket(filename);
    //     console.log('Previous image deleted successfully'.green);
    // }

    const uploadedFile = request.files.file;

    const fileLimit = process.env.IMAGE_SIZE * megabytes;
    if (uploadedFile.size > fileLimit) {
        return next(
            new ErrorResponse(
                `please upload an image less than ${process.env.IMAGE_SIZE} MB`,
                400
            )
        );
    }

    uploadedFile.name = `deviceImage_${device._id}_${
        path.parse(uploadedFile.name).ext
    }`;

    console.log('logging file uploaded'.cyan.inverse);
    console.log(uploadedFile);

    // update image of device
    device.image = {
        data: request.files.file.data,
        contentType: request.files.file.mimetype,
    };

    await device.save();

    response.status(201).json({
        success: true,
        data: device,
        error: false,
    });
});

module.exports = {
    getAllDevices,
    getDevice,
    createDevice,
    editDevice,
    deleteDevice,
    imageUpload,
};
