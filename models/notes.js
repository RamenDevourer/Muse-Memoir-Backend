import mongoose from "mongoose";

const notesSchema = mongoose.Schema(
    {
        note: {
            type: String,
            required : true,
        },
        username: {
            type : String,
            required : true,
        },
        index: {
            type : Number,
            required : true,
        },
    },
    {
        timestamps : true,
    }
);

export const Notes = mongoose.model('Notes', notesSchema);