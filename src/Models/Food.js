import mongoose, { Schema } from "mongoose";

const FoodsSchema = new Schema({
    name: {
        type: 'String',
        required: true
    },
    price: {
        type: 'String',
        required: true
    },
    photo: {
        type: 'string',
        required: true
    },
    alergy: {
        type: 'string',
        required: true
    },
    description: {
        type: 'string'
    },
    restaurant: {
        type: 'string',
        ref: "Restaurants"
    },
    status: {
        type: 'boolean',
        default: true
    }
},
    { timestamps: true }
);

export default mongoose.model('Foods', FoodsSchema);