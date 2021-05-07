// 3rd party modules
const jwt = require('jsonwebtoken');
// custom modules
const ErrorResponse = require('../utils/error');
const User = require('../models/User');
const asyncHandler = require('./asyncHandler');

const protected = asyncHandler(async (request, response, next) => {
    let token;
    if (
        request.headers.authorization &&
        request.headers.authorization.startsWith('Bearer')
    ) {
        token = request.headers.authorization.split(' ')[1];
        console.log('token got from LocalSTorage'.yellow.bold);
    } else if (request.cookies) {
        console.log('token got from cookies'.yellow.bold);
        token = request.cookies.token;
    }

    if (!token) {
        return next(
            new ErrorResponse('not authorized to access this route', 401)
        );
    }

    console.log(`Token : ${token}`.yellow.bold);

    try {
        // parsing JWT token sent from client
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        console.log(`current user's ID : ${user.id}`);
        request.user = user;
        next();
    } catch (err) {
        console.log(err);
        return next(
            new ErrorResponse('not authorized to access this route', 401)
        );
    }
});

module.exports = {
    protected,
};
