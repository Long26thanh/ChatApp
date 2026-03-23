import mongoose from "mongoose";

const friendSchema = new mongoose.Schema(
    {
        from: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        to: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        message: {
            type: String,
            maxlength: 255,
        },
    },
    {
        timestamps: true,
    },
);

friendSchema.index({ from: 1, to: 1 }, { unique: true });
friendSchema.index({ from: 1 });
friendSchema.index({ to: 1 });

const FriendRequest = mongoose.model("FriendRequest", friendSchema);
export default FriendRequest;
