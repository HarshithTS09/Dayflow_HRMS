const express = require("express");
const { getEmployees, getEmployeeById, updateEmployee } = require("../controllers/employeeController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.get("/", protect, authorize("hr"), getEmployees);
router.get("/:id", protect, getEmployeeById);
router.put("/:id", protect, updateEmployee);

module.exports = router;
