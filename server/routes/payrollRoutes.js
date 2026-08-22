const express = require("express");
const { getMyPayroll, getAllPayroll, upsertPayroll } = require("../controllers/payrollController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.get("/me", protect, getMyPayroll);
router.get("/", protect, authorize("hr"), getAllPayroll);
router.put("/:id", protect, authorize("hr"), upsertPayroll);

module.exports = router;
