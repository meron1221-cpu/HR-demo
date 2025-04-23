"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiPlus,
  FiX,
  FiMail,
  FiBell,
  FiSave,
  FiPrinter,
} from "react-icons/fi";
import { toast, Toaster } from "react-hot-toast";
import {
  getLeaveRequests,
  updateLeaveRequestStatus,
  addLeaveRequest,
} from "../../Leave/leave-request/page";

// Shared state for notifications
let globalNotifications: any[] = [];

export function getNotifications() {
  return globalNotifications;
}

export function addNotification(notification: any) {
  globalNotifications = [...globalNotifications, notification];
}

export function markNotificationsAsRead() {
  globalNotifications = globalNotifications.map((n) => ({
    ...n,
    read: true,
  }));
}

const detectCriticalPeriod = (team: string, leaveDates: Date[]) => {
  const now = new Date();
  const nextTwoWeeks = new Date(now);
  nextTwoWeeks.setDate(now.getDate() + 14);

  return leaveDates.some(
    (date) =>
      date >= now &&
      date <= nextTwoWeeks &&
      date.getDay() !== 0 &&
      date.getDay() !== 6
  );
};

export default function LeaveApprovalHRPage() {
  const [activeTab, setActiveTab] = useState("Current");
  const [showOnLeaveTable, setShowOnLeaveTable] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState<Record<number, string>>(
    {}
  );
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [teamLeaveCounts, setTeamLeaveCounts] = useState<
    Record<string, number>
  >({});
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(getNotifications());

  const [formData, setFormData] = useState({
    employee: "",
    noDays: "",
    daysType: "Full Day",
    decision: "",
    leaveStart: "",
    returnDay: "",
    leaveNo: "",
    totalLeaveDays: "",
    leaveBalances: [
      { year: "", initial: "", current: "" },
      { year: "", initial: "", current: "" },
    ],
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const allEmployees = getLeaveRequests();
  const employees =
    activeTab === "Current"
      ? allEmployees.filter((emp) => emp.status === "Approved" && !emp.hrStatus)
      : allEmployees.filter(
          (emp) => emp.hrStatus === "Approved" || emp.hrStatus === "Rejected"
        );

  const employeesOnLeave = allEmployees.filter(
    (employee) => employee.hrStatus === "Approved"
  );

  useEffect(() => {
    const counts: Record<string, number> = {};
    allEmployees.forEach((emp) => {
      if (emp.team) {
        counts[emp.team] = (counts[emp.team] || 0) + 1;
      }
    });
    setTeamLeaveCounts(counts);
  }, [allEmployees]);

  useEffect(() => {
    // Check for department approved requests and add notifications
    const deptApprovedRequests = allEmployees.filter(
      (emp) => emp.status === "Approved" && !emp.hrStatus
    );

    deptApprovedRequests.forEach((request) => {
      const notificationExists = globalNotifications.some(
        (n) => n.type === "dept_approved" && n.requestId === request.id
      );

      if (!notificationExists) {
        addNotification({
          id: Date.now(),
          title: "Department Approved Leave",
          message: `${request.name}'s leave request was approved by department`,
          type: "dept_approved",
          requestId: request.id,
          read: false,
          timestamp: new Date(),
        });
      }
    });

    setNotifications(getNotifications());
  }, [allEmployees]);

  const handleApproval = (employeeId: number, status: string) => {
    updateLeaveRequestStatus(employeeId, status, true); // true indicates this is HR approval
    setApprovalStatus((prev) => ({ ...prev, [employeeId]: status }));

    toast.success(`Leave ${status.toLowerCase()} by HR successfully!`, {
      position: "top-center",
      icon: status === "Approved" ? "✅" : "❌",
    });

    const employee = allEmployees.find((emp) => emp.id === employeeId);
    if (employee) {
      sendEmailNotification(employee, status);

      // Notification for HR page
      addNotification({
        id: Date.now(),
        title: `HR ${status} Leave`,
        message: `Leave request for ${employee.name} (ID: ${
          employee.id
        }) has been ${status.toLowerCase()} by HR`,
        type: "hr_status_update",
        requestId: employee.id,
        read: false,
        timestamp: new Date(),
      });

      // Specific notification for department approval page
      addNotification({
        id: Date.now() + 1,
        title: `HR Decision - ${status}`,
        message: `HR has ${status.toLowerCase()} the leave request for ${
          employee.name
        } (ID: ${employee.id})`,
        type: "department_notification",
        requestId: employee.id,
        read: false,
        timestamp: new Date(),
        employeeId: employee.id,
        employeeName: employee.name,
        decision: status,
        leaveType: employee.leaveType,
        leaveDates: `${employee.leaveStart} to ${employee.returnDay}`,
      });
    }

    checkForCriticalPeriodAlerts(employeeId, status);
  };

  const sendEmailNotification = (employee: any, status: string) => {
    const emailContent = `
      To: meronnisrane@gmail.com
      Subject: HR Leave Decision - ${status} - ${employee.name} (ID: ${
      employee.id
    })
      
      Dear HR Manager,
      
      The leave request for ${employee.name} (Employee ID: ${
      employee.employeeId
    }) has been ${status.toLowerCase()} by HR.
      
      Request Details:
      - Type: ${employee.leaveType}
      - Dates: ${employee.leaveStart} to ${employee.returnDay}
      - Days: ${employee.days || "N/A"}
      - Team: ${employee.team || "N/A"}
      - Description: ${employee.description || "None provided"}
      - Department Decision: ${employee.status || "Pending"}
      
      HR Decision: ${status}
      ${formData.decision ? `HR Remarks: ${formData.decision}` : ""}
      
      Please inform the employee about this decision.
      
      Regards,
      Leave Management System
    `;
    console.log("Email sent to meronnisrane@gmail.com:\n", emailContent);
  };

  const checkForCriticalPeriodAlerts = (employeeId: number, status: string) => {
    if (status !== "Approved") return;

    const employee = allEmployees.find((emp) => emp.id === employeeId);
    if (!employee || !employee.team) return;

    if (teamLeaveCounts[employee.team] > 3) {
      const alertMessage = `⚠️ Warning: Multiple leaves from ${employee.team} team during critical period!`;
      toast(alertMessage, {
        position: "top-center",
        duration: 5000,
        icon: "⚠️",
      });

      addNotification({
        id: Date.now(),
        title: "Critical Period Alert",
        message: alertMessage,
        type: "critical_alert",
        read: false,
        timestamp: new Date(),
      });
    }
  };

  const handleEdit = (employee: any) => {
    setEditingEmployee(employee);
    setFormData({
      employee: employee.employeeId || "",
      noDays: employee.days?.toString() || "",
      daysType: employee.dayType === "half" ? "Half Day" : "Full Day",
      decision: employee.hrStatus || "",
      leaveStart: employee.leaveStart || "",
      returnDay: employee.returnDay || "",
      leaveNo: employee.leaveNo || "",
      totalLeaveDays: employee.totalLeaveDays?.toString() || "",
      leaveBalances: [
        { year: "2016", initial: "20.0", current: "10.0" },
        { year: "2017", initial: "21.0", current: "21.0" },
      ],
    });
    setShowEditForm(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      });
    }
  };

  const handleDaysChange = (amount: number) => {
    const currentDays = parseFloat(formData.noDays) || 0;
    const newDays = Math.max(0, currentDays + amount);
    setFormData({
      ...formData,
      noDays: newDays.toFixed(1),
    });
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.employee.trim()) errors.employee = "Employee is required";
    if (!formData.leaveStart)
      errors.leaveStart = "Leave start date is required";
    if (!formData.returnDay) errors.returnDay = "Return day is required";
    if (!formData.decision) errors.decision = "Decision is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm() && editingEmployee) {
      handleApproval(editingEmployee.id, formData.decision);
      setShowEditForm(false);
    }
  };

  const handleMarkNotificationsAsRead = () => {
    markNotificationsAsRead();
    setNotifications(getNotifications());
  };

  return (
    <div className="min-h-screen p-6 font-sans relative">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-[#3c8dbc]/10 to-purple-50 opacity-30"></div>
      </div>

      <Toaster position="top-center" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div className="flex flex-col gap-4">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#2c6da4] to-[#3c8dbc]">
              HR Leave Approval
            </h1>
            <div className="flex gap-2">
              {["Current", "History"].map((tab) => (
                <motion.button
                  key={tab}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-md text-sm font-medium relative overflow-hidden ${
                    activeTab === tab
                      ? "bg-gradient-to-r from-[#3c8dbc] text-white shadow-lg shadow-[#3c8dbc]/20"
                      : "bg-white text-[#3c8dbc] hover:bg-[#3c8dbc]/10"
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.span
                      layoutId="tabIndicator"
                      className="absolute inset-0 rounded-md"
                      transition={{
                        type: "spring",
                        bounce: 0.2,
                        duration: 0.6,
                      }}
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </div>
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.1, rotate: 10 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (!showNotifications) {
                  handleMarkNotificationsAsRead();
                }
              }}
              className="p-2 rounded-full bg-[#3c8dbc]/10 text-[#3c8dbc] hover:bg-[#3c8dbc]/20 transition-all duration-300 relative shadow-sm"
            >
              <FiBell size={20} />
              {notifications.filter((n) => !n.read).length > 0 && (
                <motion.span
                  className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  {notifications.filter((n) => !n.read).length}
                </motion.span>
              )}
            </motion.button>
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl overflow-hidden z-50 border border-gray-200"
                >
                  <div className="p-3 bg-[#3c8dbc] text-white">
                    <h3 className="text-sm font-medium">Notifications</h3>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-4 text-center text-sm text-gray-500"
                      >
                        No notifications
                      </motion.div>
                    ) : (
                      notifications.map((notification) => (
                        <motion.div
                          key={notification.id}
                          className={`p-3 border-b border-gray-100 ${
                            !notification.read ? "bg-blue-50" : ""
                          }`}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="text-sm font-medium text-gray-800">
                            {notification.title}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            {notification.message}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {new Date(notification.timestamp).toLocaleString()}
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-lg rounded-xl border border-[#3c8dbc]/30 shadow-xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#3c8dbc]/30">
                  {[
                    "Employee Name",
                    "Employee ID",
                    "Team",
                    "Leave Type",
                    "Leave Start",
                    "Return Day",
                    "Dept Status",
                    "HR Status",
                    "HR Action",
                  ].map((header) => (
                    <th
                      key={header}
                      className="text-left py-4 px-6 text-[#3c8dbc] uppercase text-xs font-semibold tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {employees.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="py-12 text-center text-[#3c8dbc]"
                    >
                      No leave requests found
                    </td>
                  </tr>
                ) : (
                  employees.map((employee) => (
                    <tr
                      key={employee.id}
                      className="border-b border-[#3c8dbc]/10 last:border-0 hover:bg-[#3c8dbc]/5"
                    >
                      <td className="py-4 px-6 font-medium">{employee.name}</td>
                      <td className="py-4 px-6 text-gray-800">
                        {employee.employeeId}
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          {employee.team || "N/A"}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            employee.leaveType === "Annual"
                              ? "bg-green-100 text-green-800"
                              : employee.leaveType === "Sick"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {employee.leaveType}
                        </span>
                      </td>
                      <td className="py-4 px-6">{employee.leaveStart}</td>
                      <td className="py-4 px-6">{employee.returnDay}</td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-3 py-1 rounded-md text-xs font-medium ${
                            employee.status === "Approved"
                              ? "bg-green-100 text-green-800"
                              : employee.status === "Rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {employee.status || "Pending"}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {employee.hrStatus ? (
                          <span
                            className={`px-3 py-1 rounded-md text-xs font-medium ${
                              employee.hrStatus === "Approved"
                                ? "bg-green-100 text-green-800"
                                : employee.hrStatus === "Rejected"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {employee.hrStatus}
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-md text-xs font-medium bg-yellow-100 text-yellow-800">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          {activeTab === "Current" && !employee.hrStatus && (
                            <button
                              onClick={() => handleEdit(employee)}
                              className="text-[#3c8dbc] text-xs underline hover:text-[#3c8dbc]/80 transition-colors"
                            >
                              Review
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="bg-white/80 backdrop-blur-lg rounded-xl border border-[#3c8dbc]/30 shadow-xl overflow-hidden"
          >
            <div
              className="p-4 cursor-pointer flex justify-between items-center"
              onClick={() => setShowOnLeaveTable(!showOnLeaveTable)}
            >
              <h2 className="text-lg font-semibold text-[#3c8dbc]">
                Employees On Leave ({employeesOnLeave.length})
              </h2>
              <motion.div
                animate={{ rotate: showOnLeaveTable ? 180 : 0 }}
                className="text-[#3c8dbc] transition-transform"
              >
                ▼
              </motion.div>
            </div>
            {showOnLeaveTable && (
              <div className="p-4 border-t border-[#3c8dbc]/30">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#3c8dbc]/30">
                        <th className="text-left py-3 px-4 text-[#3c8dbc] uppercase text-xs font-semibold">
                          NO
                        </th>
                        <th className="text-left py-3 px-4 text-[#3c8dbc] uppercase text-xs font-semibold">
                          Employee ID
                        </th>
                        <th className="text-left py-3 px-4 text-[#3c8dbc] uppercase text-xs font-semibold">
                          Full Name
                        </th>
                        <th className="text-left py-3 px-4 text-[#3c8dbc] uppercase text-xs font-semibold">
                          Leave Type
                        </th>
                        <th className="text-left py-3 px-4 text-[#3c8dbc] uppercase text-xs font-semibold">
                          Leave Start
                        </th>
                        <th className="text-left py-3 px-4 text-[#3c8dbc] uppercase text-xs font-semibold">
                          Return Day
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {employeesOnLeave.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="py-8 text-center text-[#3c8dbc] italic"
                          >
                            No employees currently on leave
                          </td>
                        </tr>
                      ) : (
                        employeesOnLeave.map((employee, index) => (
                          <tr
                            key={employee.id}
                            className="border-b border-[#3c8dbc]/10 last:border-0"
                          >
                            <td className="py-3 px-4">{index + 1}</td>
                            <td className="py-3 px-4 text-gray-800">
                              {employee.employeeId}
                            </td>
                            <td className="py-3 px-4">{employee.name}</td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                  employee.leaveType === "Annual"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-purple-100 text-purple-800"
                                }`}
                              >
                                {employee.leaveType}
                              </span>
                            </td>
                            <td className="py-3 px-4">{employee.leaveStart}</td>
                            <td className="py-3 px-4">{employee.returnDay}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>

        <AnimatePresence>
          {showEditForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowEditForm(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b border-gray-200 bg-[#3c8dbc] text-white flex justify-between items-center">
                    <motion.h2
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="text-xl font-bold"
                    >
                      Leave Approval Form
                    </motion.h2>
                    <button
                      onClick={() => setShowEditForm(false)}
                      className="text-white hover:text-gray-200 transition-colors"
                    >
                      <FiX size={24} />
                    </button>
                  </div>

                  <div className="overflow-y-auto px-6 py-4 max-h-[70vh]">
                    <form onSubmit={handleSubmit}>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-4"
                      >
                        {/* Employee Info */}
                        <div className="flex items-center">
                          <label className="w-32 text-sm font-medium text-gray-700">
                            Employee:
                          </label>
                          <input
                            type="text"
                            name="employee"
                            value={formData.employee}
                            onChange={handleInputChange}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3c8dbc]"
                            placeholder="Enter employee ID"
                          />
                        </div>

                        {/* No. Days */}
                        <div className="flex items-center">
                          <label className="w-32 text-sm font-medium text-gray-700">
                            No. Days:
                          </label>
                          <div className="flex-1 flex items-center">
                            <input
                              type="text"
                              name="noDays"
                              value={formData.noDays}
                              onChange={handleInputChange}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3c8dbc]"
                              placeholder="Enter number of days"
                            />
                            <div className="flex flex-col ml-2">
                              <button
                                type="button"
                                onClick={() => handleDaysChange(0.5)}
                                className="px-2 bg-[#3c8dbc] text-white rounded-t-md hover:bg-[#3c8dbc]/90"
                              >
                                +
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDaysChange(-0.5)}
                                className="px-2 bg-[#3c8dbc] text-white rounded-b-md hover:bg-[#3c8dbc]/90"
                              >
                                -
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Days Type */}
                        <div className="flex items-center">
                          <label className="w-32 text-sm font-medium text-gray-700">
                            Days:
                          </label>
                          <select
                            name="daysType"
                            value={formData.daysType}
                            onChange={handleInputChange}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3c8dbc]"
                          >
                            <option value="Full Day">Full Day</option>
                            <option value="Half Day">Half Day</option>
                          </select>
                        </div>

                        {/* Decision */}
                        <div className="flex items-center">
                          <label className="w-32 text-sm font-medium text-gray-700">
                            Decision:
                          </label>
                          <select
                            name="decision"
                            value={formData.decision}
                            onChange={handleInputChange}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3c8dbc]"
                            required
                          >
                            <option value="">--- Select Decision ---</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        </div>

                        {/* Leave Start */}
                        <div className="flex items-center">
                          <label className="w-32 text-sm font-medium text-gray-700">
                            Leave Start:
                          </label>
                          <input
                            type="date"
                            name="leaveStart"
                            value={formData.leaveStart}
                            onChange={handleInputChange}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3c8dbc]"
                          />
                        </div>

                        {/* Return Day */}
                        <div className="flex items-center">
                          <label className="w-32 text-sm font-medium text-gray-700">
                            Return Day:
                          </label>
                          <input
                            type="date"
                            name="returnDay"
                            value={formData.returnDay}
                            onChange={handleInputChange}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3c8dbc]"
                          />
                        </div>

                        {/* Leave No */}
                        <div className="flex items-center">
                          <label className="w-32 text-sm font-medium text-gray-700">
                            No:
                          </label>
                          <input
                            type="text"
                            name="leaveNo"
                            value={formData.leaveNo}
                            onChange={handleInputChange}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3c8dbc]"
                            placeholder="Enter leave number"
                          />
                        </div>

                        {/* Total Leave Days */}
                        <div className="flex items-center">
                          <label className="w-32 text-sm font-medium text-gray-700">
                            Total Leave Days:
                          </label>
                          <input
                            type="text"
                            name="totalLeaveDays"
                            value={formData.totalLeaveDays}
                            onChange={handleInputChange}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3c8dbc]"
                            placeholder="Enter total leave days"
                          />
                        </div>

                        {/* Leave Balances */}
                        <div className="mt-4">
                          <h3 className="text-sm font-medium text-gray-700 mb-2">
                            Leave Balances:
                          </h3>
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-[#3c8dbc]/10">
                                <th className="border border-[#3c8dbc]/30 px-2 py-1 text-xs font-medium text-[#3c8dbc]">
                                  No
                                </th>
                                <th className="border border-[#3c8dbc]/30 px-2 py-1 text-xs font-medium text-[#3c8dbc]">
                                  Leave Year
                                </th>
                                <th className="border border-[#3c8dbc]/30 px-2 py-1 text-xs font-medium text-[#3c8dbc]">
                                  Initial
                                </th>
                                <th className="border border-[#3c8dbc]/30 px-2 py-1 text-xs font-medium text-[#3c8dbc]">
                                  Current
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {formData.leaveBalances.map((balance, index) => (
                                <tr
                                  key={index}
                                  className="hover:bg-[#3c8dbc]/5"
                                >
                                  <td className="border border-[#3c8dbc]/30 px-2 py-1 text-center">
                                    {index + 1}
                                  </td>
                                  <td className="border border-[#3c8dbc]/30 px-2 py-1">
                                    <input
                                      type="text"
                                      value={balance.year}
                                      onChange={(e) => {
                                        const newBalances = [
                                          ...formData.leaveBalances,
                                        ];
                                        newBalances[index].year =
                                          e.target.value;
                                        setFormData({
                                          ...formData,
                                          leaveBalances: newBalances,
                                        });
                                      }}
                                      className="w-full text-center bg-transparent focus:outline-none"
                                      placeholder="Year"
                                    />
                                  </td>
                                  <td className="border border-[#3c8dbc]/30 px-2 py-1">
                                    <input
                                      type="text"
                                      value={balance.initial}
                                      onChange={(e) => {
                                        const newBalances = [
                                          ...formData.leaveBalances,
                                        ];
                                        newBalances[index].initial =
                                          e.target.value;
                                        setFormData({
                                          ...formData,
                                          leaveBalances: newBalances,
                                        });
                                      }}
                                      className="w-full text-center bg-transparent focus:outline-none"
                                      placeholder="Initial"
                                    />
                                  </td>
                                  <td className="border border-[#3c8dbc]/30 px-2 py-1">
                                    <input
                                      type="text"
                                      value={balance.current}
                                      onChange={(e) => {
                                        const newBalances = [
                                          ...formData.leaveBalances,
                                        ];
                                        newBalances[index].current =
                                          e.target.value;
                                        setFormData({
                                          ...formData,
                                          leaveBalances: newBalances,
                                        });
                                      }}
                                      className="w-full text-center bg-transparent focus:outline-none"
                                      placeholder="Current"
                                    />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Print Option */}
                        <div className="flex items-center mt-4">
                          <input
                            type="checkbox"
                            id="printLeaveCopy"
                            className="form-checkbox h-4 w-4 text-[#3c8dbc] rounded"
                          />
                          <label
                            htmlFor="printLeaveCopy"
                            className="ml-2 text-sm text-gray-700"
                          >
                            Print Leave Copy
                          </label>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-3 mt-6">
                          <button
                            type="button"
                            onClick={() => setShowEditForm(false)}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors flex items-center gap-2"
                          >
                            <FiX /> Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 bg-[#3c8dbc] text-white rounded-md hover:bg-[#3c8dbc]/90 transition-colors flex items-center gap-2"
                          >
                            <FiSave /> Save
                          </button>
                        </div>
                      </motion.div>
                    </form>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
