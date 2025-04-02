"use client";
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  FiSearch,
  FiUserPlus,
  FiRefreshCw,
  FiPrinter,
  FiEdit,
  FiMapPin,
  FiBook,
  FiUsers,
  FiActivity,
  FiGlobe,
  FiTrendingUp,
  FiUpload,
  FiDollarSign,
  FiCamera,
  FiUser,
  FiFileText,
  FiBriefcase,
  FiChevronRight,
  FiX,
  FiCalendar,
  FiFile,
  FiPlus,
} from "react-icons/fi";

export default function EmployeeProfilePage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewEmployeeForm, setShowNewEmployeeForm] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const tabs = [
    { id: "profile", name: "Profile", icon: <FiUser /> },
    { id: "address", name: "Address", icon: <FiMapPin /> },
    { id: "education", name: "Education", icon: <FiBook /> },
    { id: "family", name: "Family", icon: <FiUsers /> },
    { id: "training", name: "Training", icon: <FiActivity /> },
    { id: "experience", name: "Ext Experience", icon: <FiGlobe /> },
    { id: "language", name: "Language", icon: <FiGlobe /> },
    { id: "cost-sharing", name: "Cost Sharing", icon: <FiDollarSign /> },
    { id: "promotion", name: "Promotion History", icon: <FiTrendingUp /> },
    { id: "edit", name: "Edit Experience", icon: <FiEdit /> },
    { id: "print", name: "Print Experience", icon: <FiPrinter /> },
    { id: "upload", name: "Upload", icon: <FiUpload /> },
    { id: "job-description", name: "Job Description", icon: <FiFileText /> },
    {
      id: "position-description",
      name: "Position Description",
      icon: <FiBriefcase />,
    },
  ];

  const handleSearch = () => {
    // Search functionality would go here
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleNewEmployee = () => {
    setShowNewEmployeeForm(true);
  };

  const handleRefresh = () => {
    setLastRefresh(new Date());
    alert("Employee data refreshed successfully!");
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header Section with Tabs */}
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col"
        >
          {/* Top Row - Buttons */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name, ID, position..."
                  className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <button
                  onClick={handleSearch}
                  className="absolute left-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FiSearch size={18} />
                </button>
              </div>
              <button
                onClick={handleNewEmployee}
                className="px-5 py-2.5 bg-green-500 text-white rounded-lg flex items-center gap-2 text-base hover:bg-green-600 transition-all shadow-md hover:shadow-lg"
              >
                <FiUserPlus size={18} /> New
              </button>
            </div>

            <div className="flex items-center gap-4">
              {lastRefresh && (
                <div className="text-sm text-gray-500">
                  Last refreshed: {lastRefresh.toLocaleTimeString()}
                </div>
              )}
              <button
                onClick={handleRefresh}
                className="px-5 py-2.5 bg-gray-500 text-white rounded-lg flex items-center gap-2 text-base hover:bg-gray-600 transition-all shadow-md hover:shadow-lg"
              >
                <FiRefreshCw size={18} />
              </button>
            </div>
          </div>

          {/* Bottom Row - Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="flex overflow-x-auto border-b border-gray-200 pb-1 scrollbar-hide"
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-3 flex items-center gap-2 text-base font-medium whitespace-nowrap border-b-2 transition-all ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600 bg-blue-50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Content area would go here */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-8 min-h-[400px]">
        {/* Content would be rendered here based on activeTab */}
      </div>
    </div>
  );
}
