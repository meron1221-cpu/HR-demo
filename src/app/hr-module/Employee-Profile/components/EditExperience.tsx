"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiPlus,
  FiX,
  FiCalendar,
  FiEdit2,
  FiBriefcase,
  FiTrash2,
  FiRefreshCw,
} from "react-icons/fi";

interface Experience {
  id: number;
  version?: number;
  employeeId: string;
  jobTitleEnglish: string;
  jobTitleAmharic: string;
  startDateEC: string;
  startDateGC: string;
  endDateGC: string;
  endDateEC: string;
  refNo: string;
  institution: string;
  employmentType: string;
  organizationType: string;
  reasonForTermination: string;
  responsibility: string;
  salary: number;
  internal: number;
}

export default function ExperienceTab() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [formData, setFormData] = useState<Omit<Experience, "id">>({
    employeeId: "",
    jobTitleEnglish: "",
    jobTitleAmharic: "",
    startDateEC: "",
    startDateGC: "",
    endDateGC: "",
    endDateEC: "",
    refNo: "",
    institution: "",
    employmentType: "",
    organizationType: "",
    reasonForTermination: "",
    responsibility: "",
    salary: 0,
    internal: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchExperiences = async () => {
    try {
      setLoading(true);
      setError(null);
      const employeeId = "1";
      const response = await axios.get(
        `http://localhost:8080/api/employees/${employeeId}/experiences`,
        {
          timeout: 5000,
          headers: {
            Accept: "application/json",
          },
        }
      );

      setExperiences(
        response.data.map((exp: any) => ({
          ...exp,
          startDateGC: exp.startDateGC
            ? new Date(exp.startDateGC).toISOString().split("T")[0]
            : "",
          endDateGC: exp.endDateGC
            ? new Date(exp.endDateGC).toISOString().split("T")[0]
            : "",
        }))
      );
    } catch (err) {
      let errorMessage = "Failed to fetch experiences";
      if (axios.isAxiosError(err)) {
        if (err.code === "ECONNABORTED") {
          errorMessage = "Request timeout. Please check your connection.";
        } else if (err.response) {
          if (err.response.status === 404) {
            errorMessage = "Employee not found";
          } else {
            errorMessage = `Server error: ${err.response.status}`;
          }
        } else if (err.request) {
          errorMessage = "No response from server. Is the backend running?";
        }
      }
      setError(errorMessage);
      console.error("Error fetching experiences:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiences();
  }, []);

  const saveExperience = async (experienceData: Experience) => {
    try {
      setLoading(true);
      setError(null);
      const employeeId = "1";

      const payload = {
        ...experienceData,
        // Remove ID if it's 0 (new record)
        id: experienceData.id === 0 ? undefined : experienceData.id,
        startDateGC: experienceData.startDateGC
          ? new Date(experienceData.startDateGC).toISOString()
          : null,
        endDateGC: experienceData.endDateGC
          ? new Date(experienceData.endDateGC).toISOString()
          : null,
        salary: experienceData.salary || 0,
        internal: experienceData.internal || 0,
      };

      let response;
      if (experienceData.id && experienceData.id !== 0) {
        response = await axios.put(
          `http://localhost:8080/api/employees/${employeeId}/experiences/${experienceData.id}`,
          payload,
          {
            timeout: 5000,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        setSuccessMessage("Experience updated successfully!");
      } else {
        response = await axios.post(
          `http://localhost:8080/api/employees/${employeeId}/experiences`,
          payload,
          {
            timeout: 5000,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        setSuccessMessage("Experience added successfully!");
      }

      await fetchExperiences();
      return true;
    } catch (err) {
      let errorMessage = "Failed to save experience";
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 409) {
          errorMessage =
            "This record was modified by another user. Please refresh and try again.";
        } else if (err.response?.data) {
          errorMessage =
            typeof err.response.data === "string"
              ? err.response.data
              : JSON.stringify(err.response.data);
        }
      }
      setError(errorMessage);
      console.error("Error saving experience:", err);
      return false;
    } finally {
      setLoading(false);
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    }
  };

  const deleteExperience = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const employeeId = "1";
      await axios.delete(
        `http://localhost:8080/api/employees/${employeeId}/experiences/${id}`,
        {
          timeout: 5000,
        }
      );
      setSuccessMessage("Experience deleted successfully!");
      await fetchExperiences();
      return true;
    } catch (err) {
      setError("Failed to delete experience");
      console.error("Error deleting experience:", err);
      return false;
    } finally {
      setLoading(false);
      setTimeout(() => setSuccessMessage(null), 5000);
    }
  };

  const handleEditExperience = (exp: Experience) => {
    setEditingId(exp.id);
    setFormData({
      employeeId: exp.employeeId,
      jobTitleEnglish: exp.jobTitleEnglish,
      jobTitleAmharic: exp.jobTitleAmharic,
      startDateEC: exp.startDateEC,
      startDateGC: exp.startDateGC,
      endDateGC: exp.endDateGC,
      endDateEC: exp.endDateEC,
      refNo: exp.refNo,
      institution: exp.institution || "",
      employmentType: exp.employmentType || "",
      organizationType: exp.organizationType || "",
      reasonForTermination: exp.reasonForTermination || "",
      responsibility: exp.responsibility || "",
      salary: exp.salary || 0,
      internal: exp.internal || 0,
    });
    setShowForm(true);
  };

  const handleAddExperience = async () => {
    const experienceData = {
      id: editingId || 0,
      ...formData,
    };

    const success = await saveExperience(experienceData);
    if (success) {
      setFormData({
        employeeId: "",
        jobTitleEnglish: "",
        jobTitleAmharic: "",
        startDateEC: "",
        startDateGC: "",
        endDateGC: "",
        endDateEC: "",
        refNo: "",
        institution: "",
        employmentType: "",
        organizationType: "",
        reasonForTermination: "",
        responsibility: "",
        salary: 0,
        internal: 0,
      });
      setShowForm(false);
      setEditingId(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this experience?")) {
      await deleteExperience(id);
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Error Message */}
      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
          <button
            onClick={() => setError(null)}
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
          >
            <FiX />
          </button>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div
          className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <span className="block sm:inline">{successMessage}</span>
          <button
            onClick={() => setSuccessMessage(null)}
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
          >
            <FiX />
          </button>
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-30">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

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
                  {editingId ? "Edit Experience" : "Add New Experience"}
                </motion.h3>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({
                      employeeId: "",
                      jobTitleEnglish: "",
                      jobTitleAmharic: "",
                      startDateEC: "",
                      startDateGC: "",
                      endDateGC: "",
                      endDateEC: "",
                      refNo: "",
                      institution: "",
                      employmentType: "",
                      organizationType: "",
                      reasonForTermination: "",
                      responsibility: "",
                      salary: 0,
                      internal: 0,
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
                {/* Job Title English */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Job Title (English) *
                  </label>
                  <input
                    type="text"
                    name="jobTitleEnglish"
                    value={formData.jobTitleEnglish}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter job title in English"
                    required
                  />
                </motion.div>

                {/* Job Title Amharic */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Job Title (Amharic)
                  </label>
                  <input
                    type="text"
                    name="jobTitleAmharic"
                    value={formData.jobTitleAmharic}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="የስራ አርእስት"
                  />
                </motion.div>

                {/* Start Date (Ethiopian) */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Start Date (EC)
                  </label>
                  <input
                    type="text"
                    name="startDateEC"
                    value={formData.startDateEC}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="YYYY-MM-DD"
                  />
                </motion.div>

                {/* Start Date (Gregorian) */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Start Date (GC) *
                  </label>
                  <input
                    type="date"
                    name="startDateGC"
                    value={formData.startDateGC}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </motion.div>

                {/* End Date (Gregorian) */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    End Date (GC)
                  </label>
                  <input
                    type="date"
                    name="endDateGC"
                    value={formData.endDateGC}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </motion.div>

                {/* End Date (Ethiopian) */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 }}
                >
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    End Date (EC)
                  </label>
                  <input
                    type="text"
                    name="endDateEC"
                    value={formData.endDateEC}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="YYYY-MM-DD"
                  />
                </motion.div>

                {/* Reference Number */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Reference Number
                  </label>
                  <input
                    type="text"
                    name="refNo"
                    value={formData.refNo}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter reference number"
                  />
                </motion.div>

                {/* Institution */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.45 }}
                >
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Institution
                  </label>
                  <input
                    type="text"
                    name="institution"
                    value={formData.institution}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter institution name"
                  />
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex gap-4 justify-end"
              >
                <button
                  onClick={handleAddExperience}
                  className="px-4 py-2 bg-[#3c8dbc] text-white rounded-lg hover:bg-[#367fa9] transition-all shadow-lg hover:shadow-xl"
                  disabled={loading}
                >
                  {loading ? "Processing..." : editingId ? "Update" : "Save"}
                </button>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({
                      employeeId: "",
                      jobTitleEnglish: "",
                      jobTitleAmharic: "",
                      startDateEC: "",
                      startDateGC: "",
                      endDateGC: "",
                      endDateEC: "",
                      refNo: "",
                      institution: "",
                      employmentType: "",
                      organizationType: "",
                      reasonForTermination: "",
                      responsibility: "",
                      salary: 0,
                      internal: 0,
                    });
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all shadow-md hover:shadow-lg"
                  disabled={loading}
                >
                  Cancel
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Table Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={`bg-white rounded-xl shadow-lg overflow-hidden ${
          showForm ? "blur-sm" : ""
        }`}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 bg-[#3c8dbc] rounded-lg shadow-md p-2 md:p-3 text-white h-[50px]">
          <div className="flex items-center">
            <FiBriefcase size={20} className="h-5 w-5 mr-2 text-blue-100" />
            <div>
              <h1 className="text-[14px] font-bold">Experience</h1>
              <p className="text-blue-100 text-xs">
                Manage your work experience information
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchExperiences}
              className="flex items-center bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-1 rounded-md shadow-sm hover:shadow transition-all duration-300 border border-white border-opacity-20 text-xs md:text-sm"
              title="Refresh"
            >
              <FiRefreshCw size={16} />
            </button>
            <button
              onClick={() => {
                setShowForm(true);
                setEditingId(null);
                setFormData({
                  employeeId: "",
                  jobTitleEnglish: "",
                  jobTitleAmharic: "",
                  startDateEC: "",
                  startDateGC: "",
                  endDateGC: "",
                  endDateEC: "",
                  refNo: "",
                  institution: "",
                  employmentType: "",
                  organizationType: "",
                  reasonForTermination: "",
                  responsibility: "",
                  salary: 0,
                  internal: 0,
                });
              }}
              className="flex items-center bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-1 rounded-md shadow-sm hover:shadow transition-all duration-300 border border-white border-opacity-20 text-xs md:text-sm"
            >
              <FiPlus size={16} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {experiences.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {loading
                ? "Loading..."
                : "No experiences found. Add your first experience."}
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 text-xs">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    "NO",
                    "Job Title (Eng)",
                    "Job Title (Amh)",
                    "Start Date (EC)",
                    "Start Date (GC)",
                    "End Date (GC)",
                    "Reference No.",
                    "Institution",
                    "Actions",
                  ].map((header, idx) => (
                    <th
                      key={idx}
                      className="px-6 py-3 text-left font-bold text-gray-700 tracking-wider"
                      style={{ fontSize: "12px" }}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {experiences.map((exp, idx) => (
                  <tr
                    key={exp.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {idx + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {exp.jobTitleEnglish}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {exp.jobTitleAmharic || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {exp.startDateEC || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {exp.startDateGC || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {exp.endDateGC || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {exp.refNo || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {exp.institution || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleEditExperience(exp)}
                          className="text-[#3c8dbc] hover:text-blue-700 p-1 rounded-full hover:bg-blue-50"
                          title="Edit"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(exp.id)}
                          className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
                          title="Delete"
                        ></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>
    </div>
  );
}
