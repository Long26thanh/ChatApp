import authRoute from "./authRoute.js";
import userRoute from "./userRoute.js";
import friendRoute from "./friendRoute.js";
import messageRoute from "./messageRoute.js";
import conversationRoute from "./conversationRoute.js";
import protectedRoute from "../middlewares/authMiddleware.js";

const routes = (app) => {
    // Route mặc định
    app.get("/", (req, res) => {
        res.send("API is running...");
    });

    // Public routes (không yêu cầu xác thực)
    app.use("/auth", authRoute);

    // Private routes (yêu cầu xác thực)
    app.use(protectedRoute);
    app.use("/users", userRoute);
    app.use("/friends", protectedRoute, friendRoute);
    app.use("/messages", protectedRoute, messageRoute);
    app.use("/conversations", protectedRoute, conversationRoute);
};

export default routes;
