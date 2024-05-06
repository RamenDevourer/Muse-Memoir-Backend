import mongoose from "mongoose";

const authSchema = mongoose.Schema(
    {
        refreshToken: {
            type: String,
            required : true,
        },
    },
    {
        timestamps : true,
    }
);

export const Auth = mongoose.model('Auth', authSchema);