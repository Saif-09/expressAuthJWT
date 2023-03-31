import express from 'express';
const router = express.Router();
import UserController from '../controllers/userController.js';

//there will be two routes,

//Public Routes - No login required 
router.post('/register', UserController.userRegistration)
router.post('/login', UserController.userLogin)




//Private Routes - Login required
router.post('/changepassword', UserController.changeUserPassword)




export default router