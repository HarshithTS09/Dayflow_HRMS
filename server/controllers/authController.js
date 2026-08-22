const User = require("../models/User");
const Employee = require("../models/Employee");
const generateToken = require("../utils/generateToken");

// @route POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { employeeId, email, password, role, fullName } = req.body;

    if (!employeeId || !email || !password || !fullName) {
      return res.status(400).json({ message: "employeeId, fullName, email and password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }
    const safeRole = role === "hr" ? "hr" : "employee";

    const existing = await User.findOne({ $or: [{ email: email.toLowerCase() }, { employeeId }] });
    if (existing) {
      return res.status(409).json({ message: "A user with this email or employee ID already exists" });
    }

    const passwordHash = await User.hashPassword(password);
    const user = await User.create({ employeeId, email, passwordHash, role: safeRole });

    await Employee.create({ user: user._id, fullName });

    const token = generateToken(user._id);
    res.status(201).json({
      token,
      user: { id: user._id, employeeId: user.employeeId, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+passwordHash");
    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const match = await user.comparePassword(password);
    if (!match) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user._id);
    res.json({
      token,
      user: { id: user._id, employeeId: user.employeeId, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    res.json({
      user: {
        id: req.user._id,
        employeeId: req.user.employeeId,
        email: req.user.email,
        role: req.user.role,
      },
      employee,
    });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/auth/logout
// Stateless JWT: logout is handled client-side by discarding the token.
// This endpoint exists so the frontend has a consistent call to make.
const logout = async (_req, res) => {
  res.json({ message: "Logged out" });
};

module.exports = { register, login, getMe, logout };
