"use client";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiPlus,
  FiX,
  FiEdit2,
  FiBriefcase,
  FiRefreshCw,
  FiSave, // For the new job type modal
} from "react-icons/fi";

// Assuming the library does not provide convertToEthiopian, implement it manually
function convertToEthiopian(
  year: number,
  month: number,
  day: number
): { year: number; month: number; day: number } {
  // Implement the conversion logic or use an alternative library
  console.warn(
    "convertToEthiopian is not available in the library. Replace this with actual logic."
  );
  return { year: year - 8, month: month - 4, day: day - 7 }; // Dummy conversion logic
}

// Placeholder for convertToGregorian function if not provided by the library
function convertToGregorian(
  year: number,
  month: number,
  day: number
): { year: number; month: number; day: number } {
  // Implement the conversion logic or use an alternative library
  console.warn(
    "convertToGregorian is not available in the library. Replace this with actual logic."
  );
  return { year, month, day }; // Dummy return
}

// Convert Gregorian to Ethiopian
const ethiopianDate = convertToEthiopian(2025, 5, 15);
console.log("Ethiopian Date:", ethiopianDate); // Example output: { year: 2017, month: 9, day: 7 }

// Convert Ethiopian to Gregorian
const gregorianDate = convertToGregorian(2017, 9, 7);
console.log("Gregorian Date:", gregorianDate); // Example output: { year: 2025, month: 5, day: 15 }

function convertGregorianToEthiopian(
  gregorianDateString: string
): string | null {
  if (!gregorianDateString) return "";
  try {
    const [year, month, day] = gregorianDateString.split("-").map(Number);
    if (isNaN(year) || isNaN(month) || isNaN(day)) {
      throw new Error("Invalid date format");
    }
    // Implement actual conversion logic here
    const ethDate = convertToEthiopian(year, month, day);
    const formattedEthDate = `${ethDate.year}-${ethDate.month
      .toString()
      .padStart(2, "0")}-${ethDate.day.toString().padStart(2, "0")}`;
    console.log(
      `Converted ${gregorianDateString} to Ethiopian ${formattedEthDate}`
    );
    return formattedEthDate;
  } catch (e) {
    console.error("Conversion failed:", e);
    return null;
  }
}

interface JobTypeOption {
  id: number; // This is the ID from HR_LU_JOB_TYPE
  jobTitle: string;
  jobTitleInAmharic: string;
  code?: string; // Added code, assuming it might be useful
}

interface Experience {
  id: number; // Can be 0 for new experience
  version?: number; // For optimistic locking
  employeeId: string; // This should be the EMP_ID
  jobTitle: string; // Selected English job title
  jobTitleInAmharic: string; // Selected Amharic job title
  refNo: string;
  startDateEC: string; // Corresponds to Experience entity's recordedDate
  startDateGC: string;
  endDateEC: string; // Corresponds to Experience entity's dateGc
}

// Initial form data structure
const initialFormData: Omit<Experience, "id" | "version"> = {
  employeeId: "1", // Default or get from context/props
  jobTitle: "",
  jobTitleInAmharic: "",
  refNo: "",
  startDateEC: "",
  startDateGC: "",
  endDateEC: "",
};

const initialNewJobTypeFormData = {
  code: "",
  jobTitle: "",
  jobTitleInAmharic: "",
  status: "Active", // Default status
  description: "",
};

