"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const marketplaceController_1 = require("../controllers/marketplaceController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get('/products', marketplaceController_1.getProducts);
router.post('/products', auth_1.protect, marketplaceController_1.createProduct);
router.post('/products/:id/purchase', auth_1.protect, marketplaceController_1.purchaseProduct);
exports.default = router;
