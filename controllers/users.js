// 3rd party modules
const jwt = require('bcryptjs');
// custom modules
const ErrorResponse = require('../utils/error');
const User = require('../models/User');
const asyncHandler = require('../middlewares/asyncHandler');
const { validatePassword } = require('../inputValidators');

/*
route:          GET /users/me
description:    To get current logged in user
auth:           Logged in user
*/
const getCurrentUser = asyncHandler(async (request, response, next) => {
    const user = await User.findById(request.user.id);
    if (!user) {
        return next(new ErrorResponse('User not found', '404'));
    }

    response.status(200).json({
        success: true,
        data: user,
        error: false,
    });
});
/*
route:          GET /users/:id
description:    To get a user by his unique ID
auth:           Logged in user
*/
const getUser = asyncHandler(async (request, response, next) => {
    const user = await User.findById(request.params.id);
    if (!user) {
        return next(new ErrorResponse('User does not exist', '404'));
    }

    response.status(200).json({
        success: true,
        data: user,
        error: false,
    });
});
/*
route:          POST /users/login
description:    To login a user
auth:           all
*/
const userLogin = asyncHandler(async (request, response, next) => {
    const { email, password } = request.body;
    // get password also in the result to compare with the hashed one
    const user = await User.findOne({ email: email }).select('+password');

    if (!user) {
        return next(new ErrorResponse('User does not exists', '401'));
    }

    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
        return next(new ErrorResponse('Incorrect password', '401'));
    }
    setTokenToCookie(user, 200, request, response);
});
/*
route:          POST /users/register
description:    To create a user
auth:           all
*/
const createUser = asyncHandler(async (request, response, next) => {
    const { userName, email, password } = request.body;
    if (!validatePassword(password)) {
        return next(
            new ErrorResponse(
                'Password must contains min 8 chars, 1 number, 1 uppercase, 1 lowercase and 1 special character',
                400
            )
        );
    }
    const user = await User.create(request.body);

    setTokenToCookie(user, 201, request, response);
});
/*
route:          PUT /users/:id
description:    To update a user
auth:           loggedin user
*/
const editUser = asyncHandler(async (request, response, next) => {
    // const { userName } = request.body;

    if (request.user.id !== request.params.id) {
        return next(
            new ErrorResponse('Current user cannot modify another user', 404)
        );
    }

    const user = await User.findById(request.params.id);

    if (!user) {
        return next(new ErrorResponse('User doesnot exist', 404));
    }

    const updatedUser = await User.findByIdAndUpdate(
        request.params.id,
        request.body,
        {
            new: true,
            runValidators: true,
        }
    );

    response.status(201).json({
        success: true,
        data: updatedUser,
        error: false,
    });
});
/*
route:          DELETE /users/:id
description:    To delete a user
auth:           logged in user
*/
const deleteUser = asyncHandler(async (request, response, next) => {
    const user = await User.findById(request.params.id);

    if (!user) {
        return next(new ErrorResponse('User doesnot exist', 404));
    }

    await user.remove();

    response.status(201).json({
        success: true,
        message: 'User successfully removed',
        error: false,
    });
});
/*
route:          GET /users/auth/logout
description:    To logout
auth:           logged in user
*/
const userLogout = asyncHandler(async (request, response, next) => {
    request.headers.authorization = null;
    response
        .status(200)
        .cookie('token', 'none', {
            expires: new Date(Date.now() + 5 * 1000),
            httpOnly: true,
        })
        .json({
            success: true,
            message: 'User successfully logged out',
        });
});
/*
route:          PUT /users/auth/changePassword
description:    To change the password
auth:           logged in user
*/
const changePassword = asyncHandler(async (request, response, next) => {
    const user = await User.findById(request.user.id).select('+password');

    if (!user) {
        return next(new ErrorResponse('User does not exist', 404));
    }

    const oldPwd = request.body.oldPassword;
    const newPwd = request.body.newPassword;

    if (oldPwd === newPwd) {
        return next(
            new ErrorResponse('Old and new password cannot be similar ', 401)
        );
    }

    if (!validatePassword(newPwd)) {
        return next(
            new ErrorResponse(
                'Password must contains min 8 chars, 1 number, 1 uppercase, 1 lowercase and 1 special character',
                400
            )
        );
    }

    const isMatch = await user.comparePassword(oldPwd);
    if (!isMatch) {
        return next(
            new ErrorResponse(
                'Entered password does not match with current password',
                401
            )
        );
    }

    user.password = newPwd;
    await user.save();

    response.status(201).json({
        success: true,
        message: 'Password changed successfully',
        error: false,
    });
});

// util service to set token to cookie
const setTokenToCookie = (user, statusCode, request, response) => {
    const token = user.getJwtToken();
    const options = {
        // Cookie expires in this no of days
        expires: new Date(
            Date.now() + process.env.COOKIE_TIMEOUT * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        secure: process.env.ENVIRONMENT === 'prod',
    };

    response.status(statusCode).cookie('token', token, options).json({
        success: true,
        token,
    });
};

module.exports = {
    getCurrentUser,
    getUser,
    userLogin,
    createUser,
    editUser,
    deleteUser,
    userLogout,
    changePassword,
};
