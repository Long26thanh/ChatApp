import mongoose from "mongoose";

const friendSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        friendId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
    },
);

friendSchema.pre("save", async function () {
    const userId = this.userId.toString();
    const friendId = this.friendId.toString();

    if (userId > friendId) {
        this.userId = new mongoose.Types.ObjectId(friendId);
        this.friendId = new mongoose.Types.ObjectId(userId);
    }
});

friendSchema.index({ userId: 1, friendId: 1 }, { unique: true });

const Friend = mongoose.model("Friend", friendSchema);
export default Friend;
