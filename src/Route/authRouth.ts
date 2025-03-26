import express from "express"
import { AuthController } from "../controllers/auth.controller.user"


const authcontroller = new AuthController();
const authRouter = express.Router();

authRouter.post("/", authcontroller.login);

export default authRouter;