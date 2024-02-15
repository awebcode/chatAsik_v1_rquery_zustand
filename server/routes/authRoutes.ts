import express from "express"
import { register,login, getUser, allUsers } from "../controllers/authControllers";
import authMiddleware from "../middlewares/authMiddleware";
import uploadMiddleware from "../middlewares/uploadMiddleware";


const authRoute = express.Router()



// Registration route
authRoute.post("/register",uploadMiddleware.single("pic"), register);
// Login route
authRoute.post("/login", login);
authRoute.get("/getUser", authMiddleware, getUser);
authRoute.get("/getUsers", authMiddleware, allUsers);
export default authRoute;

