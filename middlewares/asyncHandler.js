const asyncHandler = (func) => (request, response, next) =>
    Promise.resolve(func(request, response, next)).catch(next);

module.exports = asyncHandler;
