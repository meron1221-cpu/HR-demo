"use client";
import { useState } from "react";
import Link from "next/link";
import {
  FiHome,
  FiPieChart,
  FiSettings,
  FiBriefcase,
  FiFileText,
  FiAward,
  FiUsers,
  FiDollarSign,
  FiChevronDown,
  FiChevronUp,
  FiLayers,
  FiArchive,
  FiUser,
} from "react-icons/fi";
import { FaTachometerAlt } from "react-icons/fa";

interface SidebarProps {
  className?: string;
  hidden?: boolean;
}

export default function Sidebar({ className, hidden = false }: SidebarProps) {
  const [openMenus, setOpenMenus] = useState({
    dashboard: false,
    organization: false,
    employee: false,
  });

  const toggleMenu = (menu: keyof typeof openMenus) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  };

  if (hidden) return null;

  return (
    <aside className={`bg-gray-800 text-white w-64 p-4 ${className || ""}`}>
      <nav className="space-y-4">
        {/* Dashboard Dropdown */}
        <div>
          <button
            onClick={() => toggleMenu("dashboard")}
            className="flex items-center justify-between w-full p-2 hover:bg-gray-700 rounded"
          >
            <div className="flex items-center gap-2">
              <FaTachometerAlt className="w-4 h-4" />
              <span>Dashboard</span>
            </div>
            {openMenus.dashboard ? <FiChevronUp /> : <FiChevronDown />}
          </button>
          {openMenus.dashboard && (
            <div className="ml-6 mt-1 space-y-2">
              <Link
                href="/hr-module"
                className="flex items-center gap-2 p-2 hover:bg-gray-700 rounded text-sm"
              >
                <FiHome className="w-4 h-4" />
                Home
              </Link>
              <Link
                href="/hr-module/dashboard"
                className="flex items-center gap-2 p-2 hover:bg-gray-700 rounded text-sm"
              >
                <FaTachometerAlt className="w-4 h-4" />
                Dashboard
              </Link>
            </div>
          )}
        </div>

        {/* Organization Profile Dropdown */}
        <div>
          <button
            onClick={() => toggleMenu("organization")}
            className="flex items-center justify-between w-full p-2 hover:bg-gray-700 rounded"
          >
            <div className="flex items-center gap-2">
              <FiBriefcase className="w-4 h-4" />
              <span>Organization Profile</span>
            </div>
            {openMenus.organization ? <FiChevronUp /> : <FiChevronDown />}
          </button>
          {openMenus.organization && (
            <div className="ml-6 mt-1 space-y-2">
              <Link
                href="/hr-module/organizational-structure"
                className="flex items-center gap-2 p-2 hover:bg-gray-700 rounded text-sm"
              >
                <FiLayers className="w-4 h-4" />
                Organizational Structure
              </Link>
              <Link
                href="/hr-module/salary-settings"
                className="flex items-center gap-2 p-2 hover:bg-gray-700 rounded text-sm"
              >
                <FiDollarSign className="w-4 h-4" />
                Salary Settings
              </Link>
              <Link
                href="/hr-module/register-jobs"
                className="flex items-center gap-2 p-2 hover:bg-gray-700 rounded text-sm"
              >
                <FiFileText className="w-4 h-4" />
                Register Jobs
              </Link>
              <Link
                href="/hr-module/job-qualifications"
                className="flex items-center gap-2 p-2 hover:bg-gray-700 rounded text-sm"
              >
                <FiAward className="w-4 h-4" />
                Job Qualifications
              </Link>
              <Link
                href="/hr-module/jobs-by-family"
                className="flex items-center gap-2 p-2 hover:bg-gray-700 rounded text-sm"
              >
                <FiUsers className="w-4 h-4" />
                Jobs Under Family
              </Link>
              <Link
                href="/hr-module/jobs-by-department"
                className="flex items-center gap-2 p-2 hover:bg-gray-700 rounded text-sm"
              >
                <FiArchive className="w-4 h-4" />
                Jobs Under Department
              </Link>
            </div>
          )}
        </div>

        {/* Employee Profile Dropdown */}
        <div>
          <button
            onClick={() => toggleMenu("employee")}
            className="flex items-center justify-between w-full p-2 hover:bg-gray-700 rounded"
          >
            <div className="flex items-center gap-2">
              <FiUser className="w-4 h-4" />
              <span>Employee Profile</span>
            </div>
            {openMenus.employee ? <FiChevronUp /> : <FiChevronDown />}
          </button>
          {openMenus.employee && (
            <div className="ml-6 mt-1 space-y-2">
              <Link
                href="/hr-module/Employee-Profile"
                className="flex items-center gap-2 p-2 hover:bg-gray-700 rounded text-sm"
              >
                <FiUser className="w-4 h-4" />
                Employee Info
              </Link>
            </div>
          )}
        </div>
      </nav>
    </aside>
  );
}
