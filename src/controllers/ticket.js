

import Bus from '../model/bus.js';
import User from '../model/user.js';
import Ticket from '../model/ticket.js';
import { v4 as uuidv4 } from 'uuid';
import { useId } from 'react';


export const getUserTicket = async (req, res) => {
    try {
        const userId = req.userId;

        const tickets = await Ticket.find({ user: userId }).populate("bus", "busId from to busType company departureTime arrivalTime price").sort({ bookedAt: -1 });

        res.status(200).json({ success: true, tickets: tickets || [] });

    } catch (error) {
        console.error("Error fetching tickets : ", error);
        return res.status(500).json({ error: "An Internal Server error accured!" })

    }
}

export const bookTicket = async (req, res) => {
    try {
        const { busId, date, seatNumbers } = req.body;
        const userId = req.userId;

        if (!busId || !date || !seatNumbers || seatNumbers.length === 0) {
            return res.status(400).json({ error: "All fields are required" });
        };

        const bus = await Bus.findOne({ busId });
        const user = await User.findById(userId);

        if (!bus) {
            return res.status(404).json({ error: "Bus not found!" });
        };

        if (!user) {
            return res.status(404).json({ error: "User not found!" });
        }

        const unavailableSeats = seatNumbers?.filter((seatNum) => 
            bus.seats?.some((row) => 
                row?.some((seat) => seat.seat_id === seatNum && seat.booked)
            )
        );

        if (unavailableSeats.length > 0) {
            return res.status(400).json({ error: "Some seats are already booked.", unavailableSeats })
        };

        const totalFare = bus.price * seatNumbers?.length;

        const newTicket = new Ticket({
            user : user._id,
            bus : bus._id,
            date,
            seatNumbers,
            totalFare : totalFare,
            pnr : uuidv4().slice(0,10).toUpperCase(),
        });

        await newTicket.save();
        
        bus.seats.forEach((row) => {
            row?.forEach((seat) => {
                if(seatNumbers.includes(seat.seat_id)){
                    seat.booked = true;
                }
            })
        });

        await bus.save();

        res.status(201).json({success : true,message : "Ticket booked successfully,ticket : newTicket"});

    } catch (error) {
        console.error("Error booking tickets : ", error);
        return res.status(500).json({ error: "An Internal Server error accured!" })

    }
}