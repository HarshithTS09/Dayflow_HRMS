const LeaveRequest = require("../models/LeaveRequest");
const Employee = require("../models/Employee");

const msPerDay = 1000 * 60 * 60 * 24;

// @route POST /api/leave
const applyLeave = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) return res.status(404).json({ message: "Employee profile not found" });

    const { leaveType, startDate, endDate, remarks } = req.body;
    if (!leaveType || !startDate || !endDate) {
      return res.status(400).json({ message: "leaveType, startDate and endDate are required" });
    }
    if (!["paid", "sick", "unpaid"].includes(leaveType)) {
      return res.status(400).json({ message: "Invalid leave type" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ message: "Invalid date(s)" });
    }
    if (end < start) {
      return res.status(400).json({ message: "End date cannot be before start date" });
    }

    const days = Math.round((end - start) / msPerDay) + 1;

    const leave = await LeaveRequest.create({
      employee: employee._id,
      leaveType,
      startDate: start,
      endDate: end,
      days,
      remarks: remarks || "",
    });

    res.status(201).json(leave);
  } catch (err) {
    next(err);
  }
};

// @route GET /api/leave/me
const getMyLeaves = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) return res.status(404).json({ message: "Employee profile not found" });

    const leaves = await LeaveRequest.find({ employee: employee._id }).sort({ createdAt: -1 });
    res.json(leaves);
  } catch (err) {
    next(err);
  }
};

// @route GET /api/leave   (HR only, filterable)
const getAllLeaves = async (req, res, next) => {
  try {
    const { status, leaveType, employee } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (leaveType) filter.leaveType = leaveType;
    if (employee) filter.employee = employee;

    const leaves = await LeaveRequest.find(filter)
      .populate({ path: "employee", populate: { path: "user", select: "employeeId email" } })
      .sort({ createdAt: -1 });

    res.json(leaves);
  } catch (err) {
    next(err);
  }
};

// @route GET /api/leave/:id
const getLeaveById = async (req, res, next) => {
  try {
    const leave = await LeaveRequest.findById(req.params.id).populate({
      path: "employee",
      populate: { path: "user", select: "employeeId email" },
    });
    if (!leave) return res.status(404).json({ message: "Leave request not found" });

    const isOwner = String(leave.employee.user._id) === String(req.user._id);
    if (req.user.role !== "hr" && !isOwner) {
      return res.status(403).json({ message: "Forbidden" });
    }

    res.json(leave);
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/leave/:id/approve   (HR only)
const approveLeave = async (req, res, next) => {
  try {
    const leave = await LeaveRequest.findById(req.params.id);
    if (!leave) return res.status(404).json({ message: "Leave request not found" });
    if (leave.status !== "pending") {
      return res.status(409).json({ message: `Leave already ${leave.status}` });
    }

    leave.status = "approved";
    leave.hrComment = req.body.comment || "";
    leave.reviewedBy = req.user._id;
    leave.reviewedAt = new Date();
    await leave.save();

    res.json(leave);
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/leave/:id/reject   (HR only)
const rejectLeave = async (req, res, next) => {
  try {
    const leave = await LeaveRequest.findById(req.params.id);
    if (!leave) return res.status(404).json({ message: "Leave request not found" });
    if (leave.status !== "pending") {
      return res.status(409).json({ message: `Leave already ${leave.status}` });
    }

    leave.status = "rejected";
    leave.hrComment = req.body.comment || "";
    leave.reviewedBy = req.user._id;
    leave.reviewedAt = new Date();
    await leave.save();

    res.json(leave);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  getLeaveById,
  approveLeave,
  rejectLeave,
};
