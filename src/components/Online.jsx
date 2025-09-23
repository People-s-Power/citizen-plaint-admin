import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { SERVER_URL } from '../components/MessageComponent';

const Online = ({ id }) => {
    const [isOnline, setIsOnline] = useState(false);

    useEffect(() => {
        const socket = io(SERVER_URL);

        socket.on('connect', () => {
            socket.emit('check_online', { userId: id });
        });

        socket.on('user_online', (data) => {
            if (data.userId === id) {
                setIsOnline(data.online);
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [id]);

    return (
        <div className="w-2 h-2 rounded-full my-auto mr-2"
            style={{ backgroundColor: isOnline ? '#4CAF50' : '#ccc' }}
        />
    );
};

export default Online;
