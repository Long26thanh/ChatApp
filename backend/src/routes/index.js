import authRoute from "./authRoute.js";
import userRoute from "./userRoute.js";
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
};

export default routes;
