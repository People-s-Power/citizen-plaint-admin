import React, { useState, useEffect } from 'react';

const TaskViewModal = ({ open, task, onClose }) => {
    const [showCompleted, setShowCompleted] = useState(true);
    const [toggleLoading, setToggleLoading] = useState(false);
    const [localTask, setLocalTask] = useState(task);

    useEffect(() => {
        setLocalTask(task);
    }, [task]);

    if (!open || !localTask) return null;

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getStatusColor = (status) => {
        const colors = {
            'OPEN': 'bg-yellow-100 text-yellow-800',
            'DONE': 'bg-green-100 text-green-800',
            'COMPLETE': 'bg-green-100 text-green-800',
            'OVERDUE': 'bg-red-100 text-red-800',
            'UNDER_REVIEW': 'bg-blue-100 text-blue-800',
            'ONGOING': 'bg-blue-100 text-blue-800',
            'ABANDONED': 'bg-red-100 text-red-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    // Calculate subtask statistics
    const totalCount = localTask.subtasks?.length || 0;
    const completedCount = localTask.subtasks?.filter(st => st.done).length || 0;

    // Filter subtasks based on showCompleted state
    const filteredSubtasks = showCompleted
        ? localTask.subtasks
        : localTask.subtasks?.filter(st => !st.done);

    // const handleToggleSubtask = async (index) => {
    //     // Placeholder for toggling subtask completion
    //     setToggleLoading(true);
    //     // Add your API call here to toggle subtask
    //     setTimeout(() => {
    //         setToggleLoading(false);
    //     }, 500);
    // };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={onClose}>
            <div
                className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="border-b border-gray-200 p-6">
                    <div className="flex justify-between items-start mb-3">
                        <h2 className="text-xl font-bold text-gray-900 flex-1">{localTask.name}</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors ml-4"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(localTask.status)}`}>
                            {localTask.status}
                        </span>
                        <span className="text-sm text-gray-500">
                            Due: {formatDate(localTask.dueDate)} {localTask.dueTime && `at ${localTask.dueTime}`}
                        </span>
                    </div>
                </div>

                {/* Body - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-6">
                        {/* Instructions */}
                        {localTask.instruction && (
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-gray-700">{localTask.instruction}</p>
                            </div>
                        )}

                        {/* Assigned To & Author */}
                        <div className="flex gap-6">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center">
                                    <img
                                        src={localTask.assigne?.[0]?.image || "/images/assistant.png"}
                                        alt=""
                                        className="w-10 h-10 rounded-full border-2 border-gray-200 object-cover"
                                    />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Assigned to</p>
                                    <p className="font-medium">{localTask.assigne?.[0]?.name || "Unassigned"}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 border-l pl-6">
                                <div className="flex items-center">
                                    <img
                                        src={localTask.author?.image || "/images/assistant.png"}
                                        alt=""
                                        className="w-10 h-10 rounded-full border-2 border-gray-200 object-cover"
                                    />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Created by</p>
                                    <p className="font-medium">{localTask.author?.name}</p>
                                </div>
                            </div>
                        </div>

                        {/* Subtasks */}
                        {localTask.subtasks && localTask.subtasks.length > 0 && (
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M9 11l3 3L22 4"></path>
                                            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                                        </svg>
                                        Subtasks ({completedCount}/{totalCount} completed)
                                    </h4>
                                    {completedCount > 0 && (
                                        <button
                                            onClick={() => setShowCompleted(!showCompleted)}
                                            className="text-xs px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex items-center gap-1"
                                        >
                                            {showCompleted ? (
                                                <>
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                                        <line x1="1" y1="1" x2="23" y2="23"></line>
                                                    </svg>
                                                    Hide Completed
                                                </>
                                            ) : (
                                                <>
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                                        <circle cx="12" cy="12" r="3"></circle>
                                                    </svg>
                                                    Show Completed
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                                <div className="space-y-3">
                                    {filteredSubtasks?.map((subtask, idx) => {
                                        const originalIndex = localTask.subtasks.findIndex((st) => st === subtask);
                                        return (
                                            <div
                                                key={idx}
                                                className={`border rounded-lg p-4 bg-white transition-all ${subtask.done
                                                        ? 'border-green-200 bg-green-50 opacity-75'
                                                        : 'border-gray-200 hover:shadow-sm'
                                                    }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <button
                                                        // onClick={() => handleToggleSubtask(originalIndex)}
                                                        disabled={toggleLoading}
                                                        className="flex-shrink-0 mt-1 cursor-pointer"
                                                    >
                                                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${subtask.done
                                                                ? 'bg-green-500 border-green-500'
                                                                : 'border-gray-300 hover:border-green-400'
                                                            }`}>
                                                            {subtask.done && (
                                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                                    <polyline points="20 6 9 17 4 12"></polyline>
                                                                </svg>
                                                            )}
                                                        </div>
                                                    </button>
                                                    <div className="flex-1">
                                                        {subtask.title && (
                                                            <h5 className={`font-semibold mb-1 ${subtask.done ? 'text-gray-500 line-through' : 'text-gray-900'
                                                                }`}>{subtask.title}</h5>
                                                        )}
                                                        {subtask.description && (
                                                            <p className={`text-sm mb-2 ${subtask.done ? 'text-gray-400 line-through' : 'text-gray-600'
                                                                }`}>{subtask.description}</p>
                                                        )}

                                                        {/* Subtask Attachments */}
                                                        {subtask.attachments && subtask.attachments.length > 0 && (
                                                            <div className="mt-3">
                                                                <div className="flex flex-wrap gap-2">
                                                                    {subtask.attachments.map((attachment, attachIdx) => (
                                                                        <div key={attachIdx} className="relative group">
                                                                            {attachment.type === "image" ? (
                                                                                <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                                                                                    <img
                                                                                        src={attachment.url}
                                                                                        alt={`Attachment ${attachIdx + 1}`}
                                                                                        className="w-20 h-20 object-cover rounded border border-gray-200 hover:border-blue-400 transition-colors cursor-pointer"
                                                                                    />
                                                                                </a>
                                                                            ) : attachment.type === "video" ? (
                                                                                <video
                                                                                    src={attachment.url}
                                                                                    className="w-20 h-20 object-cover rounded border border-gray-200"
                                                                                    controls
                                                                                />
                                                                            ) : (
                                                                                <a
                                                                                    href={attachment.url}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className="flex items-center justify-center w-20 h-20 bg-gray-100 rounded border border-gray-200 hover:border-blue-400 transition-colors"
                                                                                >
                                                                                    <div className="text-center">
                                                                                        <svg className="w-6 h-6 mx-auto text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                                                                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                                                                        </svg>
                                                                                        <span className="text-xs text-gray-600">PDF</span>
                                                                                    </div>
                                                                                </a>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Updates */}
                        {localTask.updates && localTask.updates.length > 0 && (
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 20h9"></path>
                                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                                    </svg>
                                    Updates & Comments
                                </h4>
                                <div className="space-y-3">
                                    {(showCompleted ? localTask.updates : localTask.updates.filter(u => !u.done))?.map((update, idx) => (
                                        <div
                                            key={idx}
                                            className={`border rounded-lg p-4 bg-white transition-all ${update.done
                                                ? 'border-green-200 bg-green-50 opacity-75'
                                                : 'border-gray-200 hover:shadow-sm'
                                                }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="flex-shrink-0 mt-1">
                                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${update.done
                                                        ? 'bg-green-500 border-green-500'
                                                        : 'border-gray-300'
                                                        }`}>
                                                        {update.done && (
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                                <polyline points="20 6 9 17 4 12"></polyline>
                                                            </svg>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    {update.text && (
                                                        <p className={`mb-2 ${update.done ? 'text-gray-500 line-through' : 'text-gray-900'
                                                            }`}>{update.text}</p>
                                                    )}

                                                    {/* Update Attachments */}
                                                    {update.media && update.media.length > 0 && (
                                                        <div className="mt-3">
                                                            <div className="flex flex-wrap gap-2">
                                                                {update.media.map((attachment, attachIdx) => (
                                                                    <div key={attachIdx} className="relative group">
                                                                        {attachment.type === "image" ? (
                                                                            <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                                                                                <img
                                                                                    src={attachment.url}
                                                                                    alt={`Attachment ${attachIdx + 1}`}
                                                                                    className="w-20 h-20 object-cover rounded border border-gray-200 hover:border-blue-400 transition-colors cursor-pointer"
                                                                                />
                                                                            </a>
                                                                        ) : attachment.type === "video" ? (
                                                                            <video
                                                                                src={attachment.url}
                                                                                className="w-20 h-20 object-cover rounded border border-gray-200"
                                                                                controls
                                                                            />
                                                                        ) : (
                                                                            <a
                                                                                href={attachment.url}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="flex items-center justify-center w-20 h-20 bg-gray-100 rounded border border-gray-200 hover:border-blue-400 transition-colors"
                                                                            >
                                                                                <div className="text-center">
                                                                                    <svg className="w-6 h-6 mx-auto text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                                                                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                                                                    </svg>
                                                                                    <span className="text-xs text-gray-600">File</span>
                                                                                </div>
                                                                            </a>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Main Task Attachments */}
                        {localTask.asset?.length > 0 && (
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                                    </svg>
                                    Attachments ({localTask.asset.length})
                                </h4>
                                <div className="flex flex-wrap gap-3">
                                    {localTask.asset.map((file, idx) => (
                                        <div key={idx} className="relative group">
                                            {file.type === "image" ? (
                                                <a href={file.url} target="_blank" rel="noopener noreferrer">
                                                    <img
                                                        src={file.url}
                                                        alt={`Attachment ${idx + 1}`}
                                                        className="w-24 h-24 object-cover rounded-lg border border-gray-200 hover:border-blue-400 transition-colors cursor-pointer"
                                                    />
                                                </a>
                                            ) : file.type === "video" ? (
                                                <video
                                                    src={file.url}
                                                    className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                                                    controls
                                                />
                                            ) : (
                                                <a
                                                    href={file.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-center w-24 h-24 bg-gray-100 rounded-lg border border-gray-200 hover:border-blue-400 transition-colors"
                                                >
                                                    <span className="text-blue-600 text-sm font-medium">View File</span>
                                                </a>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Timeline */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between text-sm">
                                <div>
                                    <p className="text-gray-500">Created</p>
                                    <p className="font-medium text-gray-900">{formatDate(localTask.createdAt)}</p>
                                </div>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="9 18 15 12 9 6"></polyline>
                                </svg>
                                <div>
                                    <p className="text-gray-500">Due</p>
                                    <p className="font-medium text-gray-900">{formatDate(localTask.dueDate)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskViewModal;
