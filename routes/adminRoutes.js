import express from 'express';
const router = express.Router();
import AdminController from '../controllers/adminController.js';
import UserController from '../controllers/userController.js';
import checkUserAuth from '../middlewares/auth-middleware.js';
import checkAdminAuth from '../middlewares/admin-auth-middleware.js';

//Public Routes - No login required 
router.post('/register', UserController.userRegistration)
router.post('/login', UserController.userLogin)
router.post('/send-reset-password-email', UserController.sendUserPasswordResetEmail)
router.post('/reset-password/:id/:token', UserController.userPasswordReset)

//Private Routes - Login required for both user and admin
router.post('/changepassword',checkUserAuth ,UserController.changeUserPassword)
router.get('/loggeduser',checkUserAuth ,UserController.loggedUser)
// router.get('/dbUsers', checkUserAuth ,UserController.dbUsers)

//Extra Admin Routes - Login required as an admin
router.get('/admin/users', checkAdminAuth, AdminController.getAllUsers)
router.get('/admin/users/:id', checkAdminAuth, AdminController.getUserById)


// Export the router
export default router;
