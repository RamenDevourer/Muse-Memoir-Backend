import mongoose from "mongoose";

const blogsSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required : true,
        },
        content: {
            type: String,
            required : true,
        },
        tag: {
            type : String,
            required : true,
        },
        username: {
            type : String,
            required : true,
        },
    },
    {
        timestamps : true,
    }
);

export const Blogs = mongoose.model('Blogs', blogsSchema);