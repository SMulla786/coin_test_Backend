import express from "express";
import coinController from "../controllers/coin.controller";

const router = express.Router();

// Get all todos

router.post("/create", coinController.coinController);
router.get("/:symbol", coinController.geCoinInfo);
router.post("/purchase", coinController.purchaseController);
router.post("/sell", coinController.sellController);
router.post("/register", coinController.userRegistration);
router.post("/login", coinController.login);
router.get("/user/:userId", coinController.userInfo);
router.get("/history/:symbol", coinController.coinHistory);

export default router;
