// Development-only seed script. Creates demo HR + employee accounts and
// a few sample attendance / leave / payroll records so the app is
// immediately demoable. Run with: npm run seed
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const User = require("./models/User");
const Employee = require("./models/Employee");
const Attendance = require("./models/Attendance");
const LeaveRequest = require("./models/LeaveRequest");
const Payroll = require("./models/Payroll");

const startOfDay = (d = new Date()) => {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x;
};

const run = async () => {
  await connectDB();
  console.log("Clearing existing demo data...");
  await Promise.all([
    User.deleteMany({ email: { $in: ["hr@dayflow.demo", "employee@dayflow.demo"] } }),
  ]);

  const hrPasswordHash = await User.hashPassword("Password123!");
  const empPasswordHash = await User.hashPassword("Password123!");

  const hrUser = await User.create({
    employeeId: "HR001",
    email: "hr@dayflow.demo",
    passwordHash: hrPasswordHash,
    role: "hr",
  });
  const hrEmployee = await Employee.create({
    user: hrUser._id,
    fullName: "Asha Rao",
    designation: "HR Manager",
    department: "Human Resources",
    salaryStructure: { basic: 60000, hra: 15000, allowances: 5000, deductions: 4000 },
  });

  const empUser = await User.create({
    employeeId: "EMP001",
    email: "employee@dayflow.demo",
    passwordHash: empPasswordHash,
    role: "employee",
  });
  const employee = await Employee.create({
    user: empUser._id,
    fullName: "Rahul Verma",
    designation: "Software Engineer",
    department: "Engineering",
    salaryStructure: { basic: 45000, hra: 10000, allowances: 3000, deductions: 2500 },
  });

  // Sample attendance for the last 5 days
  for (let i = 1; i <= 5; i++) {
    const date = startOfDay(new Date(Date.now() - i * 24 * 60 * 60 * 1000));
    const checkIn = new Date(date);
    checkIn.setUTCHours(9, 30, 0, 0);
    const checkOut = new Date(date);
    checkOut.setUTCHours(18, 15, 0, 0);
    await Attendance.create({
      employee: employee._id,
      date,
      checkIn,
      checkOut,
      status: "present",
    });
  }

  // Sample leave request (pending)
  const start = new Date();
  start.setDate(start.getDate() + 3);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  await LeaveRequest.create({
    employee: employee._id,
    leaveType: "sick",
    startDate: start,
    endDate: end,
    days: 2,
    remarks: "Fever, need rest",
    status: "pending",
  });

  // Sample payroll record for current month
  const payPeriod = new Date().toISOString().slice(0, 7); // "YYYY-MM"
  await Payroll.create({
    employee: employee._id,
    payPeriod,
    earnings: { basic: 45000, hra: 10000, allowances: 3000 },
    deductions: { tax: 2000, providentFund: 500, other: 0 },
    netSalary: 45000 + 10000 + 3000 - 2000 - 500,
  });

  console.log("Seed complete.");
  console.log("HR login:       hr@dayflow.demo / Password123!");
  console.log("Employee login: employee@dayflow.demo / Password123!");

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
