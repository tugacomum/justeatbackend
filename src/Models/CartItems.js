import mongoose, { Schema } from "mongoose";

const CartItems = new Schema({
    cartId: {
        type: 'string',
        required: true,
        ref: 'Cart'
    },
    productId: {
        type: 'string',
        ref: 'Food',
        required: true
    },
    observations: {
        type: 'string',
        required: true
    }
},
    { timestamps: true }
);

export default mongoose.model('CartItems', CartItems);