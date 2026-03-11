class userControllers {
    async authMe(req, res) {
        try {
            const user = req.user;
            // if (!user) {
            //     return res.status(401).json({ message: "Unauthorized" });
            // }
            return res.status(200).json({
                user,
            });
        } catch (error) {
            console.error("Lỗi xác thực người dùng:", error);
            return res.status(500).json({ message: "Lỗi hệ thống" });
        }
    }
}

export default new userControllers();
