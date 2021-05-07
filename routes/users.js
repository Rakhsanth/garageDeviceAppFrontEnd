// 3rd party modules
const express = require('express');
// custom modules
const {
    getUser,
    userLogin,
    editUser,
    deleteUser,
    createUser,
    userLogout,
    getCurrentUser,
    changePassword,
} = require('../controllers/users');
const { protected } = require('../middlewares/authHandler');

const router = express.Router();

router.route('/auth/me').get(protected, getCurrentUser);
router
    .route('/:id')
    .get(protected, getUser)
    .put(protected, editUser)
    .delete(protected, deleteUser);
router.route('/register').post(createUser);
router.route('/login').post(userLogin);
router.route('/auth/logout').get(protected, userLogout);
router.route('/auth/changePassword').put(protected, changePassword);

module.exports = router;
