"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiPlus,
  FiX,
  FiCalendar,
  FiChevronDown,
  FiChevronUp,
  FiUser,
  FiInfo,
  FiMinus,
  FiMail,
} from "react-icons/fi";
import { toast, Toaster } from "react-hot-toast";

// Shared state between components
let globalLeaveRequests: any[] = [];
let globalEmployeeHireDate = new Date("2020-01-01"); // Default to old employee

export function setEmployeeHireDate(date: Date) {
  globalEmployeeHireDate = date;
}

export function addLeaveRequest(request: any) {
  globalLeaveRequests = [...globalLeaveRequests, request];
}

export function getLeaveRequests() {
  return globalLeaveRequests;
}

export function updateLeaveRequestStatus(
  id: number,
  status: string,
  isHrApproval = false
) {
  globalLeaveRequests = globalLeaveRequests.map((request) =>
    request.id === id
      ? isHrApproval
        ? { ...request, hrStatus: status }
        : { ...request, status }
      : request
  );
}

export function getAnnualLeaveBalance() {
  const isNewEmployee =
    new Date().getFullYear() - globalEmployeeHireDate.getFullYear() < 2;
  return isNewEmployee ? 20 : 30;
}

export default function LeaveRequestForm() {
  const [employeeId, setEmployeeId] = useState("20003133");
  const [incidentType, setIncidentType] = useState("");
  const [leaveStart, setLeaveStart] = useState("");
  const [returnDay, setReturnDay] = useState("");
  const [leaveType, setLeaveType] = useState("");
  const [noDays, setNoDays] = useState(1);
  const [dayType, setDayType] = useState("full");
  const [description, setDescription] = useState("");
  const [isCalculating, setIsCalculating] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showBalance, setShowBalance] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [particles, setParticles] = useState<
    Array<{
      id: number;
      width: number;
      height: number;
      left: number;
      top: number;
    }>
  >([]);
  const formRef = useRef<HTMLFormElement>(null);

  const incidentTypes = ["Medical", "Family", "Accident", "Other"];
  const leaveTypes = [
    "Annual",
    "Sick",
    "Maternity",
    "Paternity",
    "Unpaid",
    "Accident",
  ];
  const dayTypes = ["Full Day", "Half Day"];

  // Generate particles only on client side
  useEffect(() => {
    const generatedParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      width: Math.random() * 10 + 5,
      height: Math.random() * 10 + 5,
      left: Math.random() * 100,
      top: Math.random() * 100,
    }));
    setParticles(generatedParticles);
  }, []);

  // Get history data from shared state
  const historyData = getLeaveRequests().map((request) => ({
    id: request.id,
    year: request.year,
    requestedDays: Math.ceil(
      (new Date(request.returnDay).getTime() -
        new Date(request.leaveStart).getTime()) /
        (1000 * 3600 * 24)
    ),
    leaveStart: request.leaveStart,
    returnDay: request.returnDay,
    approvedDays:
      request.status === "Approved"
        ? Math.ceil(
            (new Date(request.returnDay).getTime() -
              new Date(request.leaveStart).getTime()) /
              (1000 * 3600 * 24)
          )
        : 0,
    type: request.leaveType,
    deptApproval: request.status,
    hrApproval: request.status,
  }));

  const isNewEmployee =
    new Date().getFullYear() - globalEmployeeHireDate.getFullYear() < 2;
  const initialBalance = isNewEmployee ? 20 : 30;
  const usedDays = historyData.reduce(
    (sum, item) =>
      sum + (item.deptApproval === "Approved" ? item.approvedDays : 0),
    0
  );
  const currentBalance = initialBalance - usedDays;

  const balanceData = [
    {
      id: 1,
      leaveYear: new Date().getFullYear(),
      initialBalance,
      currentBalance,
      usedDays,
    },
  ];

  const scheduleData = [
    { id: 1, month: "January", noDays: 2 },
    { id: 2, month: "February", noDays: 1 },
    { id: 3, month: "March", noDays: 1 },
  ];

  const calculateReturnDay = () => {
    if (!leaveStart) return;
    setIsCalculating(true);
    setTimeout(() => {
      const startDate = new Date(leaveStart);
      const endDate = new Date(startDate);
      if (dayType === "full") {
        endDate.setDate(startDate.getDate() + noDays);
      } else {
        endDate.setDate(startDate.getDate() + noDays - 0.5);
      }
      setReturnDay(endDate.toISOString().split("T")[0]);
      setIsCalculating(false);
      if (formRef.current) {
        formRef.current.classList.add("animate-pulse");
        setTimeout(() => {
          formRef.current?.classList.remove("animate-pulse");
        }, 500);
      }
    }, 800);
  };

  useEffect(() => {
    if (leaveStart && noDays) {
      calculateReturnDay();
    }
  }, [leaveStart, noDays, dayType]);

  const sendEmailNotification = (request: any) => {
    const emailContent = `
      To: meronnisrane@gmail.com
      Subject: New Leave Request - ${request.leaveType}
      
      Employee Details:
      - Name: ${request.name}
      - ID: ${request.employeeId}
      
      Leave Details:
      - Type: ${request.leaveType}
      - Start Date: ${request.leaveStart}
      - Return Date: ${request.returnDay}
      - Days Requested: ${noDays}
      - Day Type: ${dayType === "full" ? "Full Day" : "Half Day"}
      
      Additional Information:
      ${request.description || "None provided"}
      
      Please review this request at your earliest convenience.
      
      Regards,
      Leave Management System
    `;

    console.log(
      "Email notification sent to meronnisrane@gmail.com:\n",
      emailContent
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!leaveType || !leaveStart || !returnDay) {
      toast.error("Please fill in all required fields", {
        position: "top-center",
        duration: 3000,
      });
      return;
    }

    const newRequest = {
      id: globalLeaveRequests.length + 1,
      name: "Abebe Kebede", // In a real app, this would come from user data
      employeeId,
      year: new Date().getFullYear(),
      leaveType,
      leaveStart,
      returnDay,
      status: "Pending",
      description,
      days: noDays,
      dayType,
    };

    addLeaveRequest(newRequest);
    sendEmailNotification(newRequest);

    // Show success toast
    toast.success("Leave requested successfully!", {
      position: "top-center",
      duration: 3000,
      icon: <FiMail className="text-blue-500" />,
    });

    // Reset form
    setIncidentType("");
    setLeaveStart("");
    setReturnDay("");
    setLeaveType("");
    setNoDays(1);
    setDayType("full");
    setDescription("");
  };

  return (
    <div className="min-h-screen p-6 font-sans relative overflow-hidden">
      {/* Animated background particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-[#3c8dbc]/10 to-purple-50 opacity-30"></div>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full bg-[#3c8dbc]/10"
            style={{
              width: `${particle.width}px`,
              height: `${particle.height}px`,
              left: `${particle.left}%`,
              top: `${particle.top}%`,
            }}
            animate={{
              y: [0, (Math.random() - 0.5) * 50],
              x: [0, (Math.random() - 0.5) * 30],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        ))}
      </div>

      {/* Toast Notifications */}
      <Toaster
        toastOptions={{
          style: {
            borderRadius: "12px",
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 8px 32px rgba(31, 38, 135, 0.15)",
            padding: "16px",
            color: "#333",
          },
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Action Buttons */}
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
          <div className="flex flex-wrap gap-3">
            <motion.button
              whileHover={{
                scale: 1.05,
                boxShadow: "0 4px 12px rgba(60, 141, 188, 0.2)",
              }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowHistory(true)}
              className="px-4 py-2 bg-[#93c3e1] text-black rounded-lg text-sm font-medium flex items-center gap-2 transition-all duration-200 hover:shadow-md"
            >
              <FiCalendar size={16} />
              History
            </motion.button>
            <motion.button
              whileHover={{
                scale: 1.05,
                boxShadow: "0 4px 12px rgba(60, 141, 188, 0.2)",
              }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowBalance(true)}
              className="px-4 py-2 bg-[#93c3e1] text-black rounded-lg text-sm font-medium flex items-center gap-2 transition-all duration-200 hover:shadow-md"
            >
              <FiInfo size={16} />
              Annual Leave Balance
            </motion.button>
            <motion.button
              whileHover={{
                scale: 1.05,
                boxShadow: "0 4px 12px rgba(60, 141, 188, 0.2)",
              }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowSchedule(true)}
              className="px-4 py-2 bg-[#93c3e1] text-black rounded-lg text-sm font-medium flex items-center gap-2 transition-all duration-200 hover:shadow-md"
            >
              <FiChevronUp size={16} />
              Annual Leave Schedule
            </motion.button>
          </div>
        </div>

        {/* Leave Request Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, type: "spring" }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[#3c8dbc] bg-clip-text bg-gradient-to-r from-[#3c8dbc] to-[#5c9dce] inline-block">
                Leave Request
              </h1>
              <p className="text-gray-600 mt-2">
                Submit and manage your leave requests
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative"></div>
            </div>
          </div>
        </motion.div>

        {/* Form */}
        <motion.form
          ref={formRef}
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, type: "spring" }}
          className="bg-white/90 backdrop-blur-lg rounded-2xl border border-[#3c8dbc]/30 shadow-2xl overflow-hidden p-6 lg:p-8 transition-all duration-300 hover:shadow-lg"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Left Column */}
            <div className="space-y-5">
              {/* Employee ID */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employee ID
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3c8dbc] focus:border-transparent transition-all duration-200 shadow-sm"
                    placeholder="Enter employee ID"
                    disabled
                  />
                  <FiUser className="absolute right-3 top-3 text-gray-400" />
                </div>
              </motion.div>

              {/* Incident Type */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Incident Type
                </label>
                <div className="relative">
                  <select
                    value={incidentType}
                    onChange={(e) => setIncidentType(e.target.value)}
                    className="w-full px-4 py-2.5 appearance-none border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3c8dbc] focus:border-transparent transition-all duration-200 shadow-sm"
                  >
                    <option value="">-- Select One --</option>
                    {incidentTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  <FiChevronDown className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                </div>
              </motion.div>

              {/* Leave Start Date */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Leave Start Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={leaveStart}
                    onChange={(e) => setLeaveStart(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3c8dbc] focus:border-transparent pr-10 transition-all duration-200 shadow-sm"
                    required
                  />
                  <FiCalendar className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                </div>
              </motion.div>

              {/* Return Day */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Return Day
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={returnDay || "Will be calculated"}
                    readOnly
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-700 shadow-sm"
                  />
                  {returnDay && (
                    <FiCalendar className="absolute right-3 top-3 text-gray-400" />
                  )}
                </div>
              </motion.div>
            </div>

            {/* Right Column */}
            <div className="space-y-5">
              {/* Leave Type */}
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Leave Type <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value)}
                    className="w-full px-4 py-2.5 appearance-none border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3c8dbc] focus:border-transparent transition-all duration-200 shadow-sm"
                    required
                  >
                    <option value="">-- Select One --</option>
                    {leaveTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  <FiChevronDown className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                </div>
              </motion.div>

              {/* Number of Days */}
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Days
                </label>
                <div className="flex items-center gap-3">
                  <motion.button
                    type="button"
                    onClick={() => setNoDays((prev) => Math.max(1, prev - 1))}
                    className="p-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors text-gray-700 shadow-sm"
                    whileHover={{ scale: 1.1, backgroundColor: "#f3f4f6" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FiMinus size={18} />
                  </motion.button>
                  <input
                    type="number"
                    min="1"
                    value={noDays}
                    onChange={(e) =>
                      setNoDays(Math.max(1, parseInt(e.target.value) || 1))
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3c8dbc] focus:border-transparent text-center transition-all duration-200 shadow-sm"
                  />
                  <motion.button
                    type="button"
                    onClick={() => setNoDays((prev) => prev + 1)}
                    className="p-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors text-gray-700 shadow-sm"
                    whileHover={{ scale: 1.1, backgroundColor: "#f3f4f6" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FiPlus size={18} />
                  </motion.button>
                </div>
              </motion.div>

              {/* Day Type with Calculate Button */}
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Day Type
                  </label>
                  <div className="relative">
                    <select
                      value={dayType}
                      onChange={(e) => setDayType(e.target.value)}
                      className="w-full px-4 py-2.5 appearance-none border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3c8dbc] focus:border-transparent transition-all duration-200 shadow-sm"
                    >
                      {dayTypes.map((type) => (
                        <option
                          key={type}
                          value={type.toLowerCase().split(" ")[0]}
                        >
                          {type}
                        </option>
                      ))}
                    </select>
                    <FiChevronDown className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div className="flex items-end">
                  <motion.button
                    type="button"
                    onClick={calculateReturnDay}
                    disabled={!leaveStart || isCalculating}
                    className={`px-4 py-2.5 rounded-lg font-medium text-sm w-full md:w-auto ${
                      !leaveStart || isCalculating
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "bg-[#3c8dbc] text-white hover:bg-[#3c8dbc]/90 shadow-md"
                    } transition-all duration-200 flex items-center justify-center`}
                    whileHover={{
                      scale: !leaveStart || isCalculating ? 1 : 1.05,
                    }}
                    whileTap={{
                      scale: !leaveStart || isCalculating ? 1 : 0.95,
                    }}
                  >
                    {isCalculating ? (
                      <span className="flex items-center justify-center">
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="inline-block mr-2"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                          </svg>
                        </motion.span>
                        Calculating
                      </span>
                    ) : (
                      "Calculate"
                    )}
                  </motion.button>
                </div>
              </motion.div>

              {/* Description */}
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3c8dbc] focus:border-transparent transition-all duration-200 shadow-sm"
                  placeholder="Enter additional information..."
                />
              </motion.div>
            </div>
          </div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, type: "spring" }}
            className="mt-10 flex justify-center"
          >
            <motion.button
              type="submit"
              className="px-10 py-3.5 bg-gradient-to-r from-[#3c8dbc] to-[#5c9dce] text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all duration-300 shadow-md flex items-center gap-3"
              whileHover={{
                scale: 1.03,
                boxShadow: "0 8px 20px rgba(60, 141, 188, 0.3)",
              }}
              whileTap={{ scale: 0.99 }}
            >
              Submit
            </motion.button>
          </motion.div>
        </motion.form>

        {/* Modals */}
        <AnimatePresence>
          {/* History Modal */}
          {showHistory && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowHistory(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, y: 20, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-200"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-[#3c8dbc]/30 bg-gradient-to-r from-[#3c8dbc]/10 to-[#3c8dbc]/5">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-[#3c8dbc]">
                      Leave History
                    </h2>
                    <motion.button
                      onClick={() => setShowHistory(false)}
                      className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
                      whileHover={{ rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <FiX size={24} />
                    </motion.button>
                  </div>
                </div>
                <div className="overflow-auto flex-1 p-6">
                  {historyData.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-center py-12"
                    >
                      <FiCalendar className="mx-auto text-gray-400" size={48} />
                      <h3 className="mt-4 text-lg font-medium text-gray-700">
                        No leave history found
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        You haven't submitted any leave requests yet.
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="bg-white/90 rounded-xl border border-[#3c8dbc]/30 overflow-hidden shadow-sm"
                    >
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-[#3c8dbc]/30">
                          <thead className="bg-[#3c8dbc]/10">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-[#3c8dbc] uppercase tracking-wider">
                                No
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-[#3c8dbc] uppercase tracking-wider">
                                Year
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-[#3c8dbc] uppercase tracking-wider">
                                Requested Days
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-[#3c8dbc] uppercase tracking-wider">
                                Leave Start
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-[#3c8dbc] uppercase tracking-wider">
                                Return Day
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-[#3c8dbc] uppercase tracking-wider">
                                Type
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-[#3c8dbc] uppercase tracking-wider">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-[#3c8dbc]/20">
                            {historyData.map((item, index) => (
                              <motion.tr
                                key={item.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="hover:bg-[#3c8dbc]/5 transition-colors"
                              >
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                  {index + 1}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                  {item.year}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                  {item.requestedDays}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                  {new Date(
                                    item.leaveStart
                                  ).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                  {new Date(
                                    item.returnDay
                                  ).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                  <motion.span
                                    className={`px-3 py-1 rounded-full text-xs inline-block ${
                                      item.type === "Annual"
                                        ? "bg-green-100 text-green-800"
                                        : item.type === "Sick"
                                        ? "bg-blue-100 text-blue-800"
                                        : "bg-purple-100 text-purple-800"
                                    }`}
                                    whileHover={{ scale: 1.05 }}
                                  >
                                    {item.type}
                                  </motion.span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                  <motion.span
                                    className={`px-3 py-1 rounded-full text-xs inline-block ${
                                      item.deptApproval === "Approved"
                                        ? "bg-green-100 text-green-800"
                                        : item.deptApproval === "Rejected"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-yellow-100 text-yellow-800"
                                    }`}
                                    whileHover={{ scale: 1.05 }}
                                  >
                                    {item.deptApproval || "Pending"}
                                  </motion.span>
                                </td>
                              </motion.tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </motion.div>
                  )}
                </div>
                <div className="p-4 border-t border-[#3c8dbc]/30 bg-gray-50">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                      Showing {historyData.length} of {historyData.length}{" "}
                      records
                    </p>
                    <motion.button
                      onClick={() => setShowHistory(false)}
                      className="px-4 py-2 bg-[#3c8dbc] text-white rounded-lg text-sm font-medium hover:bg-[#3c8dbc]/90 transition-colors shadow-sm"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      Close
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Balance Modal */}
          {showBalance && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowBalance(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, y: 20, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-200"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-[#3c8dbc]/30 bg-gradient-to-r from-[#3c8dbc]/10 to-[#3c8dbc]/5">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-[#3c8dbc]">
                      Annual Leave Balance
                    </h2>
                    <motion.button
                      onClick={() => setShowBalance(false)}
                      className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
                      whileHover={{ rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <FiX size={24} />
                    </motion.button>
                  </div>
                </div>
                <div className="overflow-auto flex-1 p-6">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/90 rounded-xl border border-[#3c8dbc]/30 overflow-hidden shadow-sm"
                  >
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-[#3c8dbc]/30">
                        <thead className="bg-[#3c8dbc]/10">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-[#3c8dbc] uppercase tracking-wider">
                              No
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-[#3c8dbc] uppercase tracking-wider">
                              Leave Year
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-[#3c8dbc] uppercase tracking-wider">
                              Initial Balance
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-[#3c8dbc] uppercase tracking-wider">
                              Current Balance
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-[#3c8dbc] uppercase tracking-wider">
                              Used Days
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-[#3c8dbc]/20">
                          {balanceData.map((item, index) => (
                            <motion.tr
                              key={item.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="hover:bg-[#3c8dbc]/5 transition-colors"
                            >
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                {index + 1}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                {item.leaveYear}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                {item.initialBalance}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                                <motion.span
                                  className={`px-3 py-1 rounded-full text-xs inline-block ${
                                    item.currentBalance > 15
                                      ? "bg-green-100 text-green-800"
                                      : item.currentBalance > 5
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                  whileHover={{ scale: 1.05 }}
                                >
                                  {item.currentBalance} days
                                </motion.span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                {item.usedDays}
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mt-6 p-5 bg-[#3c8dbc]/10 rounded-xl border border-[#3c8dbc]/30"
                  >
                    <h3 className="text-lg font-semibold text-[#3c8dbc] mb-3">
                      Summary
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                        <p className="text-sm text-gray-600 mb-1">
                          Total Available:
                        </p>
                        <p className="text-2xl font-bold text-[#3c8dbc]">
                          {initialBalance} days
                        </p>
                      </div>
                      <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                        <p className="text-sm text-gray-600 mb-1">
                          Total Used:
                        </p>
                        <p className="text-2xl font-bold text-[#3c8dbc]">
                          {usedDays} days
                        </p>
                      </div>
                    </div>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="mt-5 p-4 bg-white rounded-lg shadow-sm border border-[#3c8dbc]/30"
                    >
                      <p className="text-sm text-gray-700">
                        {isNewEmployee ? (
                          <span>
                            As a new employee (less than 2 years), your annual
                            leave balance is{" "}
                            <span className="font-semibold">20 days</span>.
                          </span>
                        ) : (
                          <span>
                            As an established employee, your annual leave
                            balance is{" "}
                            <span className="font-semibold">30 days</span>.
                          </span>
                        )}
                      </p>
                    </motion.div>
                  </motion.div>
                </div>
                <div className="p-4 border-t border-[#3c8dbc]/30 bg-gray-50">
                  <div className="flex justify-end">
                    <motion.button
                      onClick={() => setShowBalance(false)}
                      className="px-4 py-2 bg-[#3c8dbc] text-white rounded-lg text-sm font-medium hover:bg-[#3c8dbc]/90 transition-colors shadow-sm"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      Close
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Schedule Modal */}
          {showSchedule && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowSchedule(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, y: 20, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-200"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-[#3c8dbc]/30 bg-gradient-to-r from-[#3c8dbc]/10 to-[#3c8dbc]/5">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-[#3c8dbc]">
                      Annual Leave Schedule
                    </h2>
                    <motion.button
                      onClick={() => setShowSchedule(false)}
                      className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
                      whileHover={{ rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <FiX size={24} />
                    </motion.button>
                  </div>
                </div>
                <div className="overflow-auto flex-1 p-6">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/90 rounded-xl border border-[#3c8dbc]/30 overflow-hidden shadow-sm"
                  >
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-[#3c8dbc]/30">
                        <thead className="bg-[#3c8dbc]/10">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-[#3c8dbc] uppercase tracking-wider">
                              No
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-[#3c8dbc] uppercase tracking-wider">
                              Month
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-[#3c8dbc] uppercase tracking-wider">
                              Scheduled Days
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-[#3c8dbc] uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-[#3c8dbc]/20">
                          {scheduleData.map((item, index) => (
                            <motion.tr
                              key={item.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="hover:bg-[#3c8dbc]/5 transition-colors"
                            >
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                {index + 1}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                                {item.month}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                {item.noDays}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                <motion.span
                                  className={`px-3 py-1 rounded-full text-xs inline-block ${
                                    item.month === "December"
                                      ? "bg-purple-100 text-purple-800"
                                      : "bg-blue-100 text-blue-800"
                                  }`}
                                  whileHover={{ scale: 1.05 }}
                                >
                                  {item.month === "December"
                                    ? "Holiday Season"
                                    : "Regular"}
                                </motion.span>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mt-6 p-5 bg-[#3c8dbc]/10 rounded-xl border border-[#3c8dbc]/30"
                  >
                    <h3 className="text-lg font-semibold text-[#3c8dbc] mb-3">
                      Upcoming Leave
                    </h3>
                    <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                      <p className="text-sm text-gray-700">
                        Next scheduled leave:{" "}
                        <span className="font-medium">April (1 day)</span>
                      </p>
                    </div>
                  </motion.div>
                </div>
                <div className="p-4 border-t border-[#3c8dbc]/30 bg-gray-50">
                  <div className="flex justify-end">
                    <motion.button
                      onClick={() => setShowSchedule(false)}
                      className="px-4 py-2 bg-[#3c8dbc] text-white rounded-lg text-sm font-medium hover:bg-[#3c8dbc]/90 transition-colors shadow-sm"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      Close
                    </motion.button>
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
