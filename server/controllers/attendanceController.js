const Attendance = require("../models/Attendance");
const Employee = require("../models/Employee");

const startOfDay = (d = new Date()) => {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x;
};

const getSelfEmployee = async (userId) => Employee.findOne({ user: userId });

// @route POST /api/attendance/check-in
const checkIn = async (req, res, next) => {
  try {
    const employee = await getSelfEmployee(req.user._id);
    if (!employee) return res.status(404).json({ message: "Employee profile not found" });

    const today = startOfDay();
    let record = await Attendance.findOne({ employee: employee._id, date: today });

    if (record && record.checkIn) {
      return res.status(409).json({ message: "Already checked in today" });
    }

    if (!record) {
      record = await Attendance.create({
        employee: employee._id,
        date: today,
        checkIn: new Date(),
        status: "present",
      });
    } else {
      record.checkIn = new Date();
      record.status = "present";
      await record.save();
    }

    res.status(201).json(record);
  } catch (err) {
    next(err);
  }
};

// @route POST /api/attendance/check-out
const checkOut = async (req, res, next) => {
  try {
    const employee = await getSelfEmployee(req.user._id);
    if (!employee) return res.status(404).json({ message: "Employee profile not found" });

    const today = startOfDay();
    const record = await Attendance.findOne({ employee: employee._id, date: today });

    if (!record || !record.checkIn) {
      return res.status(400).json({ message: "You must check in before checking out" });
    }
    if (record.checkOut) {
      return res.status(409).json({ message: "Already checked out today" });
    }

    record.checkOut = new Date();

    // Simple half-day heuristic: less than 4 hours between check-in and check-out
    const hours = (record.checkOut - record.checkIn) / (1000 * 60 * 60);
    if (hours < 4) record.status = "half-day";

    await record.save();
    res.json(record);
  } catch (err) {
    next(err);
  }
};

// @route GET /api/attendance/me
const getMyAttendance = async (req, res, next) => {
  try {
    const employee = await getSelfEmployee(req.user._id);
    if (!employee) return res.status(404).json({ message: "Employee profile not found" });

    const { from, to } = req.query;
    const filter = { employee: employee._id };
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = startOfDay(new Date(from));
      if (to) filter.date.$lte = startOfDay(new Date(to));
    }

    const records = await Attendance.find(filter).sort({ date: -1 });
    res.json(records);
  } catch (err) {
    next(err);
  }
};

// @route GET /api/attendance   (HR only, all employees, filterable)
const getAllAttendance = async (req, res, next) => {
  try {
    const { employee, date, status } = req.query;
    const filter = {};
    if (employee) filter.employee = employee;
    if (status) filter.status = status;
    if (date) filter.date = startOfDay(new Date(date));

    const records = await Attendance.find(filter)
      .populate({ path: "employee", populate: { path: "user", select: "employeeId email" } })
      .sort({ date: -1 });

    res.json(records);
  } catch (err) {
    next(err);
  }
};

module.exports = { checkIn, checkOut, getMyAttendance, getAllAttendance };
