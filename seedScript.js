import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { buses, generateSeats, locations } from './seedData.js';
import Bus from './src/model/bus.js';

dotenv.config();

const generateRandomTime = (baseDate) => {
    const hour = Math.floor(Math.random() * 12) + 6;
    const minute = Math.random() > 0.5 ? 30 : 0;

    const dateTime = new Date(baseDate);
    dateTime.setHours(hour, minute, 0, 0);

    return dateTime;
};

async function seedDatabase() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Database connected for seeding data");

        await Bus.deleteMany();
        console.log("Old bus data deleted");

        const baseDate = new Date();

        const BATCH_SIZE = 1000;
        let batch = [];

        for (let i = 0; i < locations.length; i++) {
            for (let j = i + 1; j < locations.length; j++) {
                const from = locations[i];
                const to = locations[j];

                for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
                    const travelDate = new Date(baseDate);
                    travelDate.setDate(travelDate.getDate() + dayOffset);

                    const returnDate = new Date(travelDate);
                    returnDate.setDate(returnDate.getDate() + 1);

                    for (const bus of buses) {
                        // Forward journey
                        batch.push({
                            busId: `${bus.busId}_${from}_${to}_${dayOffset}`,
                            from,
                            to,
                            departureTime: generateRandomTime(travelDate),
                            arrivalTime: generateRandomTime(travelDate),
                            duration: "9h 30m",
                            availableSeats: 28,
                            price: bus.price,
                            originalPrice: bus.originalPrice,
                            company: bus.company,
                            busType: bus.busType,
                            rating: bus.rating,
                            totalReviews: bus.totalReviews,
                            badges: bus.badges,
                            seats: generateSeats(),
                        });

                        // Return journey
                        batch.push({
                            busId: `${bus.busId}_${to}_${from}_${dayOffset + 1}`,
                            from: to,
                            to: from,
                            departureTime: generateRandomTime(returnDate),
                            arrivalTime: generateRandomTime(returnDate),
                            duration: "9h 30m",
                            availableSeats: 28,
                            price: bus.price,
                            originalPrice: bus.originalPrice,
                            company: bus.company,
                            busType: bus.busType,
                            rating: bus.rating,
                            totalReviews: bus.totalReviews,
                            badges: bus.badges,
                            seats: generateSeats(),
                        });

                        // Insert in batches
                        if (batch.length >= BATCH_SIZE) {
                            await Bus.insertMany(batch);
                            console.log(`Inserted ${batch.length} buses...`);
                            batch = [];
                        }
                    }
                }
            }
        }

        // Insert any remaining buses
        if (batch.length > 0) {
            await Bus.insertMany(batch);
            console.log(`Inserted final ${batch.length} buses...`);
        }

        console.log('✅ Database seeded successfully!');
    } catch (error) {
        console.error('❌ Error seeding database:', error);
    } finally {
        mongoose.connection.close();
    }
}

seedDatabase();