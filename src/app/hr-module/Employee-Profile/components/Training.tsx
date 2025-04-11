"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiX, FiCalendar, FiEdit2, FiBook } from "react-icons/fi";

export default function TrainingTab() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [trainings, setTrainings] = useState([
    {
      id: 1,
      institution: "ALX",
      courseName: "Software Engineering ",
      startDate: "2016-10-06",
      endDate: "",
      location: "",
      payment: "",
    },
  ]);
  const [formData, setFormData] = useState({
    institution: "",
    courseName: "",
    startDate: "",
    endDate: "",
    location: "",
    payment: "",
  });

  const handleEditTraining = (training: any) => {
    setEditingId(training.id);
    setFormData({
      institution: training.institution,
      courseName: training.courseName,
      startDate: training.startDate,
      endDate: training.endDate,
      location: training.location,
      payment: training.payment,
    });
    setShowForm(true);
  };

  const handleAddTraining = () => {
    if (editingId) {
      setTrainings(
        trainings.map((training) =>
          training.id === editingId ? { ...formData, id: editingId } : training
        )
      );
      setEditingId(null);
    } else {
      setTrainings([...trainings, { ...formData, id: trainings.length + 1 }]);
    }
    setFormData({
      institution: "",
      courseName: "",
      startDate: "",
      endDate: "",
      location: "",
      payment: "",
    });
    setShowForm(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const formTitle = editingId ? "Edit Training" : "Add New Training";
  const submitButtonText = editingId ? "Update" : "Save";

  return (
    <div className="space-y-6 relative">
      {/* Blur overlay */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black z-10"
        />
      )}
      {/* Popup Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 flex items-center justify-center z-20"
          >
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl shadow-lg border border-gray-200 backdrop-blur-sm w-full max-w-2xl">
              <div className="flex justify-between items-center mb-6">
                <motion.h3
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-2xl font-bold text-[#3c8dbc]"
                >
                  {formTitle}
                </motion.h3>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({
                      institution: "",
                      courseName: "",
                      startDate: "",
                      endDate: "",
                      location: "",
                      payment: "",
                    });
                  }}
                  className="p-2 rounded-full hover:bg-gray-100 transition-all"
                >
                  <FiX
                    size={20}
                    className="text-gray-500 hover:text-gray-700"
                  />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Input fields */}
                {["institution", "courseName", "location", "payment"].map(
                  (field, i) => (
                    <motion.div
                      key={field}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + i * 0.05 }}
                    >
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        {field === "courseName"
                          ? "Course/Training Name"
                          : field === "payment"
                          ? "Payment in ETB"
                          : field.charAt(0).toUpperCase() + field.slice(1)}
                      </label>
                      <input
                        type="text"
                        name={field}
                        value={(formData as any)[field]}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-300"
                        placeholder={`Enter ${
                          field === "payment" ? "amount in ETB" : field
                        }`}
                      />
                    </motion.div>
                  )
                )}
                {/* Date fields */}
                {["startDate", "endDate"].map((field, i) => (
                  <motion.div
                    key={field}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                  >
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      {field === "startDate" ? "Start Date" : "End Date"}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-gray-400">
                        <FiCalendar size={18} />
                      </span>
                      <input
                        type="date"
                        name={field}
                        value={(formData as any)[field]}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pl-12 placeholder-gray-300"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex gap-4 justify-end"
              >
                {/* Add Button (Text with Square-Rounded Shape) */}
                <button
                  onClick={handleAddTraining}
                  className="px-6 py-2 bg-[#3c8dbc] text-white rounded-lg hover:bg-[#367fa9] transition-all shadow-md"
                >
                  {submitButtonText}
                </button>
                {/* Cancel Button (Text with Square-Rounded Shape) */}
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({
                      institution: "",
                      courseName: "",
                      startDate: "",
                      endDate: "",
                      location: "",
                      payment: "",
                    });
                  }}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all shadow-md"
                >
                  Cancel
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Table Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={`bg-white rounded-xl shadow-lg overflow-hidden ${
          showForm ? "blur-sm" : ""
        }`}
      >
        {/* Updated Header to Match CostSharingTab */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 bg-[#3c8dbc] rounded-lg shadow-md p-2 md:p-3 text-white h-[50px]">
          <div className="flex items-center">
            {/* Replace Existing Icon with Book Icon */}
            <FiBook size={20} className="h-5 w-5 mr-2 text-blue-100" />
            <div>
              <h1 className="text-[14px] font-bold">Training</h1>
              <p className="text-blue-100 text-xs">
                Manage your training information
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingId(null);
              setFormData({
                institution: "",
                courseName: "",
                startDate: "",
                endDate: "",
                location: "",
                payment: "",
              });
            }}
            className="flex items-center bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-1 rounded-md shadow-sm hover:shadow transition-all duration-300 border border-white border-opacity-20 text-xs md:text-sm mt-2 md:mt-0"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-xs">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "NO",
                  "Institution",
                  "Training/Course Name",
                  "Start Date",
                  "End Date",
                  "Location",
                  "Payment",
                  <svg
                    key="action-icon"
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 inline"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                      clipRule="evenodd"
                    />
                  </svg>,
                ].map((header, idx) => (
                  <motion.th
                    key={typeof header === "string" ? header : "action-header"}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * idx }}
                    className="px-6 py-3 text-left font-bold text-gray-700 tracking-wider"
                    style={{ fontSize: "12px" }}
                  >
                    {header}
                  </motion.th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {trainings.map((training, idx) => (
                <motion.tr
                  key={training.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * idx }}
                  whileHover={{ backgroundColor: "#f8fafc" }}
                  className="transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    {training.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {training.institution}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {training.courseName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {training.startDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {training.endDate || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {training.location || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {training.payment || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">
                    <div className="flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleEditTraining(training)}
                        className="text-[#3c8dbc] hover:text-blue-700 p-1 rounded-full hover:bg-blue-50"
                      >
                        <FiEdit2 size={16} />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
