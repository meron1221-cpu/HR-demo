"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiEdit2, FiPlus, FiTrash2, FiX, FiChevronDown } from "react-icons/fi";

interface Address {
  id: number;
  addressType: string;
  wereda: string;
  kebele: string;
  telephoneOffice: string;
  email: string;
  poBox: string;
  mobileNumber: string;
  zone: string;
  kifleketema: string;
  teleHome: string;
  houseNo: string;
  region: string;
}

interface CountryCode {
  code: string;
  dialCode: string;
  flag: string;
}

const countryCodes: CountryCode[] = [
  { code: "ET", dialCode: "+251", flag: "🇪🇹" },
  { code: "US", dialCode: "+1", flag: "🇺🇸" },
  { code: "GB", dialCode: "+44", flag: "🇬🇧" },
  { code: "CA", dialCode: "+1", flag: "🇨🇦" },
  { code: "AU", dialCode: "+61", flag: "🇦🇺" },
  { code: "IN", dialCode: "+91", flag: "🇮🇳" },
  { code: "DE", dialCode: "+49", flag: "🇩🇪" },
  { code: "FR", dialCode: "+33", flag: "🇫🇷" },
  { code: "IT", dialCode: "+39", flag: "🇮🇹" },
  { code: "ES", dialCode: "+34", flag: "🇪🇸" },
  { code: "BR", dialCode: "+55", flag: "🇧🇷" },
  { code: "CN", dialCode: "+86", flag: "🇨🇳" },
  { code: "JP", dialCode: "+81", flag: "🇯🇵" },
  { code: "MX", dialCode: "+52", flag: "🇲🇽" },
  { code: "ZA", dialCode: "+27", flag: "🇿🇦" },
];

