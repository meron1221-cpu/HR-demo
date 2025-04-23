"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiPlus,
  FiX,
  FiCalendar,
  FiEdit2,
  FiBook,
  FiTrash2,
  FiRefreshCw, // Added for refresh button
} from "react-icons/fi";

interface Training {
  id: number;
  employeeId: string;
  institution: string;
  courseName: string;
  startDateEC: string;
  endDateEC: string;
  startDateGC: string;
  endDateGC: string;
  location: string;
  payment: number;
}

// Define initial state outside the component for reusability
const initialFormData: Omit<Training, "id"> = {
  employeeId: "", // This should ideally be set based on context/props
  institution: "",
  courseName: "",
  startDateEC: "",
  endDateEC: "",
  startDateGC: "",
  endDateGC: "",
  location: "",
  payment: 0,
};

export default function TrainingTab() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [formData, setFormData] =
    useState<Omit<Training, "id">>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null); // Added for success feedback
  const [formErrors, setFormErrors] = useState<Record<string, string>>({}); // Added for form validation

  // --- Data Fetching ---
  const fetchTrainings = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null); // Clear previous success messages
    try {
      const employeeId = "1"; // Hardcoded for now, should be dynamic
      const response = await axios.get(
        `http://localhost:8080/api/employees/${employeeId}/trainings`,
        {
          timeout: 5000, // Add timeout
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        }
      );
      const formattedTrainings = response.data.map((training: any) => ({
        ...training,
        // Format dates for display (YYYY-MM-DD)
        startDateGC: training.startDateGC
          ? new Date(training.startDateGC).toISOString().split("T")[0]
          : "",
        endDateGC: training.endDateGC
          ? new Date(training.endDateGC).toISOString().split("T")[0]
          : "",
      }));
      setTrainings(formattedTrainings);
    } catch (err) {
      let errorMessage = "Failed to fetch trainings. Please try again.";
      if (axios.isAxiosError(err)) {
        if (err.code === "ECONNABORTED") {
          errorMessage = "Request timeout. Please check your connection.";
        } else if (err.response) {
          errorMessage = `Server error (${err.response.status}): ${
            err.response.data?.message || "Could not fetch data"
          }`;
        } else if (err.request) {
          errorMessage = "No response from server. Is the backend running?";
        }
      }
      setError(errorMessage);
      console.error("Error fetching trainings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainings();
  }, []);

  // --- Form Validation ---
  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.institution.trim()) {
      errors.institution = "Institution is required";
    }
    if (!formData.courseName.trim()) {
      errors.courseName = "Course/Training Name is required";
    }
    if (formData.payment < 0) {
      errors.payment = "Payment cannot be negative";
    }
    // Basic date validation (check if end date is after start date if both exist)
    if (formData.startDateGC && formData.endDateGC) {
      if (new Date(formData.endDateGC) < new Date(formData.startDateGC)) {
        errors.endDateGC = "End date cannot be before start date";
      }
    }
    // Add more specific validation as needed (e.g., date formats for EC)

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // --- Data Mutation (Save/Update) ---
  const saveTraining = async (trainingData: Training) => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const employeeId = "1"; // Hardcoded for now
      // Check if we are updating (id exists and is not 0)
      const isUpdate = !!trainingData.id && trainingData.id !== 0;

      // Prepare payload, ensuring dates are ISO strings or null
      // Base payload without ID
      const basePayload = {
        // employeeId: employeeId, // Include if backend PUT requires it in body
        institution: trainingData.institution.trim(),
        courseName: trainingData.courseName.trim(),
        startDateEC: trainingData.startDateEC || null,
        endDateEC: trainingData.endDateEC || null,
        startDateGC: trainingData.startDateGC
          ? new Date(trainingData.startDateGC).toISOString()
          : null,
        endDateGC: trainingData.endDateGC
          ? new Date(trainingData.endDateGC).toISOString()
          : null,
        location: trainingData.location.trim(),
        payment: Number(trainingData.payment) || 0,
      };

      let response;
      if (isUpdate) {
        // --- UPDATE (PUT) ---
        // For PUT, the ID is in the URL, payload might or might not need it (check backend)
        // If backend DOES NOT expect ID in PUT body, use basePayload
        // If backend DOES expect ID in PUT body, add it: const payload = { ...basePayload, id: trainingData.id };
        response = await axios.put(
          `http://localhost:8080/api/employees/${employeeId}/trainings/${trainingData.id}`,
          basePayload, // Send the payload (adjust if backend needs ID in body)
          {
            headers: { "Content-Type": "application/json" },
            timeout: 5000,
          }
        );
        setSuccessMessage("Training updated successfully!");
      } else {
        // --- CREATE (POST) ---
        // For POST, ensure the ID is NOT sent in the payload
        // basePayload already excludes the ID, so we can use it directly
        response = await axios.post(
          `http://localhost:8080/api/employees/${employeeId}/trainings`,
          basePayload, // Send payload without ID
          {
            headers: { "Content-Type": "application/json" },
            timeout: 5000,
          }
        );
        setSuccessMessage("Training added successfully!");
      }

      await fetchTrainings(); // Refresh data
      return true; // Indicate success
    } catch (err) {
      console.error("Error saving training:", err);
      let errorMessage =
        "Failed to save training. Please check input and try again.";

      if (axios.isAxiosError(err)) {
        if (err.response) {
          console.error("Backend Error Data:", err.response.data); // Log the specific backend error
          console.error("Backend Error Status:", err.response.status);
          // Try to extract a meaningful message from backend response
          if (
            err.response.data &&
            typeof err.response.data.message === "string"
          ) {
            errorMessage = err.response.data.message;
          } else if (
            err.response.data &&
            typeof err.response.data === "string" // Handle plain string errors
          ) {
            errorMessage = err.response.data;
          } else if (err.response.status === 400) {
            errorMessage = "Invalid data submitted. Please check the fields.";
          } else if (err.response.status === 409) {
            errorMessage =
              "Conflict: This record might have been updated elsewhere. Please refresh.";
          } else {
            // Include backend's raw message if available and not handled above
            errorMessage = `Server error (${err.response.status}). ${
              err.response.data || "Please try again later."
            }`;
          }
        } else if (err.request) {
          errorMessage =
            "No response from server. Check network or backend status.";
        } else if (err.code === "ECONNABORTED") {
          errorMessage = "Request timed out. Please check your connection.";
        }
      }
      setError(errorMessage);
      return false; // Indicate failure
    } finally {
      setLoading(false);
      // Clear success message after a delay
      setTimeout(() => setSuccessMessage(null), 5000);
    }
  };

  // --- Data Mutation (Delete) ---
  const deleteTraining = async (id: number) => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const employeeId = "1"; // Hardcoded for now
      await axios.delete(
        `http://localhost:8080/api/employees/${employeeId}/trainings/${id}`,
        { timeout: 5000 }
      );
      setSuccessMessage("Training deleted successfully!");
      await fetchTrainings(); // Refresh data
      return true;
    } catch (err) {
      let errorMessage = "Failed to delete training. Please try again.";
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 409) {
          errorMessage = "Conflict: Record may have changed. Please refresh.";
        } else if (err.response) {
          errorMessage = `Server error (${err.response.status}).`;
        } else if (err.request) {
          errorMessage = "No response from server.";
        }
      }
      setError(errorMessage);
      console.error("Error deleting training:", err);
      return false;
    } finally {
      setLoading(false);
      setTimeout(() => setSuccessMessage(null), 5000);
    }
  };

  // --- Event Handlers ---
  const handleEditTraining = (training: Training) => {
    setEditingId(training.id);
    setFormData({
      employeeId: training.employeeId, // Keep employeeId if needed
      institution: training.institution,
      courseName: training.courseName,
      startDateEC: training.startDateEC || "", // Ensure empty strings if null/undefined
      endDateEC: training.endDateEC || "",
      startDateGC: training.startDateGC || "",
      endDateGC: training.endDateGC || "",
      location: training.location || "",
      payment: training.payment || 0,
    });
    setShowForm(true);
    setFormErrors({}); // Clear previous form errors
    setError(null); // Clear general errors
    setSuccessMessage(null);
  };

  const handleAddNewClick = () => {
    setShowForm(true);
    setEditingId(null);
    setFormData(initialFormData); // Reset form to initial state
    setFormErrors({});
    setError(null);
    setSuccessMessage(null);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(initialFormData);
    setFormErrors({});
    setError(null); // Optionally clear errors on cancel
  };

  const handleSaveOrUpdate = async () => {
    if (!validateForm()) {
      setError("Please fix the errors in the form."); // General form error message
      return;
    }

    // Prepare the data, ensuring id is correctly set for saveTraining logic
    const trainingData = {
      ...formData,
      // Pass the actual ID if editing, or 0/undefined if adding new
      // The saveTraining function will handle whether to include it in the payload
      id: editingId || 0,
    };

    const success = await saveTraining(trainingData);
    if (success) {
      handleCloseForm(); // Close form on successful save/update
    }
  };

  const handleDeleteClick = async () => {
    if (
      editingId &&
      confirm("Are you sure you want to delete this training?")
    ) {
      const success = await deleteTraining(editingId);
      if (success) {
        handleCloseForm(); // Close form on successful delete
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    });
    // Clear specific field error on change
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setError(null); // Clear general error when user types
  };

  // --- Helper Functions ---
  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return "-";
    // Assuming dateString is YYYY-MM-DD or can be parsed by Date
    try {
      const date = new Date(dateString);
      // Check if it's a valid date object before formatting
      if (isNaN(date.getTime())) {
        // Handle potentially invalid date strings (like EC dates if not parsed correctly)
        return dateString;
      }
      // Use a consistent display format if needed, e.g., locale-specific
      return date.toLocaleDateString(); // Adjust locale as needed
    } catch {
      return dateString; // Fallback for unexpected formats
    }
  };

  const formTitle = editingId ? "Edit Training" : "Add New Training";
  const submitButtonText = editingId ? "Update" : "Save";

  // --- Render ---
  return (
    <div className="space-y-6 relative">
      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
            <button
              onClick={() => setError(null)}
              className="absolute top-0 bottom-0 right-0 px-4 py-3"
              aria-label="Close error message"
            >
              <FiX />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Message */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <span className="block sm:inline">{successMessage}</span>
            <button
              onClick={() => setSuccessMessage(null)}
              className="absolute top-0 bottom-0 right-0 px-4 py-3"
              aria-label="Close success message"
            >
              <FiX />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Indicator (Optional - more subtle) */}
      {/* {loading && <div className="absolute top-2 right-2 text-gray-500">Loading...</div>} */}

      {/* Blur overlay */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black z-10"
          onClick={handleCloseForm} // Close form if overlay is clicked
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
            className="fixed inset-0 flex items-center justify-center z-20 p-4" // Added padding
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside form
          >
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl shadow-lg border border-gray-200 backdrop-blur-sm w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              {" "}
              {/* Added max-h and overflow */}
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
                  onClick={handleCloseForm}
                  className="p-2 rounded-full hover:bg-gray-100 transition-all"
                  aria-label="Close form"
                >
                  <FiX
                    size={20}
                    className="text-gray-500 hover:text-gray-700"
                  />
                </button>
              </div>
              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Institution */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Institution <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="institution"
                    value={formData.institution}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border ${
                      formErrors.institution
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-300`}
                    placeholder="Enter institution name"
                    required
                    aria-invalid={!!formErrors.institution}
                    aria-describedby={
                      formErrors.institution ? "institution-error" : undefined
                    }
                  />
                  {formErrors.institution && (
                    <p
                      id="institution-error"
                      className="text-red-500 text-xs mt-1"
                    >
                      {formErrors.institution}
                    </p>
                  )}
                </motion.div>

                {/* Course Name */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Course/Training Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="courseName"
                    value={formData.courseName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border ${
                      formErrors.courseName
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-300`}
                    placeholder="Enter course name"
                    required
                    aria-invalid={!!formErrors.courseName}
                    aria-describedby={
                      formErrors.courseName ? "courseName-error" : undefined
                    }
                  />
                  {formErrors.courseName && (
                    <p
                      id="courseName-error"
                      className="text-red-500 text-xs mt-1"
                    >
                      {formErrors.courseName}
                    </p>
                  )}
                </motion.div>

                {/* Location */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-300"
                    placeholder="Enter location"
                  />
                </motion.div>

                {/* Payment */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 }}
                >
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Payment (ETB)
                  </label>
                  <input
                    type="number"
                    name="payment"
                    value={formData.payment}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border ${
                      formErrors.payment ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-300`}
                    placeholder="Enter amount in ETB"
                    min="0" // Prevent negative numbers directly in input
                    aria-invalid={!!formErrors.payment}
                    aria-describedby={
                      formErrors.payment ? "payment-error" : undefined
                    }
                  />
                  {formErrors.payment && (
                    <p id="payment-error" className="text-red-500 text-xs mt-1">
                      {formErrors.payment}
                    </p>
                  )}
                </motion.div>

                {/* Start Date (EC) */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Start Date (Ethiopian)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-400">
                      <FiCalendar size={18} />
                    </span>
                    <input
                      type="text" // Keep as text for EC dates unless using a specific EC date picker
                      name="startDateEC"
                      value={formData.startDateEC}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pl-12 placeholder-gray-300"
                      placeholder="YYYY-MM-DD (EC)"
                    />
                  </div>
                </motion.div>

                {/* End Date (EC) */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.45 }}
                >
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    End Date (Ethiopian)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-400">
                      <FiCalendar size={18} />
                    </span>
                    <input
                      type="text"
                      name="endDateEC"
                      value={formData.endDateEC}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pl-12 placeholder-gray-300"
                      placeholder="YYYY-MM-DD (EC)"
                    />
                  </div>
                </motion.div>

                {/* Start Date (GC) */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Start Date (Gregorian)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-400">
                      <FiCalendar size={18} />
                    </span>
                    <input
                      type="date"
                      name="startDateGC"
                      value={formData.startDateGC}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border ${
                        formErrors.startDateGC
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pl-12 placeholder-gray-300`}
                      aria-invalid={!!formErrors.startDateGC}
                      aria-describedby={
                        formErrors.startDateGC ? "startDateGC-error" : undefined
                      }
                    />
                  </div>
                  {formErrors.startDateGC && (
                    <p
                      id="startDateGC-error"
                      className="text-red-500 text-xs mt-1"
                    >
                      {formErrors.startDateGC}
                    </p>
                  )}
                </motion.div>

                {/* End Date (GC) */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.55 }}
                >
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    End Date (Gregorian)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-400">
                      <FiCalendar size={18} />
                    </span>
                    <input
                      type="date"
                      name="endDateGC"
                      value={formData.endDateGC}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border ${
                        formErrors.endDateGC
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pl-12 placeholder-gray-300`}
                      aria-invalid={!!formErrors.endDateGC}
                      aria-describedby={
                        formErrors.endDateGC ? "endDateGC-error" : undefined
                      }
                    />
                  </div>
                  {formErrors.endDateGC && (
                    <p
                      id="endDateGC-error"
                      className="text-red-500 text-xs mt-1"
                    >
                      {formErrors.endDateGC}
                    </p>
                  )}
                </motion.div>
              </div>
              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex flex-wrap gap-4 justify-end pt-4" // Added pt-4
              >
                <button
                  onClick={handleSaveOrUpdate}
                  className="px-6 py-2 bg-[#3c8dbc] text-white rounded-lg hover:bg-[#367fa9] transition-all shadow-md disabled:opacity-50"
                  disabled={loading}
                  type="button" // Prevent form submission
                >
                  {loading ? "Saving..." : submitButtonText}
                </button>
                <button
                  onClick={handleCloseForm}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all shadow-md disabled:opacity-50"
                  disabled={loading}
                  type="button" // Prevent form submission
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
        className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 ${
          showForm ? "blur-sm pointer-events-none" : "" // Added pointer-events-none when blurred
        }`}
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 bg-[#3c8dbc] rounded-lg shadow-md p-2 md:p-3 text-white h-auto md:h-[50px]">
          {" "}
          {/* Adjusted height */}
          <div className="flex items-center mb-2 md:mb-0">
            <FiBook size={20} className="h-5 w-5 mr-2 text-blue-100" />
            <div>
              <h1 className="text-[14px] font-bold">Training</h1>
              <p className="text-blue-100 text-xs">
                Manage training information
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {" "}
            {/* Group buttons */}
            <button
              onClick={fetchTrainings} // Add refresh functionality
              className="flex items-center bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-1 rounded-md shadow-sm hover:shadow transition-all duration-300 border border-white border-opacity-20 text-xs md:text-sm"
              title="Refresh Data"
              disabled={loading}
            >
              <FiRefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
            </button>
            <button
              onClick={handleAddNewClick}
              className="flex items-center bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-1 rounded-md shadow-sm hover:shadow transition-all duration-300 border border-white border-opacity-20 text-xs md:text-sm"
              disabled={loading}
              title="Add New Training"
            >
              <FiPlus size={16} /> {/* Removed mr-1 */}
            </button>
          </div>
        </div>
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-xs">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "NO",
                  "Institution",
                  "Training/Course Name",
                  "Start Date (EC)",
                  "End Date (EC)",
                  "Location",
                  "Payment",
                  "Actions",
                ].map((header, idx) => (
                  <motion.th
                    key={header} // Use header string as key
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
              {loading && trainings.length === 0 ? ( // Show loading only if table is empty initially
                <tr>
                  <td colSpan={8} className="text-center py-4 text-gray-500">
                    Loading trainings...
                  </td>
                </tr>
              ) : !loading && trainings.length === 0 ? ( // Show no data message
                <tr>
                  <td colSpan={8} className="text-center py-4 text-gray-500">
                    No training records found.
                  </td>
                </tr>
              ) : (
                trainings.map((training, idx) => (
                  <motion.tr
                    key={training.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * idx }}
                    whileHover={{ backgroundColor: "#f8fafc" }}
                    className="transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {idx + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {training.institution}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {training.courseName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {training.startDateEC || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {training.endDateEC || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {training.location || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {training.payment
                        ? `${training.payment.toFixed(2)} ETB`
                        : "-"}{" "}
                      {/* Format payment */}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">
                      <div className="flex gap-3">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleEditTraining(training)}
                          className="text-[#3c8dbc] hover:text-blue-700 p-1 rounded-full hover:bg-blue-50 disabled:opacity-50"
                          title="Edit Training"
                          disabled={loading}
                        >
                          <FiEdit2 size={16} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={async () => {
                            if (
                              confirm(
                                "Are you sure you want to delete this training?"
                              )
                            ) {
                              await deleteTraining(training.id);
                            }
                          }}
                          className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 disabled:opacity-50"
                          title="Delete Training"
                          disabled={loading}
                        ></motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
