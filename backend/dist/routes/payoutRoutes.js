"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const payoutController_1 = require("../controllers/payoutController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.use(auth_1.protect); // All payout routes require authentication
router.post('/request', payoutController_1.requestPayout);
router.get('/history', payoutController_1.getTransactionHistory);
exports.default = router;
