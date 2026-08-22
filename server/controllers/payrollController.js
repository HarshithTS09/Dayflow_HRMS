const Payroll = require("../models/Payroll");
const Employee = require("../models/Employee");

// @route GET /api/payroll/me
const getMyPayroll = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) return res.status(404).json({ message: "Employee profile not found" });

    const records = await Payroll.find({ employee: employee._id }).sort({ payPeriod: -1 });
    res.json(records);
  } catch (err) {
    next(err);
  }
};

// @route GET /api/payroll   (HR only, filterable by employee)
const getAllPayroll = async (req, res, next) => {
  try {
    const { employee } = req.query;
    const filter = {};
    if (employee) filter.employee = employee;

    const records = await Payroll.find(filter)
      .populate({ path: "employee", populate: { path: "user", select: "employeeId email" } })
      .sort({ payPeriod: -1 });

    res.json(records);
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/payroll/:id   (HR only) - update/generate a payroll record
const upsertPayroll = async (req, res, next) => {
  try {
    // :id is either an existing Payroll _id, or the target employeeId when creating fresh
    const { payPeriod, earnings, deductions } = req.body;
    if (!payPeriod || !earnings) {
      return res.status(400).json({ message: "payPeriod and earnings are required" });
    }

    const totalEarnings =
      (earnings.basic || 0) + (earnings.hra || 0) + (earnings.allowances || 0);
    const totalDeductions =
      (deductions?.tax || 0) + (deductions?.providentFund || 0) + (deductions?.other || 0);
    const netSalary = totalEarnings - totalDeductions;

    let record = await Payroll.findById(req.params.id).catch(() => null);

    if (record) {
      record.payPeriod = payPeriod;
      record.earnings = earnings;
      record.deductions = deductions || {};
      record.netSalary = netSalary;
      await record.save();
      return res.json(record);
    }

    // Treat :id as an employee _id and create/update by (employee, payPeriod)
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    record = await Payroll.findOneAndUpdate(
      { employee: employee._id, payPeriod },
      { earnings, deductions: deductions || {}, netSalary },
      { new: true, upsert: true, runValidators: true }
    );

    res.json(record);
  } catch (err) {
    next(err);
  }
};

module.exports = { getMyPayroll, getAllPayroll, upsertPayroll };
