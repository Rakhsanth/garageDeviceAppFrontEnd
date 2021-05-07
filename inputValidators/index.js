const validatePassword = (password) => {
    if (!password) return false;
    if (password.length < 8) return false;
    if (
        !(
            password.match(/[A-Z]/) &&
            password.match(/[a-z]/) &&
            password.match(/[0-9]/) &&
            password.match(/\W/)
        )
    )
        return false;
    return true;
};

module.exports = {
    validatePassword,
};
