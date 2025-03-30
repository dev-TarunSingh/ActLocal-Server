import Services from '../models/Services.js';

export const AddService = async (req, res) => {
  const { name, description, category, servicePrice, location, postedBy } = req.body;
  console.log("got request to add service");
  try {
    const newService = new Services({ name, description, category, servicePrice, location, postedBy });
    await newService.save();
    res.status(201).json({ message: 'Service added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding service: ' + error.message });
  }
};

export const NearbyServices = async (req, res) => {
    const { longitude, latitude } = req.body;
    try {
        const services = await Services.find({
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [longitude, latitude]
                    },
                    $maxDistance: 20000
                }
            }
        }).populate("postedBy", "firstName _id");
        res.status(200).json({ services });
    }
    catch (error) {
        res.status(401).json({ message: 'Error fetching services: ' + error.message });
    }
};

export const RemoveServices = async (req, res) => {
    const { serviceId } = req.body;
    try {
        const service = await Services.findById(serviceId);
        if (!service) {
            res.status(404).json({ message: 'Service not found' });
        }
        else {
            await Services.deleteOne({ _id: serviceId });
            res.status(200).json({ message: 'Service removed successfully' });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Error removing service: ' + error.message });
    }

};

export const MyServices = async (req, res) => {
    const { user } = req.body;
    try {
        const posts = await Services.find({ postedBy : user});
        res.status(200).json({message: "Found Some Posts", posts: posts})
    }
    catch (error) {
        res.status(500).json({message : "Error Finding Your Posts!"})
    }
}