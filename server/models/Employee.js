const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    profilePicture: { type: String, default: "" },

    // Job details (HR-editable only)
    designation: { type: String, default: "Employee" },
    department: { type: String, default: "General" },
    dateOfJoining: { type: Date, default: Date.now },

    // Salary structure (HR-editable only)
    salaryStructure: {
      basic: { type: Number, default: 0 },
      hra: { type: Number, default: 0 },
      allowances: { type: Number, default: 0 },
      deductions: { type: Number, default: 0 },
    },

    documents: [
      {
        name: String,
        url: String,
      },
    ],
  },
  { timestamps: true }
);

employeeSchema.virtual("grossSalary").get(function () {
  const s = this.salaryStructure || {};
  return (s.basic || 0) + (s.hra || 0) + (s.allowances || 0);
});

employeeSchema.virtual("netSalary").get(function () {
  const s = this.salaryStructure || {};
  return this.grossSalary - (s.deductions || 0);
});

employeeSchema.set("toJSON", { virtuals: true });
employeeSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Employee", employeeSchema);