export default function AddressPage() {
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: 1,
      addressType: "Birth place",
      wereda: "09",
      kebele: "02",
      telephoneOffice: "",
      email: "abebe@gmail.com",
      poBox: "",
      mobileNumber: "+251934567890",
      zone: "",
      kifleketema: "Lideta",
      teleHome: "",
      houseNo: "235/ለ",
      region: "",
    },
  ]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentAddress, setCurrentAddress] = useState<Address | null>(null);

  const handleEdit = (address: Address) => {
    setCurrentAddress(address);
    setIsFormOpen(true);
  };

  const handleSubmit = (formData: Address) => {
    if (formData.id) {
      setAddresses(addresses.map((a) => (a.id === formData.id ? formData : a)));
    } else {
      setAddresses([...addresses, { ...formData, id: Date.now() }]);
    }
    setIsFormOpen(false);
    setCurrentAddress(null);
  };

  const formatPhoneNumber = (phone: string) => {
    if (!phone) return "";
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.startsWith("251") && cleaned.length >= 12) {
      return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(
        6,
        9
      )} ${cleaned.slice(9)}`;
    }
    if (cleaned.startsWith("1") && cleaned.length === 11) {
      return `+${cleaned.slice(0, 1)} ${cleaned.slice(1, 4)} ${cleaned.slice(
        4,
        7
      )} ${cleaned.slice(7)}`;
    }
    if (cleaned.startsWith("44") && cleaned.length >= 12) {
      return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(
        5,
        8
      )} ${cleaned.slice(8)}`;
    }
    return phone;
  };

  return (
    <div className="space-y-6 relative">
      {/* Blur overlay */}
      {isFormOpen && (
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
        {isFormOpen && (
          <AddressForm
            address={currentAddress}
            onClose={() => setIsFormOpen(false)}
            onSubmit={handleSubmit}
          />
        )}
      </AnimatePresence>
      {/* Main Table Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={`bg-white rounded-xl shadow-lg overflow-hidden ${
          isFormOpen ? "blur-sm" : ""
        }`}
      >
        {/* Updated Header to match LanguageSkillsTable */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 bg-[#3c8dbc] rounded-lg shadow-md p-2 md:p-3 text-white h-[50px]">
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2 text-blue-100"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <div>
              <h1 className="text-[14px] font-bold">Address</h1>
              <p className="text-blue-100 text-xs">
                Manage your address information
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setCurrentAddress(null);
              setIsFormOpen(true);
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
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "NO",
                  "Type",
                  "Mobile",
                  "Region",
                  "Wereda",
                  "Zone",
                  "Kifleketema",
                  "Kebele",
                  "House No",
                  "Tele/Home",
                  "Email",
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
                    className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider text-[12px]"
                  >
                    {header}
                  </motion.th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {addresses.map((address, idx) => (
                <motion.tr
                  key={address.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * idx }}
                  whileHover={{ backgroundColor: "#f8fafc" }}
                  className="transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-[12px]">
                    {idx + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-[12px]">
                    {address.addressType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-[12px]">
                    {formatPhoneNumber(address.mobileNumber)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-[12px]">
                    {address.region || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-[12px]">
                    {address.wereda || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-[12px]">
                    {address.zone || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-[12px]">
                    {address.kifleketema || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-[12px]">
                    {address.kebele || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-[12px]">
                    {address.houseNo || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-[12px]">
                    {address.teleHome || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-[12px]">
                    {address.email || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleEdit(address)}
                        className="text-[#3c8dbc] hover:text-[#367fa9] p-1 rounded-full hover:bg-blue-50"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
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

function AddressForm({
  address,
  onClose,
  onSubmit,
}: {
  address: Address | null;
  onClose: () => void;
  onSubmit: (address: Address) => void;
}) {
  const [formData, setFormData] = useState<Omit<Address, "id">>(
    address || {
      addressType: "",
      wereda: "",
      kebele: "",
      telephoneOffice: "",
      email: "",
      poBox: "",
      mobileNumber: "",
      zone: "",
      kifleketema: "",
      teleHome: "",
      houseNo: "",
      region: "",
    }
  );
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(
    countryCodes[0]
  );
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof Omit<Address, "id">, string>>
  >({});

  useEffect(() => {
    if (address?.mobileNumber) {
      const country = countryCodes.find((c) =>
        address.mobileNumber.startsWith(c.dialCode)
      );
      if (country) {
        setSelectedCountry(country);
        setPhoneNumber(address.mobileNumber.slice(country.dialCode.length));
      } else {
        setSelectedCountry(countryCodes[0]);
        setPhoneNumber(address.mobileNumber.replace(/\D/g, ""));
      }
    }
  }, [address]);

  const handleCountrySelect = (country: CountryCode) => {
    setSelectedCountry(country);
    setIsCountryDropdownOpen(false);
    setFormData((prev) => ({
      ...prev,
      mobileNumber: `${country.dialCode}${phoneNumber}`,
    }));
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const cleanedValue = value.replace(/\D/g, "");
    setPhoneNumber(cleanedValue);
    setFormData((prev) => ({
      ...prev,
      mobileNumber: `${selectedCountry.dialCode}${cleanedValue}`,
    }));
    setErrors((prev) => ({ ...prev, mobileNumber: "" }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors: Partial<Record<keyof Omit<Address, "id">, string>> = {};
    let isValid = true;
    if (!formData.addressType) {
      newErrors.addressType = "Address type is required";
      isValid = false;
    }
    if (!formData.mobileNumber) {
      newErrors.mobileNumber = "Mobile number is required";
      isValid = false;
    } else if (!/^(\+?\d{10,15})$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = "Please enter a valid mobile number";
      isValid = false;
    }
    if (!formData.region) {
      newErrors.region = "Region is required";
      isValid = false;
    }
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        id: address?.id || 0,
        ...formData,
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl border border-gray-200/50 w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-200/50">
          <motion.h2
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold bg-gradient-to-r from-[#3c8dbc] to-[#3c8dbc] bg-clip-text text-transparent"
          >
            {address ? "Edit Address" : " New Address"}
          </motion.h2>
          <motion.button
            whileHover={{ rotate: 90, scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full"
          >
            <FiX size={24} />
          </motion.button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Address Type */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address Type <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="addressType"
                    value={formData.addressType}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 pr-10 rounded-xl border ${
                      errors.addressType ? "border-red-500" : "border-gray-300"
                    } focus:ring-2 focus:ring-[#3c8dbc] focus:border-transparent appearance-none`}
                  >
                    <option value="">- Select Address Type -</option>
                    <option value="Birth place">Birth Place</option>
                    <option value="Residence">Residence</option>
                    <option value="Emergency">Emergency</option>
                    <option value="Work">Work</option>
                    <option value="Other">Other</option>
                  </select>
                  <FiChevronDown className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" />
                </div>
                {errors.addressType && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-xs mt-1"
                  >
                    {errors.addressType}
                  </motion.p>
                )}
              </motion.div>
              {/* Region */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Region <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="region"
                    value={formData.region}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 pr-10 rounded-xl border ${
                      errors.region ? "border-red-500" : "border-gray-300"
                    } focus:ring-2 focus:ring-[#3c8dbc] focus:border-transparent appearance-none`}
                  >
                    <option value="">- Select Region -</option>
                    <option value="Addis Ababa">Addis Ababa</option>
                    <option value="Oromia">Oromia</option>
                    <option value="Amhara">Amhara</option>
                    <option value="Tigray">Tigray</option>
                    <option value="Somali">Somali</option>
                    <option value="Afar">Afar</option>
                    <option value="Dire Dawa">Dire Dawa</option>
                    <option value="Harari">Harari</option>
                    <option value="Benishangul-Gumuz">Benishangul-Gumuz</option>
                    <option value="Gambela">Gambela</option>
                    <option value="SNNPR">SNNPR</option>
                  </select>
                  <FiChevronDown className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" />
                </div>
                {errors.region && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-xs mt-1"
                  >
                    {errors.region}
                  </motion.p>
                )}
              </motion.div>
              {/* Mobile Number */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="flex">
                  <div className="relative mr-2 w-28">
                    <button
                      type="button"
                      className="w-full flex items-center justify-between px-3 py-3 border border-gray-300 rounded-l-xl bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#3c8dbc]"
                      onClick={() =>
                        setIsCountryDropdownOpen(!isCountryDropdownOpen)
                      }
                    >
                      <div className="flex items-center">
                        <span className="mr-2">{selectedCountry.flag}</span>
                        <span className="text-sm">
                          {selectedCountry.dialCode}
                        </span>
                      </div>
                      <FiChevronDown
                        className={`ml-1 h-4 w-4 text-gray-400 transition-transform ${
                          isCountryDropdownOpen ? "transform rotate-180" : ""
                        }`}
                      />
                    </button>
                    {isCountryDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 focus:outline-none max-h-60 overflow-auto"
                      >
                        {countryCodes.map((country) => (
                          <div
                            key={country.code}
                            className={`px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer ${
                              selectedCountry.code === country.code
                                ? "bg-blue-50"
                                : ""
                            }`}
                            onClick={() => handleCountrySelect(country)}
                          >
                            <div className="flex items-center">
                              <span className="mr-2">{country.flag}</span>
                              <span className="font-medium">
                                {country.dialCode}
                              </span>
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </div>
                  <div className="flex-1 relative">
                    <input
                      type="tel"
                      name="mobileNumber"
                      value={phoneNumber}
                      onChange={handlePhoneNumberChange}
                      placeholder="912 345 678"
                      className={`w-full px-4 py-3 rounded-r-xl border ${
                        errors.mobileNumber
                          ? "border-red-500"
                          : "border-gray-300"
                      } focus:ring-2 focus:ring-[#3c8dbc] focus:border-transparent`}
                    />
                  </div>
                </div>
                {errors.mobileNumber && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-xs mt-1"
                  >
                    {errors.mobileNumber}
                  </motion.p>
                )}
              </motion.div>
              {/* Wereda */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wereda
                </label>
                <input
                  type="text"
                  name="wereda"
                  value={formData.wereda}
                  onChange={handleChange}
                  placeholder="Enter wereda"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#3c8dbc] focus:border-transparent"
                />
              </motion.div>
              {/* Kebele */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kebele
                </label>
                <input
                  type="text"
                  name="kebele"
                  value={formData.kebele}
                  onChange={handleChange}
                  placeholder="Enter kebele"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#3c8dbc] focus:border-transparent"
                />
              </motion.div>
              {/* Zone */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zone
                </label>
                <input
                  type="text"
                  name="zone"
                  value={formData.zone}
                  onChange={handleChange}
                  placeholder="Enter zone (if applicable)"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#3c8dbc] focus:border-transparent"
                />
              </motion.div>
              {/* Kifleketema */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kifleketema
                </label>
                <input
                  type="text"
                  name="kifleketema"
                  value={formData.kifleketema}
                  onChange={handleChange}
                  placeholder="Enter kifleketema"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#3c8dbc] focus:border-transparent"
                />
              </motion.div>
              {/* Telephone (office) */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telephone (office)
                </label>
                <input
                  type="tel"
                  name="telephoneOffice"
                  value={formData.telephoneOffice}
                  onChange={handleChange}
                  placeholder="Enter office telephone"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#3c8dbc] focus:border-transparent"
                />
              </motion.div>
              {/* Email */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="example@gmail.com"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#3c8dbc] focus:border-transparent"
                />
                {errors.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-xs mt-1"
                  >
                    {errors.email}
                  </motion.p>
                )}
              </motion.div>
              {/* PO BOX */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PO BOX
                </label>
                <input
                  type="text"
                  name="poBox"
                  value={formData.poBox}
                  onChange={handleChange}
                  placeholder="Enter PO Box number"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#3c8dbc] focus:border-transparent"
                />
              </motion.div>
              {/* Tele (Home) */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tele (Home)
                </label>
                <input
                  type="tel"
                  name="teleHome"
                  value={formData.teleHome}
                  onChange={handleChange}
                  placeholder="Enter home telephone"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#3c8dbc] focus:border-transparent"
                />
              </motion.div>
              {/* House No */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  House No
                </label>
                <input
                  type="text"
                  name="houseNo"
                  value={formData.houseNo}
                  onChange={handleChange}
                  placeholder="Enter house number"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#3c8dbc] focus:border-transparent"
                />
              </motion.div>
            </div>
            <div className="flex justify-end gap-4 pt-4">
              <motion.button
                type="submit"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-8 py-3 bg-[#3c8dbc] text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                {address ? "Update" : "Save"}
              </motion.button>
              <motion.button
                type="button"
                onClick={onClose}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-8 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all"
              >
                Cancel
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}
