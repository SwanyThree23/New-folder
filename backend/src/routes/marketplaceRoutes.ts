import express from 'express';
import { getProducts, createProduct, purchaseProduct } from '../controllers/marketplaceController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.get('/products', getProducts);
router.post('/products', protect, createProduct);
router.post('/products/:id/purchase', protect, purchaseProduct);

export default router;
