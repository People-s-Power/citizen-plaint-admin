import React, { useState } from "react";
// import { useQuery, useMutation, gql } from "@apollo/client";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import AvailabilityModal from "./modals/AvailabilityModal";
// import { useRecoilValue } from "recoil";
// import { UserAtom } from "../atoms/UserAtom";
// import { apollo } from "apollo";
import { useRouter } from "next/router";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";

const localizer = momentLocalizer(moment);

// const GET_USER_APPOINTMENTS = gql`
//   query GetUserAppointments($userId: ID!) {
//     getUserAppointments(userId: $userId) {
//       _id
//       from {
//         name
//         email
//         image
//       }
//       to {
//         name
//         email
//         image
//       }
//       mode
//       category
//       date
//       time
//       location
//       status
//       createdAt
//     }
//   }
// `;

// const DELETE_APPOINTMENT = gql`
//   mutation UpdateAppointmentStatus($id: ID!, $status: String!) {
//     updateAppointmentStatus(id: $id, status: $status) {
//       _id
//       status
//     }
//   }
// `;

const AppointmentComp = () => {
    const [open, setOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("appointments");
    const [loading, setLoading] = useState(false);
    // const user = useRecoilValue(UserAtom);
    const { query } = useRouter();
    const [appointments, setAppointments] = useState([]);

    // const [updateAppointmentStatus] = useMutation(DELETE_APPOINTMENT);

    // const { loading } = useQuery(GET_USER_APPOINTMENTS, {
    //     client: apollo,
    //     variables: { userId: query.page || user?.id },
    //     onCompleted: (data) => {
    //         setAppointments(data?.getUserAppointments || []);
    //     },
    //     onError: (err) => console.error(err),
    // });

    const deleteAppointment = async (id) => {
        try {
            // await updateAppointmentStatus({
            //     variables: {
            //         id,
            //         status: "CANCELLED",
            //     },
            // });
            toast.success("Appointment successfully cancelled!");
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
                <div className="w-full lg:w-64 bg-white rounded-md shadow-sm p-4 border">
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
                        <button
                            onClick={() => setActiveTab("calendar")}
                            className={`px-4 py-2 rounded-md text-left ${activeTab === "calendar"
                                ? "bg-[#FDC332] text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                        >
                            🗓️ Calendar
                        </button>
                    </div>
                </div>

                {/* Left Section: Appointments / Calendar */}
                <div className="flex-1">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold">
                            My {activeTab === "appointments" ? "Appointments" : "Calendar"}
                        </h2>
                        <button
                            onClick={() => setOpen(true)}
                            className="bg-[#FDC332] text-white px-4 py-2 rounded-md hover:bg-[#e3b02d] transition-colors"
                        >
                            Set Availability
                        </button>
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
                                                        appointment.from?._id === user.id
                                                            ? appointment.to.image || "/images/user.png"
                                                            : appointment.from?.image || "/images/user.png"
                                                    }
                                                    alt=""
                                                />
                                                <p className="font-medium text-lg">
                                                    {appointment.from?._id === user.id
                                                        ? appointment.to.name
                                                        : appointment.from?.name}
                                                </p>
                                            </div>
                                            {appointment.from?._id === user.id && (
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
                                events={[]}
                                startAccessor="start"
                                endAccessor="end"
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
