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

export default function LeaveApprovalPage() {
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
    name: "",
    requestDays: "0",
    halfFullDay: "Full Day",
    description: "",
    leaveType: "Annual",
    leaveStart: "",
    leaveEnd: "",
    approvedDays: "0",
    remark: "",
    decision: "",
    team: "Engineering",
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const allEmployees = getLeaveRequests();
  const employees =
    activeTab === "Current"
      ? allEmployees.filter((emp) => !emp.status || emp.status === "Pending")
      : allEmployees.filter(
          (emp) => emp.status === "Approved" || emp.status === "Rejected"
        );

  const employeesOnLeave = allEmployees.filter(
    (employee) => employee.status === "Approved"
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
    // Check for new leave requests and add notifications
    const pendingRequests = allEmployees.filter(
      (emp) => !emp.status || emp.status === "Pending"
    );

    pendingRequests.forEach((request) => {
      const notificationExists = globalNotifications.some(
        (n) => n.type === "new_request" && n.requestId === request.id
      );

      if (!notificationExists) {
        addNotification({
          id: Date.now(),
          title: "New Leave Request",
          message: `${request.name} (ID: ${request.employeeId}) has submitted a ${request.leaveType} leave request`,
          type: "new_request",
          requestId: request.id,
          read: false,
          timestamp: new Date(),
        });
      }
    });

    setNotifications(getNotifications());
  }, [allEmployees]);

  const handleApproval = (employeeId: number, status: string) => {
    setApprovalStatus((prev) => ({ ...prev, [employeeId]: status }));
    updateLeaveRequestStatus(employeeId, status);

    toast.success(`Leave ${status.toLowerCase()} successfully!`, {
      position: "top-center",
      icon: status === "Approved" ? "✅" : "❌",
    });

    const employee = allEmployees.find((emp) => emp.id === employeeId);
    if (employee) {
      sendEmailNotification(employee, status);
      addNotification({
        id: Date.now(),
        title: `Leave ${status}`,
        message: `Leave request for ${employee.name} (ID: ${
          employee.id
        }) has been ${status.toLowerCase()}`,
        type: "status_update",
        requestId: employee.id,
        read: false,
        timestamp: new Date(),
      });
    }

    checkForCriticalPeriodAlerts(employeeId, status);
  };

  const sendEmailNotification = (employee: any, status: string) => {
    const emailContent = `
      To: meronnisrane@gmail.com
      Subject: Leave Request ${status} - ${employee.name} (ID: ${employee.id})
      
      Dear HR Manager,
      
      The leave request for ${employee.name} (Employee ID: ${
      employee.employeeId
    }) has been ${status.toLowerCase()}.
      
      Request Details:
      - Type: ${employee.leaveType}
      - Dates: ${employee.leaveStart} to ${employee.returnDay}
      - Days: ${employee.days || "N/A"}
      - Team: ${employee.team || "N/A"}
      - Description: ${employee.description || "None provided"}
      
      Decision: ${status}
      ${formData.remark ? `Remarks: ${formData.remark}` : ""}
      
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
      name: employee.name,
      requestDays: employee.days?.toString() || "0",
      halfFullDay: employee.dayType === "half" ? "Half Day" : "Full Day",
      description: employee.description || "",
      leaveType: employee.leaveType,
      leaveStart: employee.leaveStart,
      leaveEnd: employee.returnDay,
      approvedDays: employee.days?.toString() || "0",
      remark: "",
      decision: employee.status || "",
      team: employee.team || "Engineering",
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
    const currentDays = parseFloat(formData.approvedDays) || 0;
    const newDays = Math.max(0, currentDays + amount);
    setFormData({
      ...formData,
      approvedDays: newDays.toFixed(1),
    });
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.leaveStart)
      errors.leaveStart = "Leave start date is required";
    if (!formData.leaveEnd) errors.leaveEnd = "Leave end date is required";
    if (!formData.decision) errors.decision = "Decision is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
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
              Leave Approve
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
                    "HR Status",
                    "Action",
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
                      colSpan={8}
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
                        <span className="px-3 py-1 rounded-md text-xs font-medium bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          {employee.status ? (
                            <span
                              className={`px-3 py-1 rounded-md text-xs font-medium ${
                                employee.status === "Approved"
                                  ? "bg-green-100 text-green-800"
                                  : employee.status === "Rejected"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {employee.status}
                            </span>
                          ) : (
                            <span className="text-gray-500 text-xs">
                              Pending
                            </span>
                          )}
                          {activeTab === "Current" && (
                            <button
                              onClick={() => handleEdit(employee)}
                              className="text-[#3c8dbc] text-xs underline hover:text-[#3c8dbc]/80 transition-colors"
                            >
                              Edit
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
                className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex flex-col h-full">
                  <div className="p-6 flex justify-between items-center border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-[#3c8dbc]">
                      Leave Approval
                    </h2>
                    <button
                      onClick={() => setShowEditForm(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <FiX size={24} />
                    </button>
                  </div>

                  <div className="overflow-y-auto px-6 py-4 max-h-[70vh]">
                    <form onSubmit={handleSubmitEdit}>
                      <div className="space-y-6">
                        <div className="grid grid-cols-3 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Name
                            </label>
                            <input
                              type="text"
                              name="name"
                              value={formData.name}
                              readOnly
                              className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Leave Type
                            </label>
                            <select
                              name="leaveType"
                              value={formData.leaveType}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3c8dbc]"
                            >
                              <option value="">-Select One-</option>
                              <option value="Annual">Annual</option>
                              <option value="Sick">Sick</option>
                              <option value="Maternity">Maternity</option>
                              <option value="Paternity">Paternity</option>
                              <option value="Unpaid">Unpaid</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Team
                            </label>
                            <input
                              type="text"
                              name="team"
                              value={formData.team}
                              readOnly
                              className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Leave Start
                            </label>
                            <input
                              type="text"
                              name="leaveStart"
                              value={formData.leaveStart}
                              readOnly
                              className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Leave End
                            </label>
                            <input
                              type="text"
                              name="leaveEnd"
                              value={formData.leaveEnd}
                              readOnly
                              className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Day Type
                            </label>
                            <select
                              name="halfFullDay"
                              value={formData.halfFullDay}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3c8dbc]"
                            >
                              <option>Full Day</option>
                              <option>Half Day</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Request Days
                            </label>
                            <input
                              type="text"
                              name="requestDays"
                              value={formData.requestDays}
                              readOnly
                              className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Approved Days
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                name="approvedDays"
                                value={formData.approvedDays}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3c8dbc]"
                              />
                              <div className="flex flex-col gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleDaysChange(0.5)}
                                  className="px-2 py-1 bg-[#3c8dbc] text-white rounded-md hover:bg-[#3c8dbc]/90"
                                >
                                  +
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDaysChange(-0.5)}
                                  className="px-2 py-1 bg-[#3c8dbc] text-white rounded-md hover:bg-[#3c8dbc]/90"
                                >
                                  -
                                </button>
                              </div>
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Decision
                            </label>
                            <select
                              name="decision"
                              value={formData.decision}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3c8dbc]"
                              required
                            >
                              <option value="">-Select One-</option>
                              <option value="Approved">Approved</option>
                              <option value="Rejected">Rejected</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                          </label>
                          <textarea
                            rows={3}
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3c8dbc]"
                            placeholder="Enter description"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Remark
                          </label>
                          <input
                            type="text"
                            name="remark"
                            value={formData.remark}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3c8dbc]"
                            placeholder="Enter remarks"
                          />
                        </div>
                      </div>

                      <div className="mt-8 pt-4 border-t border-gray-200 flex justify-end gap-4">
                        <button
                          type="button"
                          onClick={() => setShowEditForm(false)}
                          className="px-6 py-2 bg-gray-300 text-gray-800 rounded-md text-sm font-medium hover:bg-gray-400 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2 bg-[#3c8dbc] text-white rounded-md text-sm font-medium hover:bg-[#3c8dbc]/90 transition-colors"
                        >
                          Save Changes
                        </button>
                      </div>
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
