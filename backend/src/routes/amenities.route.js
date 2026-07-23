import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware.js"
import { approveAmenityBooking, bookAmenity, cancelAmenityBooking, createAmenity, getAmenities, getAmenityBookings, populateAmenities, rejectAmenityBooking } from "../controllers/amenities.controller.js";

const amenitiesRouter = Router();

// Amenities
amenitiesRouter.get("/get-amenities", authMiddleware, getAmenities);
amenitiesRouter.post("/populate", authMiddleware, populateAmenities);
amenitiesRouter.post("/create", authMiddleware, createAmenity);

// Bookings
amenitiesRouter.get("/get-amenity-bookings", authMiddleware, getAmenityBookings);
amenitiesRouter.post("/book", authMiddleware, bookAmenity);
amenitiesRouter.patch("/approve/:bookingId", authMiddleware, approveAmenityBooking);
amenitiesRouter.patch("/reject/:bookingId", authMiddleware, rejectAmenityBooking);
amenitiesRouter.patch("/cancel/:bookingId", authMiddleware, cancelAmenityBooking);

export default amenitiesRouter;