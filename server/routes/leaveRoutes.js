const express = require("express");
const {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  getLeaveById,
  approveLeave,
  rejectLeave,
} = require("../controllers/leaveController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.post("/", protect, applyLeave);
router.get("/me", protect, getMyLeaves);
router.get("/", protect, authorize("hr"), getAllLeaves);
router.get("/:id", protect, getLeaveById);
router.put("/:id/approve", protect, authorize("hr"), approveLeave);
router.put("/:id/reject", protect, authorize("hr"), rejectLeave);

module.exports = router;
