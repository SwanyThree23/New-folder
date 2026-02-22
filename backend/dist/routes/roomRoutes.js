"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const roomController_1 = require("../controllers/roomController");
const panelistController_1 = require("../controllers/panelistController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.route('/')
    .post(auth_1.protect, roomController_1.createRoom)
    .get((req, res) => res.send('List all public rooms')); // Placeholder
router.route('/:id')
    .get(roomController_1.getRoom);
router.route('/:id/status')
    .put(auth_1.protect, roomController_1.updateRoomStatus);
// Panelist Management
router.post('/:roomId/panelists', auth_1.protect, panelistController_1.addPanelist);
router.delete('/:roomId/panelists/:userId', auth_1.protect, panelistController_1.removePanelist);
exports.default = router;
