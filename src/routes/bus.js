
import express from 'express';
import { getBusDetails, searchBuses } from '../controllers/bus.js';

const router = express.Router();

router.get("/:busId",getBusDetails);
router.post("/search",searchBuses);


export default router;