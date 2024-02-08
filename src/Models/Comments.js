import mongoose, { Schema } from "mongoose";

const Comments = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'Users',
        required: true,
    },
    restaurantId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Restaurants'
    },
    rating: {
        type: Number,
        required: true,
        min: 0,
        max: 5,
    },
    comment: {
        type: String,
        required: false,
    },
},
    { timestamps: true }
);

export default mongoose.model('Comments', Comments);