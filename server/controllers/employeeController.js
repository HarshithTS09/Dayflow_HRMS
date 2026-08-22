const Employee = require("../models/Employee");
const User = require("../models/User");

// @route GET /api/employees   (HR only)
const getEmployees = async (req, res, next) => {
  try {
    const { search } = req.query;
    const employees = await Employee.find().populate("user", "employeeId email role isActive");

    let result = employees;
    if (search) {
      const q = search.toLowerCase();
      result = employees.filter(
        (e) =>
          e.fullName.toLowerCase().includes(q) ||
          (e.user && e.user.employeeId.toLowerCase().includes(q))
      );
    }
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// @route GET /api/employees/:id
// Employee can only fetch their own record; HR can fetch any.
const getEmployeeById = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id).populate(
      "user",
      "employeeId email role isActive"
    );
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    if (req.user.role !== "hr" && String(employee.user._id) !== String(req.user._id)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    res.json(employee);
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/employees/:id
// Employees may only edit address/phone/profilePicture on their own record.
// HR may edit any field on any record.
const updateEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    const isSelf = String(employee.user) === String(req.user._id);
    const isHr = req.user.role === "hr";

    if (!isSelf && !isHr) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (isHr) {
      const { fullName, phone, address, profilePicture, designation, department, salaryStructure } =
        req.body;
      if (fullName !== undefined) employee.fullName = fullName;
      if (phone !== undefined) employee.phone = phone;
      if (address !== undefined) employee.address = address;
      if (profilePicture !== undefined) employee.profilePicture = profilePicture;
      if (designation !== undefined) employee.designation = designation;
      if (department !== undefined) employee.department = department;
      if (salaryStructure !== undefined) {
        employee.salaryStructure = { ...employee.salaryStructure.toObject(), ...salaryStructure };
      }
    } else {
      // Employee editing their own profile: restricted field set only
      const { phone, address, profilePicture } = req.body;
      if (phone !== undefined) employee.phone = phone;
      if (address !== undefined) employee.address = address;
      if (profilePicture !== undefined) employee.profilePicture = profilePicture;
    }

    await employee.save();
    res.json(employee);
  } catch (err) {
    next(err);
  }
};

module.exports = { getEmployees, getEmployeeById, updateEmployee };
