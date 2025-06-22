import Bus from '../model/bus.js'

export const getBusDetails = async (req, res) => {
    try {
        const { busId } = req.params;

        if (!busId) {
            return res.status(400).json({ error: "Bus ID is required" });
        }

        const bus = await Bus.findOne({ busId });

        if (!bus) {
            return res.status(404).json({ error: "Bus not found" });
        }

        res.status(200).json({
            success: true,
            data: bus
        });

    } catch (error) {
        console.error("Error fetching bus details : ", error);
        res.status(500).json({ error: "Error fetching bus details" })
    }
}

export const searchBuses = async (req, res) => {

    try {
        const {from ,to  ,date} = req.body;

        if(!from || !to || !date){
            return res.status(400).json({error : "form , jo and date is required!"});
        };
        const selectedDate = new Date(date);
        const startOfDay = new Date(selectedDate.setHours(0,0,0,0));
        const endOfDay = new Date(selectedDate.setHours(23,59,59,999));

        const buses = await Bus.find({
            from,
            to,
            departureTime : {$gte : startOfDay , $lte : endOfDay},
        });

        return res.status(200).json({sucess : true,data : buses});


    } catch (error) {
        console.error("Erorr searching buses : ", error);
        return res.status(500).json({ error: "An Internal Server Error Occured!" })
    }
}