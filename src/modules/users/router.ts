import { Router } from "express";
import * as controller from "./controllers/index.js";
import authMiddleware from "@src/middleware/users.js";

const router = Router();

router.get("/", authMiddleware, controller.readMany);
router.get("/:id", authMiddleware, controller.read);
router.post("/", authMiddleware, controller.invite);
router.patch("/:id", authMiddleware, controller.update);
router.delete("/:id", authMiddleware, controller.destroy);

export default router;
