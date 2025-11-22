import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from "next/router";
import axios from 'axios';
import { SERVER_URL } from '../../pages/_app';

const dayMapping = {
    "Sunday": 0,
    "Monday": 1,
    "Tuesday": 2,
    "Wednesday": 3,
    "Thursday": 4,
    "Friday": 5,
    "Saturday": 6,
};

const AppointmentModal = ({ open, handleClick, to, data }) => {
    const [steps, setSteps] = useState(0)
    const [location, setLocation] = useState(data?.location || '')
    const [room, setRoom] = useState(data?.room || '')
    const [mode, setMode] = useState(data?.mode || "")
    const [category, setCategory] = useState(data?.category || "")
    const [reason, setReason] = useState(data?.reason || "")
    const [date, setDate] = useState(data?.date || "")
    const [time, setTime] = useState(data?.time || "")
    const [loading, setLoading] = useState(false);
    const [availability, setAvailability] = useState();
    const [phone, setPhone] = useState("");
    const { query } = useRouter()
    const [availabilityData, setAvailabilityData] = useState();

    useEffect(() => {
        if (to) {
            axios.get(`${SERVER_URL}/api/v5/organization/get-availability`, { params: { userId: to } })
                .then(res => {
                    setAvailabilityData(res.data);
                })
                .catch(err => {
                    console.log(err);
                });
        }
    }, [to])
    useEffect(() => {
        setLocation(data?.location);
        setRoom(data?.room);
        setMode(data?.mode);
        setCategory(data?.category);
        setReason(data?.reason);
        setDate(data?.date);
        setTime(data?.time);
    }, [data]);

    const bookAppointment = async (appointmentData) => {
        try {
            // appointmentData should match the payload structure described earlier
            await axios.post(SERVER_URL + '/api/v5/appointments/book', appointmentData);
            toast.success('Appointment booked successfully!');
            handleClick();
            // Optionally close modal or reset form here
        } catch (error) {
            toast.error('Failed to book appointment');
        }
    };

    const handleDateChange = (e) => {
        const inputDate = e.target.value;
        const selectedDay = new Date(inputDate).getUTCDay(); // 0 = Sunday, 6 = Saturday

        let isDayAllowed = true;

        availability.days.forEach((single, index) => {
            if (single.checked) {
                // Days from Monday (index 1) to Friday (index 5)
                if (index >= 1 && index <= 5 && selectedDay === index) {
                    isDayAllowed = false;
                }
            }
        });

        if (!isDayAllowed) {
            alert('Selected date is not allowed. Please choose another day.');
            setDate(''); // Reset if invalid date
        } else {
            setDate(inputDate); // Set valid date
        }
    };

    return (
        open ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                {/* Backdrop */}
                <div onClick={() => handleClick()} className="absolute inset-0 bg-black opacity-50" />
                {/* Modal Panel */}
                <div className="relative bg-[#F8F7F4] rounded-xl shadow-2xl w-full max-w-2xl mx-4 lg:mx-0 overflow-hidden flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b bg-white">
                        <div className="flex gap-8 items-end">
                            <button
                                onClick={() => setSteps(0)}
                                className={`pb-2 ${steps === 0 ? 'text-[#111827] border-b-2 border-[#DC9F08] font-medium' : 'text-gray-600 hover:text-gray-800'}`}
                            >
                                Appointment
                            </button>
                            <button
                                onClick={() => setSteps(1)}
                                className={`pb-2 ${steps === 1 ? 'text-[#111827] border-b-2 border-[#DC9F08] font-medium' : 'text-gray-600 hover:text-gray-800'}`}
                            >
                                Available Time
                            </button>
                        </div>
                        <button
                            onClick={() => handleClick()}
                            aria-label="Close appointment modal"
                            className="text-gray-600 hover:text-gray-800 rounded p-2"
                        >
                            ×
                        </button>
                    </div>
                    {/* Body */}
                    <div className="p-6 overflow-y-auto flex-1">
                        <ToastContainer />
                        {(() => {
                            switch (steps) {
                                case 0:
                                    return (
                                        <div className="space-y-6">
                                            <div>
                                                <label className="block mb-2 font-semibold">Appointment Mode</label>
                                                <select onChange={(e) => setMode(e.target.value)} value={mode} className="w-full border capitalize rounded-md p-3 bg-white">
                                                    <option className="hidden" value="">Select Mode</option>
                                                    {availabilityData?.mode?.length > 1
                                                        ? availabilityData?.mode.map((single, index) => single.checked && <option key={index} className="capitalize" value={single.name}>{single.name}</option>)
                                                        : [<option key="online" value="online">Online</option>, <option key="in person" value="in person">In Person</option>, <option key="phone" value="phone">Phone</option>]
                                                    }
                                                </select>
                                            </div>
                                            {mode === 'phone' && (
                                                <div>
                                                    <label className="block mb-2 font-semibold">Enter Your Phone Number</label>
                                                    <input className="w-full border rounded-md p-3 bg-white" value={phone} onChange={(e) => setPhone(e.target.value)} type="number" />
                                                </div>
                                            )}
                                            <div>
                                                <label className="block mb-2 font-semibold">Appointment Category</label>
                                                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border rounded-md p-3 bg-white">
                                                    <option className="hidden" value="">Select Category</option>
                                                    <option value="Mentorhsip">Mentorhsip</option>
                                                    <option value="Classes">Classes</option>
                                                    <option value="Enquiries">Enquiries</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block mb-2 font-semibold">Reason for Appointment</label>
                                                <textarea value={reason} onChange={(e) => setReason(e.target.value)} className="h-20 w-full border rounded-md p-3 bg-white" />
                                            </div>
                                            <div className="flex justify-end gap-3 mt-6">
                                                <button onClick={() => handleClick()} className="px-4 py-2 rounded-md border">Cancel</button>
                                                <button onClick={() => setSteps(1)} className="px-4 py-2 rounded-md bg-[#FDC332] text-white">Next</button>
                                            </div>
                                        </div>
                                    );
                                case 1:
                                    return (
                                        <div className="space-y-6">
                                            <p className="font-bold">Select your available time for appointment</p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block mb-2 font-semibold">Date</label>
                                                    <input id="customDate" onChange={(e) => availabilityData?.days?.length > 1 ? handleDateChange(e) : setDate(e.target.value)} value={date} className="w-full border rounded-md p-3 bg-white" type="date" />
                                                </div>
                                                <div>
                                                    <label className="block mb-2 font-semibold">Time</label>
                                                    <input value={time} onChange={(e) => setTime(e.target.value)} className="w-full border rounded-md p-3 bg-white" type="time" />
                                                </div>
                                            </div>
                                            <div className="flex justify-end gap-3 mt-6">
                                                <button onClick={() => handleClick()} className="px-4 py-2 rounded-md border">Cancel</button>
                                                <button onClick={() => bookAppointment({ category, date, time, reason, duration: 60, mode, from: query.page, to, orgId: query.page })} className="px-4 py-2 rounded-md bg-[#FDC332] text-white">{loading ? (data ? 'Editing...' : 'Booking...') : (data ? 'Edit Appointment' : 'Book Appointment')}</button>
                                            </div>
                                        </div>
                                    );
                                case 2:
                                    return (
                                        <div className="space-y-6">
                                            <label className="block mb-2 font-semibold">Appointment Location</label>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <input onChange={(e) => setLocation(e.target.value)} value={location} className="w-full border rounded-md p-3 bg-white" placeholder="Place where this Event will be held" type="text" />
                                                <input value={room} onChange={(e) => setRoom(e.target.value)} className="w-full border rounded-md p-3 bg-white" placeholder="Room No." type="text" />
                                            </div>
                                            <div className="flex justify-end gap-3 mt-6">
                                                <button onClick={() => handleClick()} className="px-4 py-2 rounded-md border">Cancel</button>
                                                <button onClick={() => bookAppointment({ category, date, time, reason, duration: 60, mode, from: query.page, to })} className="px-4 py-2 rounded-md bg-[#FDC332] text-white">{loading ? (data ? 'Editing...' : 'Booking...') : (data ? 'Edit Appointment' : 'Book Appointment')}</button>
                                            </div>
                                        </div>
                                    );
                                default:
                                    return null;
                            }
                        })()}
                    </div>
                </div>
            </div>
        ) : null
    );
}

export default AppointmentModal;