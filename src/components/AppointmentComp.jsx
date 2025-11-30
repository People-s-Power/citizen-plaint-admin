import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import AvailabilityModal from "./modals/AvailabilityModal";
import axios from "axios";
import { SERVER_URL } from "../pages/_app";
import { useRouter } from "next/router";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";

import { useAtom } from 'jotai';
import { accessAtom } from '../atoms/adminAtom';
import { checkAccess } from '../utils/accessUtils';
const localizer = momentLocalizer(moment);

const AppointmentComp = () => {
    const [open, setOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("appointments");
    const [loading, setLoading] = useState(false);
    const [access, _] = useAtom(accessAtom);
    const { query } = useRouter();
    const [appointments, setAppointments] = useState([]);

    // Fetch appointments and populate state
    const fetchAppointments = async () => {
        if (query.page) {
            try {
                const response = await axios.get(`${SERVER_URL}/api/v5/appointments`, {
                    params: { id: query.page },
                });
                setAppointments(response.data);
            } catch (error) {
                console.error("Error fetching appointments:", error);
            }
        }
    };

    useEffect(() => {
        fetchAppointments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query.page]);

    const deleteAppointment = async (id) => {
        try {
            await axios.delete(`${SERVER_URL}/api/v5/appointments/${id}`);
            toast.success("Appointment successfully cancelled!");
            fetchAppointments(); // Refresh list after delete
        } catch (error) {
            console.error(error);
            toast.error("Failed to cancel appointment");
        }
    };

    return (
        <>
            <ToastContainer />
            <div className="px-4 flex flex-col lg:flex-row gap-6">
                {/* Right Section: Tabs */}
                {/* <div className="w-full lg:w-64 bg-white rounded-md shadow-sm p-4 border">
                    <h3 className="font-semibold mb-4">View Options</h3>
                    <div className="flex flex-col space-y-3">
                        <button
                            onClick={() => setActiveTab("appointments")}
                            className={`px-4 py-2 rounded-md text-left ${activeTab === "appointments"
                                ? "bg-[#FDC332] text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                        >
                            📋 Appointments
                        </button>
                        {checkAccess(access, 'View Calendar') && (
                            <button
                                onClick={() => setActiveTab("calendar")}
                                className={`px-4 py-2 rounded-md text-left ${activeTab === "calendar"
                                    ? "bg-[#FDC332] text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                            >
                                🗓️ Calendar
                            </button>
                        )}
                    </div>
                </div> */}

                {/* Left Section: Appointments / Calendar */}
                <div className="flex-1">
                    <div className="flex justify-between mb-6">
                        <div className="flex gap-4">
                            <h2 onClick={() => setActiveTab("appointments")} className={`text-xl font-semibold ${activeTab === "appointments" ? "border-b-2 border-[#FDC332]" : "cursor-pointer"}`}>
                                My Appointments
                            </h2>
                            <h2 onClick={() => setActiveTab("calendar")} className={`text-xl font-semibold ${activeTab === "calendar" ? "border-b-2 border-[#FDC332]" : "cursor-pointer"}`}>
                                My Calendar
                            </h2>
                        </div>

                        {checkAccess(access, 'Set Availability') && (
                            <button
                                onClick={() => setOpen(true)}
                                className="bg-[#FDC332] text-white px-4 py-2 rounded-md hover:bg-[#e3b02d] transition-colors"
                            >
                                Set Availability
                            </button>
                        )}
                    </div>

                    {/* Loading State */}
                    {loading && <p className="text-center">Loading appointments...</p>}

                    {/* Conditional Rendering for Tabs */}
                    {activeTab === "appointments" ? (
                        <div className="lg:flex flex-wrap justify-between">
                            {appointments.length >= 1 ? (
                                appointments.map((appointment) => (
                                    <div
                                        key={appointment._id}
                                        className="p-4 my-3 border lg:w-[48%] rounded-md bg-white shadow-sm"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center">
                                                <img
                                                    className="w-10 h-10 rounded-full object-cover mr-3"
                                                    src={
                                                        appointment.from?._id === query.page
                                                            ? appointment?.to.image || "/images/user.png"
                                                            : appointment?.from?.image || "/images/user.png"
                                                    }
                                                    alt=""
                                                />
                                                <p className="font-medium text-lg">
                                                    {appointment.from?._id === query.page
                                                        ? appointment?.to?.name
                                                        : appointment?.from?.name}
                                                </p>
                                            </div>
                                            {appointment.from?._id === query.page &&
                                                checkAccess(access, 'Delete Appointment') && (
                                                    <div className="flex gap-3">
                                                        <button
                                                            onClick={() => deleteAppointment(appointment._id)}
                                                            className="text-red-500 hover:text-red-700"
                                                        >
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                width="16"
                                                                height="16"
                                                                fill="currentColor"
                                                                className="bi bi-trash3-fill"
                                                                viewBox="0 0 16 16"
                                                            >
                                                                <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1z" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                )}
                                        </div>

                                        <p className="text-gray-600 mb-2">
                                            <strong>Mode:</strong> {appointment.mode}
                                        </p>
                                        <p className="text-gray-600 mb-2">
                                            <strong>Category:</strong> {appointment.category}
                                        </p>
                                        <p className="text-gray-600 mb-2">
                                            <strong>Date:</strong> {appointment.date}
                                        </p>
                                        <p className="text-gray-600 mb-2">
                                            <strong>Time:</strong> {appointment.time}
                                        </p>
                                        {appointment.location && (
                                            <p className="text-gray-600 mb-2">
                                                <strong>Location:</strong> {appointment.location}
                                            </p>
                                        )}
                                        <p
                                            className={`text-sm font-medium mt-2 ${appointment.status === "CANCELLED"
                                                ? "text-red-500"
                                                : "text-green-600"
                                                }`}
                                        >
                                            Status: {appointment.status}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <p>No active appointments!</p>
                            )}
                        </div>
                    ) : (
                        <div className="p-6 bg-white rounded-md shadow-sm">
                            <Calendar
                                style={{ height: "80vh" }}
                                localizer={localizer}
                                events={appointments.map(app => ({
                                    title: `${app.mode || ''} - ${app.category || ''}`,
                                    start: app.date ? new Date(app.date + 'T' + (app.time || '09:00')) : new Date(),
                                    end: app.date ? new Date(app.date + 'T' + (app.time || '10:00')) : new Date(),
                                    allDay: false,
                                    resource: app,
                                }))}
                                startAccessor="start"
                                endAccessor="end"
                                titleAccessor="title"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Availability Modal */}
            <AvailabilityModal open={open} handleClick={() => setOpen(false)} />
        </>
    );
};

export default AppointmentComp;
