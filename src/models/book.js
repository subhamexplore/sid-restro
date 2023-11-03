const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    phone: {
        type: Number,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    slot: {
        type: String,
        required: true,
    },
    seats: {
        type: String,
        required: true,
    },
    messege: {
        type: String,
        required: true,
    },
    token: {
        type: String,
        required: true,
    }
})

const Booking = new mongoose.model("Booking", bookingSchema);

module.exports = Booking;