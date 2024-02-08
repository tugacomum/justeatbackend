import mongoose, { Schema } from "mongoose";

const Addresses = new Schema({
    clientId: {
        type: 'string',
        required: true,
        ref: 'Users'
    },
    addressLineOne: {
        type: 'string',
        required: true
    },
    addressLineTwo: {
        type: 'string',
        required: true
    },
    status: {
        type: 'boolean',
    }
},
    { timestamps: true }
);

export default mongoose.model('Addresses', Addresses);