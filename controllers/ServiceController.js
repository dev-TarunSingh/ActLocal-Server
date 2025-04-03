import Services from '../models/Services.js';
import mongoose from 'mongoose';

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
    try {
      const { serviceId } = req.body; // Ensure the client sends the serviceId in the request body
      console.log("got request to remove service with id", serviceId);
      if (!serviceId) {
        return res.status(400).json({ message: "Service ID is required" });
      }
  
      const result = await Services.findByIdAndDelete(serviceId);

      if (!result) {
        return res.status(404).json({ message: "Service not found" });
      }
  
      res.status(200).json({ message: "Service deleted successfully" });
    } catch (error) {
      console.error("Error deleting service:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

export const MyServices = async (req, res) => {
    console.log("got request to find my services");
    const { user } = req.query;
    try {
        const posts = await Services.find({ postedBy : user});
        console.log(posts);
        res.status(200).json({message: "Found Some Posts", posts: posts})
    }
    catch (error) {
        res.status(500).json({message : "Error Finding Your Posts!"})
    }
}