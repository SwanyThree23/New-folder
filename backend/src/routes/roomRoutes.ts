import express from 'express';
import { createRoom, getRoom, updateRoomStatus } from '../controllers/roomController';
import { addPanelist, removePanelist } from '../controllers/panelistController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.route('/')
    .post(protect, createRoom)
    .get((req, res) => res.send('List all public rooms')); // Placeholder

router.route('/:id')
    .get(getRoom);

router.route('/:id/status')
    .put(protect, updateRoomStatus);

// Panelist Management
router.post('/:roomId/panelists', protect, addPanelist);
router.delete('/:roomId/panelists/:userId', protect, removePanelist);

export default router;
