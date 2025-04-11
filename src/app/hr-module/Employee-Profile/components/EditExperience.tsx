"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiX, FiCalendar, FiEdit2, FiBriefcase } from "react-icons/fi";

// Ethiopian calendar conversion and validation functions
function gregorianToJdn(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

function jdnToEthiopian(jdn: number): [number, number, number] {
  const j = Math.floor(jdn) + 0.5;
  const epoch = 1724220.5;
  const era = Math.floor((j - epoch) / 1461);
  const jd0 = epoch + era * 1461;
  const n = Math.floor(j - jd0);
  const year = 4 * era + Math.floor(n / 365);
  const doy = n % 365;
  const month = Math.floor(doy / 30) + 1;
  const day = (doy % 30) + 1;
  return [year, month, day];
}

function gregorianToEthiopian(
  year: number,
  month: number,
  day: number
): [number, number, number] {
  const jdn = gregorianToJdn(year, month, day);
  return jdnToEthiopian(jdn);
}

function ethiopianToGregorian(
  year: number,
  month: number,
  day: number
): [number, number, number] {
  const jdn = ethiopianToJdn(year, month, day);
  return jdnToGregorian(jdn);
}

function ethiopianToJdn(year: number, month: number, day: number): number {
  const era = Math.floor(year / 4);
  const jd0 = 1724220.5 + era * 1461;
  const doy = (month - 1) * 30 + day - 1;
  return jd0 + doy + (year % 4) * 365;
}

function jdnToGregorian(jdn: number): [number, number, number] {
  const j = Math.floor(jdn) + 0.5;
  const f =
    j + 1401 + Math.floor((Math.floor((4 * j + 274277) / 146097) * 3) / 4) - 38;
  const e = 4 * f + 3;
  const g = Math.floor((e % 1461) / 4);
  const h = 5 * g + 2;
  const day = Math.floor((h % 153) / 5) + 1;
  const month = ((Math.floor(h / 153) + 2) % 12) + 1;
  const year = Math.floor(e / 1461) - 4716 + Math.floor((14 - month) / 12);
  return [year, month, day];
}

function isValidEthiopianDate(
  year: number,
  month: number,
  day: number
): boolean {
  // Ethiopian months have 30 days each, except the 13th month which has 5 or 6 days
  if (month < 1 || month > 13) return false;
  if (day < 1) return false;
  if (month === 13) {
    // Pagume (13th month) has 5 days in common years, 6 in leap years
    const isLeapYear = year % 4 === 3;
    return day <= (isLeapYear ? 6 : 5);
  }
  return day <= 30;
}

interface Experience {
  id: number;
  jobTitleEnglish: string;
  jobTitleAmharic: string;
  startDateEC: string; // Format: "YYYY-MM-DD"
  startDateGC: string; // Format: "YYYY-MM-DD"
  endDateGC: string; // Format: "YYYY-MM-DD"
  refNo: string;
}

interface FormData {
  jobTitleEnglish: string;
  jobTitleAmharic: string;
  startDateEC: string;
  startDateGC: string;
  endDateGC: string;
  refNo: string;
}

export default function ExperienceTab() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([
    {
      id: 1,
      jobTitleEnglish: "Software Engineer",
      jobTitleAmharic: "ሶፍትዌር መሃንዲስ",
      startDateEC: "2015-09-11",
      startDateGC: "2023-05-19",
      endDateGC: "2023-12-31",
      refNo: "REF-001",
    },
  ]);
  const [formData, setFormData] = useState<FormData>({
    jobTitleEnglish: "",
    jobTitleAmharic: "",
    startDateEC: "",
    startDateGC: "",
    endDateGC: "",
    refNo: "",
  });
  const [showEthiopianCalendar, setShowEthiopianCalendar] = useState(false);
  const [showGregorianCalendar, setShowGregorianCalendar] = useState(false);
  const [showEndDateCalendar, setShowEndDateCalendar] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [ethiopianCalendarDate, setEthiopianCalendarDate] = useState({
    year: 2015,
    month: 9,
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate Ethiopian date
    if (formData.startDateEC) {
      const [year, month, day] = formData.startDateEC.split("-").map(Number);
      if (!isValidEthiopianDate(year, month, day)) {
        newErrors.startDateEC = "Invalid Ethiopian date";
      }
    }

    // Validate Gregorian dates
    if (
      formData.startDateGC &&
      new Date(formData.startDateGC).toString() === "Invalid Date"
    ) {
      newErrors.startDateGC = "Invalid Gregorian date";
    }

    if (
      formData.endDateGC &&
      new Date(formData.endDateGC).toString() === "Invalid Date"
    ) {
      newErrors.endDateGC = "Invalid Gregorian date";
    }

    // Validate end date is after start date
    if (formData.startDateGC && formData.endDateGC) {
      const start = new Date(formData.startDateGC);
      const end = new Date(formData.endDateGC);
      if (end <= start) {
        newErrors.endDateGC = "End date must be after start date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const convertToEthiopian = (gcDate: string): string => {
    if (!gcDate) return "";
    try {
      const [year, month, day] = gcDate.split("-").map(Number);
      const [ecYear, ecMonth, ecDay] = gregorianToEthiopian(year, month, day);
      return `${ecYear}-${String(ecMonth).padStart(2, "0")}-${String(
        ecDay
      ).padStart(2, "0")}`;
    } catch (error) {
      console.error("Error converting to Ethiopian date:", error);
      return "";
    }
  };

  const convertToGregorian = (ecDate: string): string => {
    if (!ecDate) return "";
    try {
      const [year, month, day] = ecDate.split("-").map(Number);
      const [gcYear, gcMonth, gcDay] = ethiopianToGregorian(year, month, day);
      return `${gcYear}-${String(gcMonth).padStart(2, "0")}-${String(
        gcDay
      ).padStart(2, "0")}`;
    } catch (error) {
      console.error("Error converting to Gregorian date:", error);
      return "";
    }
  };

  const handleEditExperience = (exp: Experience) => {
    setEditingId(exp.id);
    const [ecYear, ecMonth] = exp.startDateEC.split("-").map(Number);
    setEthiopianCalendarDate({ year: ecYear, month: ecMonth });
    setFormData({
      jobTitleEnglish: exp.jobTitleEnglish,
      jobTitleAmharic: exp.jobTitleAmharic,
      startDateEC: exp.startDateEC,
      startDateGC: exp.startDateGC,
      endDateGC: exp.endDateGC,
      refNo: exp.refNo,
    });
    setShowForm(true);
  };

  const handleAddExperience = () => {
    if (!validateForm()) return;

    const newExperience: Experience = {
      id: editingId || experiences.length + 1,
      jobTitleEnglish: formData.jobTitleEnglish,
      jobTitleAmharic: formData.jobTitleAmharic,
      startDateEC: formData.startDateEC,
      startDateGC: formData.startDateGC,
      endDateGC: formData.endDateGC,
      refNo: formData.refNo,
    };

    if (editingId) {
      setExperiences(
        experiences.map((exp) => (exp.id === editingId ? newExperience : exp))
      );
    } else {
      setExperiences([...experiences, newExperience]);
    }

    setFormData({
      jobTitleEnglish: "",
      jobTitleAmharic: "",
      startDateEC: "",
      startDateGC: "",
      endDateGC: "",
      refNo: "",
    });
    setShowForm(false);
    setEditingId(null);
    setErrors({});
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Auto-convert dates when one changes
    if (name === "startDateEC" && value) {
      const gcDate = convertToGregorian(value);
      setFormData((prev) => ({
        ...prev,
        startDateGC: gcDate,
      }));
    } else if (name === "startDateGC" && value) {
      const ecDate = convertToEthiopian(value);
      setFormData((prev) => ({
        ...prev,
        startDateEC: ecDate,
      }));
      // Update Ethiopian calendar view when Gregorian date changes
      if (ecDate) {
        const [ecYear, ecMonth] = ecDate.split("-").map(Number);
        setEthiopianCalendarDate({ year: ecYear, month: ecMonth });
      }
    }
  };

  const handleDateSelect = (
    date: string,
    type: "ethiopian" | "gregorian" | "endGregorian"
  ) => {
    if (type === "ethiopian") {
      setFormData((prev) => ({
        ...prev,
        startDateEC: date,
        startDateGC: convertToGregorian(date),
      }));
      setShowEthiopianCalendar(false);
    } else if (type === "gregorian") {
      setFormData((prev) => ({
        ...prev,
        startDateGC: date,
        startDateEC: convertToEthiopian(date),
      }));
      setShowGregorianCalendar(false);
    } else {
      setFormData((prev) => ({
        ...prev,
        endDateGC: date,
      }));
      setShowEndDateCalendar(false);
    }
  };

  const changeEthiopianCalendarMonth = (increment: number) => {
    setEthiopianCalendarDate((prev) => {
      let newMonth = prev.month + increment;
      let newYear = prev.year;

      if (newMonth > 13) {
        newMonth = 1;
        newYear++;
      } else if (newMonth < 1) {
        newMonth = 13;
        newYear--;
      }

      return { year: newYear, month: newMonth };
    });
  };

  const renderEthiopianCalendar = () => {
    if (!showEthiopianCalendar) return null;

    const { year, month } = ethiopianCalendarDate;
    const daysInMonth = month === 13 ? (year % 4 === 3 ? 6 : 5) : 30;
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return (
      <div className="absolute z-20 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-2 w-64">
        <div className="flex justify-between items-center mb-2">
          <button
            className="p-1 hover:bg-gray-100 rounded"
            onClick={() => changeEthiopianCalendarMonth(-1)}
          >
            &lt;
          </button>
          <span className="font-medium">
            {month}/{year}
          </span>
          <button
            className="p-1 hover:bg-gray-100 rounded"
            onClick={() => changeEthiopianCalendarMonth(1)}
          >
            &gt;
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-xs">
          {["እ", "ሰ", "ማ", "ረ", "ሐ", "አ", "ቅ"].map((day) => (
            <div key={day} className="text-center font-medium">
              {day}
            </div>
          ))}
          {days.map((day) => (
            <button
              key={day}
              className={`p-1 rounded hover:bg-blue-100 ${
                formData.startDateEC ===
                `${year}-${String(month).padStart(2, "0")}-${String(
                  day
                ).padStart(2, "0")}`
                  ? "bg-blue-500 text-white"
                  : ""
              }`}
              onClick={() =>
                handleDateSelect(
                  `${year}-${String(month).padStart(2, "0")}-${String(
                    day
                  ).padStart(2, "0")}`,
                  "ethiopian"
                )
              }
            >
              {day}
            </button>
          ))}
        </div>
        <div className="mt-2 flex justify-between">
          <button
            className="text-xs text-blue-600 hover:text-blue-800"
            onClick={() => {
              const currentYear = new Date().getFullYear();
              const [ecYear] = gregorianToEthiopian(currentYear, 1, 1);
              setEthiopianCalendarDate({ year: ecYear, month: 1 });
            }}
          >
            Jump to Current Year
          </button>
          <div className="flex gap-1">
            <button
              className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
              onClick={() =>
                setEthiopianCalendarDate((prev) => ({
                  ...prev,
                  year: prev.year - 1,
                }))
              }
            >
              &lt; Year
            </button>
            <button
              className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
              onClick={() =>
                setEthiopianCalendarDate((prev) => ({
                  ...prev,
                  year: prev.year + 1,
                }))
              }
            >
              Year &gt;
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderGregorianCalendar = (type: "start" | "end") => {
    const showCalendar =
      type === "start" ? showGregorianCalendar : showEndDateCalendar;
    if (!showCalendar) return null;

    const currentDate =
      type === "start"
        ? formData.startDateGC
          ? new Date(formData.startDateGC)
          : new Date()
        : formData.endDateGC
        ? new Date(formData.endDateGC)
        : new Date();

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();

    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const emptyDays = Array.from({ length: firstDay }, (_, i) => i + 1);

    return (
      <div className="absolute z-20 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-2 w-64">
        <div className="flex justify-between items-center mb-2">
          <button className="p-1 hover:bg-gray-100 rounded">&lt;</button>
          <span className="font-medium">
            {new Date(year, month).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </span>
          <button className="p-1 hover:bg-gray-100 rounded">&gt;</button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-xs">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
            <div key={day} className="text-center font-medium">
              {day}
            </div>
          ))}
          {emptyDays.map((_, i) => (
            <div key={`empty-${i}`} className="p-1"></div>
          ))}
          {days.map((day) => {
            const dateStr = `${year}-${String(month + 1).padStart(
              2,
              "0"
            )}-${String(day).padStart(2, "0")}`;
            return (
              <button
                key={day}
                className={`p-1 rounded hover:bg-blue-100 ${
                  (type === "start" && formData.startDateGC === dateStr) ||
                  (type === "end" && formData.endDateGC === dateStr)
                    ? "bg-blue-500 text-white"
                    : ""
                }`}
                onClick={() =>
                  handleDateSelect(
                    dateStr,
                    type === "start" ? "gregorian" : "endGregorian"
                  )
                }
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

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
                  {editingId ? "Edit Experience" : "Add New Experience"}
                </motion.h3>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({
                      jobTitleEnglish: "",
                      jobTitleAmharic: "",
                      startDateEC: "",
                      startDateGC: "",
                      endDateGC: "",
                      refNo: "",
                    });
                    setErrors({});
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
                    Job Title (English)
                  </label>
                  <input
                    type="text"
                    name="jobTitleEnglish"
                    value={formData.jobTitleEnglish}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter job title in English"
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
                  className="relative"
                >
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Start Date (EC)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="startDateEC"
                      value={formData.startDateEC}
                      onChange={handleInputChange}
                      className={`w-full p-2 border ${
                        errors.startDateEC
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                      placeholder="YY-MM-DD"
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                      onClick={() => {
                        setShowEthiopianCalendar(!showEthiopianCalendar);
                        setShowGregorianCalendar(false);
                        setShowEndDateCalendar(false);
                        // Initialize calendar with current date if no date is selected
                        if (!formData.startDateEC && formData.startDateGC) {
                          const ecDate = convertToEthiopian(
                            formData.startDateGC
                          );
                          if (ecDate) {
                            const [ecYear, ecMonth] = ecDate
                              .split("-")
                              .map(Number);
                            setEthiopianCalendarDate({
                              year: ecYear,
                              month: ecMonth,
                            });
                          }
                        }
                      }}
                    >
                      <FiCalendar size={18} />
                    </button>
                    {renderEthiopianCalendar()}
                    {errors.startDateEC && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.startDateEC}
                      </p>
                    )}
                  </div>
                </motion.div>

                {/* Start Date (Gregorian) */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 }}
                  className="relative"
                >
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Start Date (GC)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="startDateGC"
                      value={formData.startDateGC}
                      onChange={handleInputChange}
                      className={`w-full p-2 border ${
                        errors.startDateGC
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                      placeholder="YY-MM-DD"
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                      onClick={() => {
                        setShowGregorianCalendar(!showGregorianCalendar);
                        setShowEthiopianCalendar(false);
                        setShowEndDateCalendar(false);
                      }}
                    >
                      <FiCalendar size={18} />
                    </button>
                    {renderGregorianCalendar("start")}
                    {errors.startDateGC && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.startDateGC}
                      </p>
                    )}
                  </div>
                </motion.div>

                {/* End Date (Gregorian) */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="relative"
                >
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    End Date (GC)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="endDateGC"
                      value={formData.endDateGC}
                      onChange={handleInputChange}
                      className={`w-full p-2 border ${
                        errors.endDateGC ? "border-red-500" : "border-gray-300"
                      } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                      placeholder="YY-MM-DD"
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                      onClick={() => {
                        setShowEndDateCalendar(!showEndDateCalendar);
                        setShowEthiopianCalendar(false);
                        setShowGregorianCalendar(false);
                      }}
                    >
                      <FiCalendar size={18} />
                    </button>
                    {renderGregorianCalendar("end")}
                    {errors.endDateGC && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.endDateGC}
                      </p>
                    )}
                  </div>
                </motion.div>

                {/* Reference Number */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 }}
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
                >
                  {editingId ? "Update" : "save"}
                </button>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({
                      jobTitleEnglish: "",
                      jobTitleAmharic: "",
                      startDateEC: "",
                      startDateGC: "",
                      endDateGC: "",
                      refNo: "",
                    });
                    setErrors({});
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all shadow-md hover:shadow-lg"
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
          <button
            onClick={() => {
              setShowForm(true);
              setEditingId(null);
              setFormData({
                jobTitleEnglish: "",
                jobTitleAmharic: "",
                startDateEC: "",
                startDateGC: "",
                endDateGC: "",
                refNo: "",
              });
              setErrors({});
            }}
            className="flex items-center bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-1 rounded-md shadow-sm hover:shadow transition-all duration-300 border border-white border-opacity-20 text-xs md:text-sm mt-2 md:mt-0"
          >
            <FiPlus size={16} />
          </button>
        </div>

        <div className="overflow-x-auto">
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
              {experiences.map((exp, idx) => (
                <motion.tr
                  key={exp.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * idx }}
                  whileHover={{ backgroundColor: "#f8fafc" }}
                  className="transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    {exp.id}
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
                  <td className="px-6 py-4 whitespace-nowrap font-medium">
                    <div className="flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleEditExperience(exp)}
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
