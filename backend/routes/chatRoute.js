import express from 'express';
import { requireLogin } from '../middlewares/authMiddleware.js';
import { accessChatController, addGroupController, fetchChatController, groupController, removeGroupController, renameGroupController } from '../controllers/chatController.js';

const router = express.Router();

// Access one on one chat Route
router.post('/', requireLogin, accessChatController);

// Get all chats
router.get('/', requireLogin, fetchChatController);

// Create group
router.post('/group', requireLogin, groupController);

// Rename group
router.put('/rename-group', requireLogin, renameGroupController);

// Create group
router.put('/remove-group', requireLogin, removeGroupController);

// Add in group
router.put('/add-group', requireLogin, addGroupController);

export default router;