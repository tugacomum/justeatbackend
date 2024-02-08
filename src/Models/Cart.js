import mongoose, { Schema } from "mongoose";

const Cart = new Schema({
    date: {
        type: 'date',
        required: true
    },
    price: {
        type: 'string',
        required: true
    },
    clientId: {
        type: 'string',
        required: true
    },
    observations: {
        type: 'string',
        required: true
    },
    deliveryAddress: {
        type: 'string',
        required: true
    },
    paymentMethod: {
        type: 'string',
        required: true
    },
    restaurantId: {
        type: 'string',
        required: true,
        ref: 'Restaurants'
    },
    status: {
        type: 'string',
        default: 'PENDING'
    }
},
    { timestamps: true }
);

export default mongoose.model('Cart', Cart);