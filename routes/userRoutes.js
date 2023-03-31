import express from 'express';
const router = express.Router();
import UserController from '../controllers/userController.js';
import checkUserAuth from '../middlewares/auth-middleware.js';

//route level middleware - to protect route
router.use('/changepassword', checkUserAuth)
router.use('/loggeduser',checkUserAuth)

//there will be two routes,

//Public Routes - No login required 
router.post('/register', UserController.userRegistration)
router.post('/login', UserController.userLogin)
router.post('/send-reset-password-email', UserController.sendUserPasswordResetEmail)
router.post('/reset-password/:id/:token', UserController.userPasswordReset)




//Private Routes - Login required
router.post('/changepassword', UserController.changeUserPassword)
router.get('/loggeduser', UserController.loggedUser)




export default router