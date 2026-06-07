import express from 'express';
import * as authController from '../controllers/authController';
import authMiddleware from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validationMiddleware';
import { registerSchema, loginSchema, googleLoginSchema, updateProfileSchema } from '../validation/schemas';

const router = express.Router();

router.post('/register', validateRequest(registerSchema), authController.register);
router.post('/login', validateRequest(loginSchema), authController.login);
router.post('/google', validateRequest(googleLoginSchema), authController.googleLogin);
router.get('/me', authMiddleware, authController.getMe);
router.put('/profile', authMiddleware, validateRequest(updateProfileSchema), authController.updateProfile);

export default router;
