import express from 'express';
import { allUserController, loginController, signUpController } from '../controllers/authController.js';
import { requireLogin } from '../middlewares/authMiddleware.js'

const router = express.Router();

// Sign Up Router
router.post('/signup', signUpController);

// Login Controller
router.post('/login', loginController);

// All users
router.get('/alluser', requireLogin, allUserController);

export default router;