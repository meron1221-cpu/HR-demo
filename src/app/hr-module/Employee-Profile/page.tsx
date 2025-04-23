"use client";
// import EmployeeProfile from "../Employee-Profile/components/profile";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
// import LanguageSkillsTable from "../Employee-Profile/components/LanguageSkillsTable";
// import EmployeeForm from "../Employee-Profile/components/EmployeeForm";
// import FamilyTable from "./components/FamilyMembers";
import AddressTab from "../Employee-Profile/components/Address";
import TrainingTab from "../Employee-Profile/components/Training";
import CostSharingTab from "../Employee-Profile/components/CostSharing";
import EditExperienceTab from "../Employee-Profile/components/EditExperience";
// import Education from '../Employee-Profile/components/Education';
// import Experience from '../Employee-Profile/components/Experience';
// import Promotion from '../Employee-Profile/components/Promotion';
// import Upload from '../Employee-Profile/components/Upload';
import {
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
  FiUser,
  FiFileText,
  FiBriefcase,
} from "react-icons/fi";

type Employee = {
  id: number;
  employeeId: string;
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  nationality: string;
  name: string;
  position: string;
  department: string;
  status: string;
  profileImage?: string;
  [key: string]: any;
};

const mockEmployees: Employee[] = [
  {
    id: 20005835,
    employeeId: "20005835",
    name: "John Doe",
    firstName: "John",
    lastName: "Doe",
    position: "Senior Developer",
    department: "Engineering",
    status: "Active",
    profileImage: "/profile1.jpg",
    gender: "Male",
    dateOfBirth: "1985-05-15",
    nationality: "American",
  },
  {
    id: 20005836,
    employeeId: "20005836",
    name: "Jane Smith",
    firstName: "Jane",
    lastName: "Smith",
    position: "UX Designer",
    department: "Design",
    status: "Active",
    profileImage: "/profile2.jpg",
    gender: "Female",
    dateOfBirth: "1990-08-22",
    nationality: "British",
  },
  {
    id: 20005837,
    employeeId: "20005837",
    name: "Mike Johnson",
    firstName: "Mike",
    lastName: "Johnson",
    position: "Product Manager",
    department: "Management",
    status: "On Leave",
    gender: "Male",
    dateOfBirth: "1982-11-30",
    nationality: "Canadian",
  },
];

export default function EmployeeProfilePage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const tabs = [
    { id: "profile", name: "Profile", icon: <FiUser /> },
    { id: "new", name: "New", icon: <FiUserPlus /> },
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

  useEffect(() => {
    if (employees.length > 0 && !currentEmployee) {
      setCurrentEmployee(employees[0]);
    }
  }, [employees, currentEmployee]);

  const handleNewEmployee = () => {
    setIsEditMode(false);
    setCurrentEmployee(null);
    setActiveTab("new");
  };

  const handleEditEmployee = () => {
    setIsEditMode(true);
    setActiveTab("new");
  };

  const handleRefresh = () => {
    setLastRefresh(new Date());
    alert("Employee data refreshed successfully!");
  };

  // const handleFormSubmit = (formData: Omit<Employee, 'id'> & Partial<Employee>) => {
  //     if (isEditMode && currentEmployee) {
  //       const updatedEmployees = employees.map(emp =>
  //         emp.id === currentEmployee.id ? { ...emp, ...formData } : emp
  //       );
  //       setEmployees(updatedEmployees);
  //       setCurrentEmployee({ ...currentEmployee, ...formData });
  //       alert("Employee updated successfully!");
  //     } else {
  //       const newId = Math.max(0, ...employees.map(e => e.id)) + 1;
  //       const newEmployee: Employee = {
  //         id: newId,
  //         employeeId: formData.employeeId  newId.toString(),
  //         name: `${formData.firstName  ''} ${formData.lastName  ''}`.trim(),
  //         firstName: formData.firstName  '',
  //         lastName: formData.lastName  '',
  //         gender: formData.gender  '',
  //         dateOfBirth: formData.dateOfBirth  '',
  //         nationality: formData.nationality  '',
  //         position: formData.position  '',
  //         department: formData.department  '',
  //         status: formData.status || 'Active',
  //         profileImage: formData.profileImage,
  //         ...formData
  //       };
  //       setEmployees(prev => [...prev, newEmployee]);
  //       setCurrentEmployee(newEmployee);
  //       alert("Employee created successfully!");
  //     }
  //     setActiveTab("profile");
  //   };

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col"
        >
          <div className="flex justify-end items-center mb-2">
            {lastRefresh && (
              <div className="text-xs text-gray-500 mr-2">
                Last refreshed: {lastRefresh.toLocaleTimeString()}
              </div>
            )}
            <button
              onClick={handleRefresh}
              className="px-3 py-1.5 bg-gray-500 text-white rounded-lg flex items-center gap-1 text-sm hover:bg-gray-600 transition-all shadow hover:shadow-md"
            >
              <FiRefreshCw size={14} />
              Refresh
            </button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="flex overflow-x-auto border-b border-gray-200 pb-1 scrollbar-hide"
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() =>
                  tab.id === "new" ? handleNewEmployee() : setActiveTab(tab.id)
                }
                className={`px-4 py-2 flex items-center gap-2 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600 bg-blue-50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <span className="text-base">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </motion.div>
        </motion.div>
        {/* {activeTab === "profile" && currentEmployee && (
          <EmployeeProfile
            employee={currentEmployee}
            onEdit={handleEditEmployee}
          /> */}
        {/* )} */}
        {activeTab === "address" && (
          <div className="mt-10">
            <AddressTab />
          </div>
        )}
        {activeTab === "training" && (
          <div className="mt-10">
            <TrainingTab />
          </div>
        )}
        {activeTab === "cost-sharing" && (
          <div className="mt-10">
            <CostSharingTab />
          </div>
        )}

        {activeTab === "edit" && (
          <div className="mt-10">
            <EditExperienceTab />
          </div>
        )}
        {/* 
        {activeTab === "education" && (
          <div className="mt-10">
            {" "}
            <Education />
          </div>
        )}
        {activeTab === "experience" && (
          <div className="mt-10">
            {" "}
            <Experience />
          </div>
        )}
        {activeTab === "promotion" && (
          <div className="mt-10">
            {" "}
            <Promotion />
          </div>
        )}
        {activeTab === "upload" && (
          <div className="mt-10">
            {" "}
            <Upload />
          </div>
        )} */}
        {/* {activeTab === "language" && (
          <div className="mt-4">
            <LanguageSkillsTable />
          </div>
        )}
        {activeTab === "family" && (
          <div className="mt-4">
            {" "}
            <FamilyTable />
          </div>
        )} */}
        {/* {activeTab === "new" && (
          <div className="bg-white rounded-lg shadow-md p-4 mt-3">
            <EmployeeForm
              employeeData={currentEmployee}
              isEditMode={isEditMode}
              onSubmit={handleFormSubmit}
              onCancel={() => setActiveTab("profile")}
            />
          </div>
        )} */}
        {activeTab !== "profile" &&
          activeTab !== "language" &&
          activeTab !== "family" &&
          activeTab !== "new" &&
          activeTab !== "address" &&
          activeTab !== "training" &&
          activeTab !== "cost-sharing" &&
          activeTab !== "edit" &&
          activeTab !== "print" && (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <p>
                {tabs.find((t) => t.id === activeTab)?.name} content will appear
                here
              </p>
            </div>
          )}
      </div>
    </div>
  );
}
