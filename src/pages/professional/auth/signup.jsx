import React, { Fragment, useState } from "react";
import Link from "next/link";
import { setCookie } from "cookies-next";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReactSelect from "react-select";

const PROFESSIONS = [
  "General Administrative Assistant",
  "Social Media Manager ",
  "Real Estate",
  "AI Assistant",
  "Virtual Research",
  "Virtual Data Entry",
  "Virtual Book keeper",
  "Virtual ecommerce",
  "Customer Service Provider (Phone/Chat)",
  "Content Writer",
  "Website Management",
  "Public Relation Assistant",
  "Graphic designs",
  "Appointment/Calendar setter",
  "Email Management",
  "Campaign/petition Writer",
];

// GVA services that don't allow custom pricing
const GVA_SERVICES = ["General Administrative Assistant"];

const ProfAuth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [selectedServices, setSelectedServices] = useState([]);
  const [servicePricing, setServicePricing] = useState({});

  const submit = async () => {
    if (email === "" || password === "" || name === "" || selectedServices.length === 0) {
      toast.warn("Please fill all fields and select at least one service");
      return;
    }

    // Check if all non-GVA services have pricing
    const missingPricing = selectedServices.filter(service =>
      !GVA_SERVICES.includes(service) && !servicePricing[service]
    );

    if (missingPricing.length > 0) {
      toast.warn("Please set pricing for all selected services");
      return;
    }

    try {
      setLoading(true);

      // Prepare services with integrated pricing data
      const profession = selectedServices.map(service => ({
        name: service,
        price: GVA_SERVICES.includes(service) ? null : servicePricing[service],
        isGVA: GVA_SERVICES.includes(service)
      }));

      const { data } = await axios.post("/auth", {
        name: name,
        email: email,
        password: password,
        profession: profession, // Send services with integrated pricing
      });
      console.log(data);
      // setCookie("token", data.meta.token);
      window.location.href = "/professional/auth";
    } catch (e) {
      console.log(e);
      e.response && toast.warn(e?.response.data.message);
      setLoading(false);
    }
  };

  return (
    <Fragment>
      <title>CITIZEN PLAINT | Professional</title>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Join as a Virtual Assistant</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Start your journey as a professional Virtual Assistant. Set your services, prices, and connect with clients worldwide.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-12 justify-center items-center">
            <div className="w-full lg:w-1/2 bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">Create Your Profile</h2>
                <p className="text-gray-600">Let's get you set up with your professional account</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-warning focus:border-warning transition-all"
                    placeholder="Enter your full name"
                    onChange={(e) => setName(e.target.value)}
                    value={name}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-warning focus:border-warning transition-all"
                    placeholder="Enter your email address"
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-warning focus:border-warning transition-all"
                    placeholder="Create a strong password"
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                  />
                </div>


                {/* Service Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Services You Offer
                  </label>
                  <ReactSelect
                    isMulti
                    options={PROFESSIONS.map(prof => ({ value: prof, label: prof }))}
                    value={selectedServices.map(service => ({ value: service, label: service }))}
                    onChange={(selectedOptions) => {
                      const services = selectedOptions ? selectedOptions.map(option => option.value) : [];
                      setSelectedServices(services);

                      // Clean up pricing for removed services
                      const newPricing = { ...servicePricing };
                      Object.keys(newPricing).forEach(service => {
                        if (!services.includes(service)) {
                          delete newPricing[service];
                        }
                      });
                      setServicePricing(newPricing);
                    }}
                    placeholder="Choose the services you specialize in..."
                    className="text-left"
                    styles={{
                      control: (provided, state) => ({
                        ...provided,
                        padding: '12px',
                        backgroundColor: '#f9fafb',
                        border: state.isFocused ? '2px solid #C98821' : '1px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        minHeight: '56px',
                        boxShadow: state.isFocused ? '0 0 0 3px rgba(201, 136, 33, 0.1)' : 'none',
                        '&:hover': {
                          borderColor: '#C98821',
                        },
                      }),
                      multiValue: (provided) => ({
                        ...provided,
                        backgroundColor: '#C98821',
                        borderRadius: '0.375rem',
                        color: 'white',
                      }),
                      multiValueLabel: (provided) => ({
                        ...provided,
                        color: 'white',
                        fontWeight: '500',
                      }),
                      multiValueRemove: (provided) => ({
                        ...provided,
                        color: 'white',
                        ':hover': {
                          backgroundColor: '#A67019',
                          color: 'white',
                        },
                      }),
                      placeholder: (provided) => ({
                        ...provided,
                        color: '#9ca3af',
                        fontSize: '16px',
                      }),
                      menu: (provided) => ({
                        ...provided,
                        borderRadius: '0.5rem',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                      }),
                    }}
                    closeMenuOnSelect={false}
                    hideSelectedOptions={false}
                  />
                  {selectedServices.length > 0 && (
                    <div className="flex items-center mt-3 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      {selectedServices.length} service{selectedServices.length !== 1 ? 's' : ''} selected
                    </div>
                  )}
                </div>

                {/* Pricing for selected services */}
                {selectedServices.length > 0 && (
                  <div className="my-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl border border-blue-200 shadow-sm">
                    <div className="flex items-center mb-4">
                      <div className="w-8 h-8 bg-warning rounded-full flex items-center justify-center mr-3">
                        <span className="text-white font-bold text-sm">₦</span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-800">Set Your Service Pricing</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">Set competitive one-time project rates for your services</p>

                    <div className="grid gap-4">
                      {selectedServices.map((service, index) => (
                        <div key={index} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-gray-800 text-base">{service}</h4>
                              {GVA_SERVICES.includes(service) && (
                                <span className="inline-block mt-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                                  GVA Service - Platform Managed
                                </span>
                              )}
                            </div>
                          </div>

                          {GVA_SERVICES.includes(service) ? (
                            <div className="flex items-center p-3 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
                              <div className="w-5 h-5 bg-blue-400 rounded-full flex items-center justify-center mr-3">
                                <span className="text-white text-xs">ℹ</span>
                              </div>
                              <span className="text-sm text-blue-700 font-medium">
                                Pricing for this service is managed by our platform
                              </span>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <label className="block text-sm font-medium text-gray-600">
                                Project Rate (One-time payment)
                              </label>
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                  <span className="text-gray-500 text-lg font-semibold">₦</span>
                                </div>
                                <input
                                  type="number"
                                  min="5"
                                  step="5"
                                  className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-warning focus:border-warning transition-all text-lg font-medium"
                                  placeholder="e.g. 150"
                                  value={servicePricing[service] || ''}
                                  onChange={(e) => {
                                    setServicePricing(prev => ({
                                      ...prev,
                                      [service]: e.target.value
                                    }));
                                  }}
                                />
                              </div>
                              {/* <p className="text-xs text-gray-500 mt-1">
                                💡 Tip: Consider project complexity, time investment, and your expertise level
                              </p> */}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* {selectedServices.filter(s => !GVA_SERVICES.includes(s)).length > 0 && (
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center">
                          <span className="text-yellow-600 mr-2">💰</span>
                          <span className="text-sm text-yellow-700 font-medium">
                            Set competitive rates to attract more clients while ensuring fair compensation for your work
                          </span>
                        </div>
                      </div>
                    )} */}
                  </div>
                )}


                <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <input
                    type="checkbox"
                    className="w-5 h-5 text-warning bg-gray-100 border-gray-300 rounded focus:ring-warning focus:ring-2 mt-0.5"
                  />
                  <div className="text-sm text-gray-600">
                    By creating an account, you agree to our{' '}
                    <Link href="/terms">
                      <span className="text-warning hover:text-yellow-600 underline cursor-pointer font-medium">
                        Terms and Conditions
                      </span>
                    </Link>
                    {' '}and{' '}
                    <Link href="/privacy">
                      <span className="text-warning hover:text-yellow-600 underline cursor-pointer font-medium">
                        Privacy Policy
                      </span>
                    </Link>
                    .
                  </div>
                </div>

                <button
                  onClick={() => submit()}
                  className="w-full bg-gradient-to-r from-warning to-yellow-500 hover:from-yellow-500 hover:to-warning text-white font-bold py-4 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 text-lg"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Creating Account...
                    </div>
                  ) : (
                    "Create My VA Account"
                  )}
                </button>

                <div className="text-center mt-6">
                  <Link href={"/professional/auth"}>
                    <span className="text-warning hover:text-yellow-600 font-medium cursor-pointer transition-colors">
                      Already have an account? Sign in →
                    </span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Image Section */}
            {/* <div className="w-full lg:w-1/2 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-warning/20 to-blue-500/20 rounded-full filter blur-3xl"></div>
                <img
                  className="relative z-10 w-full max-w-md h-auto drop-shadow-2xl"
                  src="/images/assistant.png"
                  alt="Virtual Assistant"
                />
              </div>
            </div> */}
          </div>
        </div>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </Fragment>
  );
};

export default ProfAuth;