export default function ExperienceTab() {
  const [showExperienceForm, setShowExperienceForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [formData, setFormData] =
    useState<Omit<Experience, "id" | "version">>(initialFormData);
  const [jobTypeOptions, setJobTypeOptions] = useState<JobTypeOption[]>([]);

  const [showNewJobTypeModal, setShowNewJobTypeModal] = useState(false);
  const [newJobTypeFormData, setNewJobTypeFormData] = useState(
    initialNewJobTypeFormData
  );
  const [newJobTypeLoading, setNewJobTypeLoading] = useState(false);
  const [newJobTypeError, setNewJobTypeError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const API_URL = "http://localhost:8080/api"; // Define base URL

  const fetchExperiences = useCallback(
    async (employeeIdToFetch: string = "1") => {
      // Default to "1" or get from context/props
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get<Experience[]>( // Expect an array of Experience
          `${API_URL}/employees/${employeeIdToFetch}/experiences`,
          {
            timeout: 5000,
            headers: { Accept: "application/json" },
          }
        );
        setExperiences(response.data || []); // Ensure experiences is always an array
      } catch (err) {
        let errorMessage = "Failed to fetch experiences";
        if (axios.isAxiosError(err)) {
          if (err.code === "ECONNABORTED") {
            errorMessage = "Request timeout. Please check your connection.";
          } else if (err.response) {
            errorMessage = `Server error: ${err.response.status} - ${
              err.response.data?.message || err.response.statusText
            }`;
          } else if (err.request) {
            errorMessage = "No response from server. Is the backend running?";
          }
        }
        setError(errorMessage);
        console.error("Error fetching experiences:", err);
        setExperiences([]); // Set to empty array on error
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchJobTypes = useCallback(async () => {
    try {
      const response = await axios.get<JobTypeOption[]>(
        `${API_URL}/jobtypes/titles-for-dropdown`
      );
      setJobTypeOptions(
        response.data.map((jobType) => ({
          id: jobType.id,
          jobTitle: jobType.jobTitle,
          jobTitleInAmharic: jobType.jobTitleInAmharic,
          code: jobType.code,
        }))
      );
    } catch (err) {
      console.error("Error fetching job types:", err);
      setError("Failed to load job types for dropdowns.");
      setJobTypeOptions([]);
    }
  }, []);

  useEffect(() => {
    // Assuming employeeId '1' is for testing.
    // In a real app, this ID would come from user context or props.
    setFormData((prev) => ({ ...prev, employeeId: "1" }));
    fetchExperiences("1");
    fetchJobTypes();
  }, [fetchExperiences, fetchJobTypes]);

  // In the saveExperience function:
  const saveExperience = async (
    experienceDataToSave: Omit<Experience, "id" | "version">,
    currentId: number | null
  ) => {
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      const pathEmployeeId = experienceDataToSave.employeeId || "1";
      const payloadForSave: Partial<Experience> = { ...experienceDataToSave };

      let response;
      if (currentId) {
        // For updates, fetch the current version first
        try {
          const currentExpResponse = await axios.get<Experience>(
            `${API_URL}/employees/${pathEmployeeId}/experiences/${currentId}`
          );
          payloadForSave.version = currentExpResponse.data.version;
        } catch (fetchErr) {
          console.error(
            "Error fetching current experience for version:",
            fetchErr
          );
          setError(
            "Could not verify current record version. Please refresh and try again."
          );
          setLoading(false);
          return false;
        }
        payloadForSave.id = currentId;

        response = await axios.put(
          `${API_URL}/employees/${pathEmployeeId}/experiences/${currentId}`,
          payloadForSave
        );
        setSuccessMessage("Experience updated successfully!");
      } else {
        // For creates, remove id and version
        const { id, version, ...createPayload } = payloadForSave as Experience;
        response = await axios.post(
          `${API_URL}/employees/${pathEmployeeId}/experiences`,
          createPayload
        );
        setSuccessMessage("Experience added successfully!");
      }

      await fetchExperiences(pathEmployeeId);
      return true;
    } catch (err) {
      let errorMessage = "Failed to save experience";
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 409) {
          errorMessage =
            "This record was modified by another user. Please refresh and try again.";
        } else if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.response?.data) {
          errorMessage =
            typeof err.response.data === "string"
              ? err.response.data
              : JSON.stringify(err.response.data);
        } else if (err.code === "ECONNABORTED") {
          errorMessage = "Request timeout.";
        } else if (err.request) {
          errorMessage = "No response from server.";
        }
      }
      setError(errorMessage);
      console.error("Error saving experience:", err);
      return false;
    } finally {
      setLoading(false);
      setTimeout(() => {
        setSuccessMessage(null);
        setError(null);
      }, 5000);
    }
  };

  const handleEditExperience = (exp: Experience) => {
    setEditingId(exp.id);
    setFormData({
      employeeId: exp.employeeId, // This should be the EMP_ID
      jobTitle: exp.jobTitle,
      jobTitleInAmharic: exp.jobTitleInAmharic,
      refNo: exp.refNo,
      startDateEC: exp.startDateEC,
      startDateGC: exp.startDateGC,
      endDateEC: exp.endDateEC,
    });
    setShowExperienceForm(true);
  };

  const resetExperienceFormAndState = () => {
    setFormData(initialFormData); // Reset to initial state with default employeeId
    setShowExperienceForm(false);
    setEditingId(null);
    setError(null);
  };

  const handleSubmitExperience = async () => {
    // Basic validation
    if (!formData.jobTitle) {
      setError("Job Title (English) is required.");
      return;
    }
    if (!formData.startDateGC) {
      // Assuming GC start date is a key required field
      setError("Start Date (GC) is required.");
      return;
    }

    const success = await saveExperience(formData, editingId);
    if (success) {
      resetExperienceFormAndState();
    }
  };

  // Handler for standard input fields (like refNo, startDateGC)
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updatedFormData = { ...prev, [name]: value };

      // --- Automatic EC Date Calculation ---
      // If the changed field is startDateGC (Gregorian date)
      if (name === "startDateGC" && value) {
        const ethiopianDate = convertGregorianToEthiopian(value);
        if (ethiopianDate !== null) {
          updatedFormData.startDateEC = ethiopianDate;
        } else {
          // Handle conversion error or invalid date input
          updatedFormData.startDateEC = "Invalid Date"; // Or clear the field, show error
          console.error(
            "Failed to convert Gregorian date to Ethiopian:",
            value
          );
        }
      }
      // --- End Automatic EC Date Calculation ---

      return updatedFormData;
    });
  };

  const handleEthiopianDateChange = (name: string, dateString: string) => {
    setFormData((prev) => ({ ...prev, [name]: dateString }));
  };

  const handleJobTitleDropdownChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedJobTypeId = e.target.value;
    const selectedOption = jobTypeOptions.find(
      (opt) => opt.id.toString() === selectedJobTypeId
    );

    if (selectedOption) {
      setFormData((prev) => ({
        ...prev,
        jobTitle: selectedOption.jobTitle,
        jobTitleInAmharic: selectedOption.jobTitleInAmharic,
      }));
    } else {
      // Handle "-- Select --" or if somehow no option is found
      setFormData((prev) => ({
        ...prev,
        jobTitle: "",
        jobTitleInAmharic: "",
      }));
    }
  };

  // --- New Job Type Modal Logic ---
  const handleNewJobTypeInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setNewJobTypeFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveNewJobType = async () => {
    if (!newJobTypeFormData.code || !newJobTypeFormData.jobTitle) {
      setNewJobTypeError("Code and Job Title (English) are required.");
      return;
    }
    try {
      setNewJobTypeLoading(true);
      setNewJobTypeError(null);

      const response = await axios.post<JobTypeOption>( // Expecting the created JobTypeOption back
        `${API_URL}/jobtypes`,
        newJobTypeFormData
      );

      await fetchJobTypes(); // Refresh the dropdown options
      setShowNewJobTypeModal(false);
      setNewJobTypeFormData(initialNewJobTypeFormData);

      // Update the form with the new job type
      if (response.data) {
        setFormData((prev) => ({
          ...prev,
          jobTitle: response.data.jobTitle,
          jobTitleInAmharic: response.data.jobTitleInAmharic || "",
        }));
      }
      setSuccessMessage("New job type added successfully!");
    } catch (err) {
      let errorMessage = "Failed to save new job type.";
      if (axios.isAxiosError(err)) {
        if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.response?.data) {
          errorMessage =
            typeof err.response.data === "string"
              ? err.response.data
              : JSON.stringify(err.response.data);
        }
      }
      setNewJobTypeError(errorMessage);
      console.error("Error saving new job type:", err);
    } finally {
      setNewJobTypeLoading(false);
      setTimeout(() => {
        setSuccessMessage(null); // Clear general success message if it was set by this action
      }, 5000);
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Error and Success Messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <span className="block sm:inline">{error}</span>
          <button
            onClick={() => setError(null)}
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
          >
            <FiX />
          </button>
        </div>
      )}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
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
      {(loading || newJobTypeLoading) && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Blur overlay for Experience Form */}
      {showExperienceForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black z-10"
        />
      )}

      {/* Experience Form Popup */}
      <AnimatePresence>
        {showExperienceForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 flex items-center justify-center z-20 p-4"
          >
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl shadow-lg border border-gray-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-[#3c8dbc]">
                  {editingId ? "Edit Experience" : "Add New Experience"}
                </h3>
                <button
                  onClick={resetExperienceFormAndState}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <FiX
                    size={20}
                    className="text-gray-500 hover:text-gray-700"
                  />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Job Title (English) Dropdown */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Job Title (English) <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <select
                      name="jobTitle"
                      value={
                        jobTypeOptions.find(
                          (opt) => opt.jobTitle === formData.jobTitle
                        )?.id || ""
                      }
                      onChange={handleJobTitleDropdownChange}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">-- Select Job Title --</option>
                      {jobTypeOptions.map((option) => (
                        <option key={`en-${option.id}`} value={option.id}>
                          {option.jobTitle}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowNewJobTypeModal(true)}
                      className="p-2 bg-blue-100 text-blue-600 hover:bg-blue-200 transition-all"
                      title="Add New Job Type"
                    >
                      <FiPlus size={16} />
                    </button>
                  </div>
                </div>

                {/* Job Title (Amharic) Dropdown */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Job Title (Amharic)
                  </label>
                  <div className="flex items-center gap-2">
                    <select
                      name="jobTitleInAmharic"
                      value={
                        jobTypeOptions.find(
                          (opt) =>
                            opt.jobTitleInAmharic === formData.jobTitleInAmharic
                        )?.id || ""
                      }
                      onChange={handleJobTitleDropdownChange} // Same handler can update both based on ID
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">-- የስራ አርእስት ይምረጡ --</option>
                      {jobTypeOptions.map((option) => (
                        <option key={`am-${option.id}`} value={option.id}>
                          {option.jobTitleInAmharic}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowNewJobTypeModal(true)}
                      className="p-2  bg-blue-100 text-blue-600 hover:bg-blue-200 transition-all"
                      title="Add New Job Type"
                    >
                      <FiPlus size={16} />
                    </button>
                  </div>
                </div>

                {/* Start Date (GC) */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Start Date (GC) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="startDateGC"
                    value={formData.startDateGC}
                    onChange={handleInputChange} // This handler now triggers EC calculation
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Reference Number */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Reference Number
                  </label>
                  <input
                    type="text"
                    name="refNo"
                    value={formData.refNo}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter reference number"
                  />
                </div>

                {/* Start Date (EC) - Ethiopian Calendar Date Picker */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Start Date (EC)
                  </label>
                  <input
                    type="text" // Keep as text until a real EC date picker is integrated
                    name="startDateEC"
                    value={formData.startDateEC}
                    readOnly // Make it read-only since it's auto-filled from GC date
                    className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100"
                    placeholder="Enter start date in EC"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    End Date (EC)
                  </label>
                  <input
                    type="text" // Keep as text until a real EC date picker is integrated
                    name="endDateEC"
                    value={formData.endDateEC}
                    readOnly // Make it read-only since it's auto-filled from GC date
                    className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100"
                    placeholder="Enter end date in EC"
                  />
                </div>
              </div>

              <div className="flex gap-4 justify-end">
                <button
                  onClick={handleSubmitExperience}
                  className="px-4 py-2 bg-[#3c8dbc] text-white rounded-lg hover:bg-[#367fa9] shadow-lg hover:shadow-xl"
                  disabled={loading}
                >
                  {loading ? "Processing..." : editingId ? "Update " : "Save"}
                </button>
                <button
                  onClick={resetExperienceFormAndState}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 shadow-md hover:shadow-lg"
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add New Job Type Modal */}
      <AnimatePresence>
        {showNewJobTypeModal && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 flex items-center justify-center z-40 p-4" // Higher z-index
          >
            <div // Modal content
              className="bg-white p-6 rounded-xl shadow-2xl border border-gray-300 w-full max-w-md"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800">
                  Add New Job Type
                </h3>
                <button
                  onClick={() => {
                    setShowNewJobTypeModal(false);
                    setNewJobTypeFormData(initialNewJobTypeFormData);
                    setNewJobTypeError(null);
                  }}
                  className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <FiX size={18} className="text-gray-600" />
                </button>
              </div>

              {newJobTypeError && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-4 text-sm">
                  {newJobTypeError}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={newJobTypeFormData.code}
                    onChange={handleNewJobTypeInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500"
                    placeholder="Enter job code"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Job Title (English) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="jobTitle"
                    value={newJobTypeFormData.jobTitle}
                    onChange={handleNewJobTypeInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500"
                    placeholder="Enter Job Title in English"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Job Title (Amharic)
                  </label>
                  <input
                    type="text"
                    name="jobTitleInAmharic"
                    value={newJobTypeFormData.jobTitleInAmharic}
                    onChange={handleNewJobTypeInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500"
                    placeholder="Enter Job Title in Amharic"
                  />
                </div>
                {/* You can add inputs for status and description if needed for JobType */}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={handleSaveNewJobType}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-400 flex items-center gap-2"
                  disabled={newJobTypeLoading}
                >
                  {newJobTypeLoading ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => {
                    setShowNewJobTypeModal(false);
                    setNewJobTypeFormData(initialNewJobTypeFormData);
                    setNewJobTypeError(null);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                  disabled={newJobTypeLoading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Experience Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`bg-white rounded-xl shadow-lg overflow-hidden ${
          showExperienceForm || showNewJobTypeModal
            ? "blur-sm pointer-events-none"
            : ""
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
              onClick={() => fetchExperiences(formData.employeeId || "1")}
              className="flex items-center bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-1 rounded-md shadow-sm hover:shadow transition-all duration-300 border border-white border-opacity-20 text-xs md:text-sm"
              title="Refresh Experiences"
              disabled={loading}
            >
              <FiRefreshCw size={16} />
            </button>
            <button
              onClick={() => {
                setEditingId(null); // Ensure we are in "add" mode
                setFormData(initialFormData); // Reset form for new entry
                setShowExperienceForm(true);
              }}
              className="flex items-center bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-1 rounded-md shadow-sm hover:shadow transition-all duration-300 border border-white border-opacity-20 text-xs md:text-sm"
            >
              <FiPlus size={16} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {experiences.length === 0 && !loading ? (
            <div className="p-4 text-center text-gray-500">
              No experiences found. Add your first experience.
            </div>
          ) : loading && experiences.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              Loading experiences...
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 text-xs">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    "NO",
                    "Job Title",
                    "Job Title (Amharic)",
                    "Start Date (GC)",
                    "Reference No.",
                    "Start Date (EC)",
                    "End Date (EC)",
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
                  <tr key={exp.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {idx + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {exp.jobTitle}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {exp.jobTitleInAmharic || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {exp.startDateGC || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {exp.refNo || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {exp.startDateEC || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {exp.endDateEC || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleEditExperience(exp)}
                          className="text-[#3c8dbc] hover:text-blue-700 p-1 rounded-full hover:bg-blue-50"
                          title="Edit Experience"
                        >
                          <FiEdit2 size={16} />
                        </button>
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
