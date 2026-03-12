import { Router } from "express";
import * as attendanceController from "../controllers/attendance";

const router = Router();

// delegate to controller functions for cleanliness
router.post("/", attendanceController.punch);
router.get("/report", attendanceController.getReport);
router.get("/absent-today", attendanceController.getAbsentToday);
router.get("/monthly-summary", attendanceController.getMonthlySummary);
router.get("/today", attendanceController.getToday);
router.get("/employees", attendanceController.getEmployees);

export default router;
