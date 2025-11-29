import React, { useState, useEffect } from 'react';
import { SERVER_URL } from '../../pages/_app';
// import { useMutation, gql } from '@apollo/client';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// import { useRecoilValue } from 'recoil';
// import { UserAtom } from '../../atoms/UserAtom';
import axios from 'axios';
// import { SERVER_URL } from 'utils/constants';
// import { print } from 'graphql';
import { useRouter } from "next/router";

// const SET_AVAILABILITIES = gql`
//   mutation SetAvailabilities($input: BulkAvailabilityInput!) {
//     setAvailabilities(input: $input) {
//       _id
//     }
//   }
// `;

const Availability = ({ open, handleClick }) => {
    const [steps, setSteps] = useState(0);
    const [location, setLocation] = useState('');
    const [room, setRoom] = useState('');
    const { query } = useRouter();

    const [loading, setLoading] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [initialAvailability, setInitialAvailability] = useState(null);
    const [mode, setMode] = useState([
        { name: 'online', checked: false },
        { name: 'in person', checked: false },
        { name: 'phone', checked: false },
    ]);
    const [days, setDays] = useState([
        { day: 'Monday', startTime: '', endTime: '', checked: false },
        { day: 'Tuesday', startTime: '', endTime: '', checked: false },
        { day: 'Wednesday', startTime: '', endTime: '', checked: false },
        { day: 'Thursday', startTime: '', endTime: '', checked: false },
        { day: 'Friday', startTime: '', endTime: '', checked: false },
        { day: 'Saturday', startTime: '', endTime: '', checked: false },
    ]);

    useEffect(() => {
        if (query.page) {
            axios.get(`${SERVER_URL}/api/v5/organization/get-availability`, { params: { orgId: query.page } })
                .then(res => {
                    // Support response shapes like { orgAvailability: [...] } or the direct availability object
                    let availability = null;
                    if (res && res.data) {
                        if (Array.isArray(res.data.orgAvailability)) {
                            availability = res.data.orgAvailability.length > 0 ? res.data.orgAvailability[0] : null;
                        } else if (Array.isArray(res.data) && res.data.length > 0) {
                            availability = res.data[0];
                        } else if (res.data && Object.keys(res.data).length > 0) {
                            availability = res.data;
                        }
                    }

                    if (availability) {
                        setIsEdit(true);
                        setInitialAvailability(availability);
                        setLocation(availability.location || '');
                        setRoom(availability.room || '');
                        setMode(availability.mode || [
                            { name: 'online', checked: false },
                            { name: 'in person', checked: false },
                            { name: 'phone', checked: false }
                        ]);
                        setDays(availability.days || [
                            { day: 'Monday', startTime: '', endTime: '', checked: false },
                            { day: 'Tuesday', startTime: '', endTime: '', checked: false },
                            { day: 'Wednesday', startTime: '', endTime: '', checked: false },
                            { day: 'Thursday', startTime: '', endTime: '', checked: false },
                            { day: 'Friday', startTime: '', endTime: '', checked: false },
                            { day: 'Saturday', startTime: '', endTime: '', checked: false }
                        ]);
                    } else {
                        setIsEdit(false);
                        setInitialAvailability(null);
                        setLocation('');
                        setRoom('');
                        setMode([
                            { name: 'online', checked: false },
                            { name: 'in person', checked: false },
                            { name: 'phone', checked: false }
                        ]);
                        setDays([
                            { day: 'Monday', startTime: '', endTime: '', checked: false },
                            { day: 'Tuesday', startTime: '', endTime: '', checked: false },
                            { day: 'Wednesday', startTime: '', endTime: '', checked: false },
                            { day: 'Thursday', startTime: '', endTime: '', checked: false },
                            { day: 'Friday', startTime: '', endTime: '', checked: false },
                            { day: 'Saturday', startTime: '', endTime: '', checked: false }
                        ]);
                    }
                })
                .catch(err => {
                    setIsEdit(false);
                    setInitialAvailability(null);
                    setLocation('');
                    setRoom('');
                    setMode([
                        { name: 'online', checked: false },
                        { name: 'in person', checked: false },
                        { name: 'phone', checked: false }
                    ]);
                    setDays([
                        { day: 'Monday', startTime: '', endTime: '', checked: false },
                        { day: 'Tuesday', startTime: '', endTime: '', checked: false },
                        { day: 'Wednesday', startTime: '', endTime: '', checked: false },
                        { day: 'Thursday', startTime: '', endTime: '', checked: false },
                        { day: 'Friday', startTime: '', endTime: '', checked: false },
                        { day: 'Saturday', startTime: '', endTime: '', checked: false }
                    ]);
                });
        }
    }, [query.page]);

    const updateAvailability = async () => {
        try {
            setLoading(true);
            const endpoint = isEdit
                ? '/api/v5/organization/edit-availability'
                : '/api/v5/organization/set-availability';
            const payload = {
                orgId: query.page,
                days,
                mode,
                room,
                location
            };
            await axios.post(SERVER_URL + endpoint, payload);
            toast.success('Availability successfully saved!');
            handleClick();
        } catch (error) {
            toast.error('Failed to save availability');
        } finally {
            setLoading(false);
        }
    };

    const handleModeChange = (index, field, value) => {
        const updated = [...mode];
        updated[index] = { ...updated[index], [field]: value };
        setMode(updated);
    };

    const handleDaysInputChange = (index, updates) => {
        setDays(prev =>
            prev.map((day, i) => (i === index ? { ...day, ...updates } : day))
        );
    };

    const handleChecked = (index, e) => {
        const isChecked = e.target.checked;
        handleDaysInputChange(index, {
            checked: isChecked,
            startTime: isChecked ? '09:00:00' : '',
            endTime: isChecked ? '17:00:00' : '',
        });
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                onClick={handleClick}
                className="absolute inset-0 bg-black opacity-40"
            />

            <div className="relative w-full max-w-3xl mx-4 bg-white rounded-lg shadow-xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <div className="flex space-x-6">
                        <button
                            onClick={() => setSteps(0)}
                            className={`px-3 py-2 rounded-md focus:outline-none ${steps === 0 ? 'bg-yellow-200 text-gray-800 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            Mode of Appointment
                        </button>
                        <button
                            onClick={() => setSteps(1)}
                            className={`px-3 py-2 rounded-md focus:outline-none ${steps === 1 ? 'bg-yellow-200 text-gray-800 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            Available Time
                        </button>
                    </div>
                    <button onClick={() => handleClick()} className="text-gray-600 hover:text-gray-900">✕</button>
                </div>

                <div className="p-6">
                    <ToastContainer />
                    {steps === 0 && (
                        <div className="space-y-6">
                            <p className="text-gray-700">Setting your mode of Appointment will enable clients to reach you via online, phone, or in-person.</p>

                            <div className="space-y-3">
                                {mode.map((single, index) => (
                                    <label key={index} className="flex items-center space-x-3">
                                        <input
                                            onChange={() => handleModeChange(index, 'checked', !single.checked)}
                                            type="checkbox"
                                            checked={single.checked}
                                            className="h-4 w-4 text-yellow-500"
                                        />
                                        <span className="capitalize text-gray-800">{single.name}</span>
                                    </label>
                                ))}
                            </div>

                            {mode[1].checked && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm text-gray-600">Appointment Location</label>
                                        <input
                                            onChange={e => setLocation(e.target.value)}
                                            value={location}
                                            className="w-full border rounded-md p-3 mt-1"
                                            placeholder="Place where this Event will be held"
                                            type="text"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-600">Room No.</label>
                                        <input
                                            value={room}
                                            onChange={e => setRoom(e.target.value)}
                                            className="w-full border rounded-md p-3 mt-1"
                                            placeholder="Room No."
                                            type="text"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end space-x-4">
                                <button onClick={() => setSteps(1)} className="bg-yellow-500 text-white px-5 py-2 rounded-md">Next</button>
                                <button onClick={handleClick} className="px-4 py-2 rounded-md border">Cancel</button>
                            </div>
                        </div>
                    )}

                    {steps === 1 && (
                        <div className="space-y-4">
                            <p className="text-gray-700">Select appointment day and time</p>
                            <div className="space-y-2">
                                {days.map((day, index) => (
                                    <div key={index} className="flex items-center space-x-3">
                                        <input onChange={e => handleChecked(index, e)} checked={day.checked} type="checkbox" className="h-4 w-4 text-yellow-500" />
                                        <div className="w-28 text-gray-700">{day.day}</div>
                                        <input value={day.startTime} onChange={e => handleDaysInputChange(index, { startTime: e.target.value })} className={`py-2 px-3 rounded-md border ${day.checked && !day.startTime ? 'border-red-500' : 'border-gray-200'}`} type="time" />
                                        <span className="text-gray-500">to</span>
                                        <input value={day.endTime} onChange={e => handleDaysInputChange(index, { endTime: e.target.value })} className={`py-2 px-3 rounded-md border ${day.checked && !day.endTime ? 'border-red-500' : 'border-gray-200'}`} type="time" />
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-end space-x-4">
                                <button onClick={updateAvailability} className="bg-yellow-500 text-white px-5 py-2 rounded-md" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
                                <button onClick={handleClick} className="px-4 py-2 rounded-md border">Cancel</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Availability;
