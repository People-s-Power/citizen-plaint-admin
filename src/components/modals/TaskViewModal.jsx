import React, { useState, useEffect } from 'react';

const TaskViewModal = ({ open, task, onClose, onTaskUpdate }) => {
    const [showCompleted, setShowCompleted] = useState(true);
    const [toggleLoading, setToggleLoading] = useState(false);
    const [localTask, setLocalTask] = useState(task);
    const [expandedImage, setExpandedImage] = useState(null);
    const [collapsedSubtasks, setCollapsedSubtasks] = useState(new Set());

    useEffect(() => {
        setLocalTask(task);
    }, [task]);

    const toggleSubtaskCollapse = (index) => {
        setCollapsedSubtasks(prev => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
    };

    if (!open || !localTask) return null;

    const handleToggleSubtask = async (subtaskIndex, descriptionIndex) => {
        if (toggleLoading) return;

        try {
            setToggleLoading(true);
            // TODO: Add your API call here to toggle subtask
            // Example:
            // const { data } = await axios.post('/api/graphql', {
            //     query: TOGGLE_SUBTASK_DONE,
            //     variables: { taskId: localTask._id, subtaskIndex, descriptionIndex }
            // });
            // if (data?.data?.toggleSubtaskDone) {
            //     setLocalTask(data.data.toggleSubtaskDone);
            //     if (onTaskUpdate) onTaskUpdate(data.data.toggleSubtaskDone);
            // }

            console.log('Toggle subtask:', subtaskIndex, descriptionIndex);
        } catch (error) {
            console.error("Error toggling subtask:", error);
        } finally {
            setToggleLoading(false);
        }
    };

    // Calculate completed count based on new structure
    const getTotalDescriptionsCount = () => {
        if (!localTask.subtasks) return 0;
        return localTask.subtasks.reduce((total, subtask) => {
            return total + (subtask.description?.length || 0);
        }, 0);
    };

    const getCompletedDescriptionsCount = () => {
        if (!localTask.subtasks) return 0;
        return localTask.subtasks.reduce((total, subtask) => {
            if (!subtask.description) return total;
            return total + subtask.description.filter(desc => desc.done).length;
        }, 0);
    };

    const completedCount = getCompletedDescriptionsCount();
    const totalCount = getTotalDescriptionsCount();

    const getStatusColor = (status) => {
        if (status === 'DONE' || status === 'COMPLETE') return 'bg-green-100 text-green-800';
        if (status === 'ONGOING' || status === 'UNDER_REVIEW') return 'bg-blue-100 text-blue-800';
        if (status === 'OPEN') return 'bg-yellow-100 text-yellow-800';
        if (status === 'OVERDUE' || status === 'ABANDONED') return 'bg-red-100 text-red-800';
        return 'bg-gray-100 text-gray-800';
    };

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
                            Due: {new Date(localTask.dueDate).toLocaleDateString()} {localTask.dueTime && `at ${localTask.dueTime}`}
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
                                        src={localTask.assigne?.[0]?.image || "/images/user.png"}
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
                                        src={localTask.author?.image || "/images/user.png"}
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
                                        Tasks ({completedCount}/{totalCount} completed)
                                    </h4>
                                    {completedCount > 0 && (
                                        <button
                                            onClick={() => setShowCompleted(!showCompleted)}
                                            className="text-xs px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex items-center gap-1"
                                        >
                                            {showCompleted ? (
                                                <>
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                                        <circle cx="12" cy="12" r="3"></circle>
                                                    </svg>
                                                    Hide Completed Tasks
                                                </>
                                            ) : (
                                                <>
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                                        <circle cx="12" cy="12" r="3"></circle>
                                                    </svg>
                                                    Show Completed Tasks
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                                <div className="space-y-4">
                                    {localTask.subtasks.map((subtask, subtaskIdx) => {
                                        const isCollapsed = collapsedSubtasks.has(subtaskIdx);

                                        return (
                                            <div key={subtaskIdx} className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                                                {/* Task Title with Collapse Toggle */}
                                                <div className="flex items-center gap-6 mb-3">
                                                    <button
                                                        onClick={() => toggleSubtaskCollapse(subtaskIdx)}
                                                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                                                    >
                                                        <svg
                                                            width="20"
                                                            height="20"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="2"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            className={`transition-transform ${isCollapsed ? '' : 'rotate-180'}`}
                                                        >
                                                            <polyline points="6 9 12 15 18 9"></polyline>
                                                        </svg>
                                                    </button>
                                                    {subtask.title && (
                                                        <h5 className="font-semibold text-gray-900">{subtask.title}</h5>
                                                    )}
                                                </div>

                                                {/* Subtask Descriptions - Collapsible */}
                                                {!isCollapsed && subtask.description && subtask.description.length > 0 && (
                                                    <div className="space-y-2 pl-6">
                                                        {subtask.description.map((desc, descIdx) => {
                                                            // Filter based on showCompleted
                                                            if (!showCompleted && desc.done) return null;

                                                            return (
                                                                <div
                                                                    key={descIdx}
                                                                    className={`border rounded-lg p-3 bg-white transition-all ${desc.done
                                                                        ? 'border-green-200 bg-green-50 opacity-75'
                                                                        : 'border-gray-200 hover:shadow-sm'
                                                                        }`}
                                                                >
                                                                    <div className="flex items-start gap-3">
                                                                        <button
                                                                            onClick={() => handleToggleSubtask(subtaskIdx, descIdx)}
                                                                            disabled={toggleLoading}
                                                                            className="flex-shrink-0 mt-1 cursor-pointer"
                                                                        >
                                                                            <div
                                                                                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${desc.done
                                                                                    ? 'bg-green-500 border-green-500'
                                                                                    : 'border-gray-300 hover:border-green-400'
                                                                                    }`}
                                                                            >
                                                                                {desc.done && (
                                                                                    <svg
                                                                                        width="14"
                                                                                        height="14"
                                                                                        viewBox="0 0 24 24"
                                                                                        fill="none"
                                                                                        stroke="white"
                                                                                        strokeWidth="3"
                                                                                        strokeLinecap="round"
                                                                                        strokeLinejoin="round"
                                                                                    >
                                                                                        <polyline points="20 6 9 17 4 12"></polyline>
                                                                                    </svg>
                                                                                )}
                                                                            </div>
                                                                        </button>
                                                                        <div className="flex-1">
                                                                            {desc.title && (
                                                                                <p
                                                                                    className={`text-sm mb-2 ${desc.done
                                                                                        ? 'text-gray-400 line-through'
                                                                                        : 'text-gray-700'
                                                                                        }`}
                                                                                >
                                                                                    {desc.title}
                                                                                </p>
                                                                            )}

                                                                            {/* Subtask Description Attachment */}
                                                                            {desc.attachment && (
                                                                                <div className="mt-2">
                                                                                    <div className="relative inline-block w-10 h-10">
                                                                                        {desc.attachment.type === 'image' ? (
                                                                                            <img
                                                                                                src={desc.attachment.url}
                                                                                                alt="Attachment"
                                                                                                onClick={() => setExpandedImage(desc.attachment.url)}
                                                                                                className="w-full h-full object-cover rounded border border-gray-200 hover:border-blue-400 transition-colors cursor-pointer"
                                                                                            />
                                                                                        ) : desc.attachment.type === 'video' ? (
                                                                                            <video
                                                                                                src={desc.attachment.url}
                                                                                                className="w-full h-full object-cover rounded border border-gray-200"
                                                                                                controls
                                                                                            />
                                                                                        ) : (
                                                                                            <a
                                                                                                href={desc.attachment.url}
                                                                                                target="_blank"
                                                                                                rel="noopener noreferrer"
                                                                                                className="flex items-center justify-center w-full h-full bg-gray-100 rounded border border-gray-200 hover:border-blue-400 transition-colors"
                                                                                            >
                                                                                                <div className="text-center">
                                                                                                    <svg
                                                                                                        className="w-6 h-6 mx-auto text-red-500"
                                                                                                        fill="currentColor"
                                                                                                        viewBox="0 0 20 20"
                                                                                                    >
                                                                                                        <path
                                                                                                            fillRule="evenodd"
                                                                                                            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                                                                                                            clipRule="evenodd"
                                                                                                        />
                                                                                                    </svg>
                                                                                                    <span className="text-xs text-gray-600">PDF</span>
                                                                                                </div>
                                                                                            </a>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Updates - Removed as per new layout */}

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
                                                <img
                                                    src={file.url}
                                                    alt={`Attachment ${idx + 1}`}
                                                    onClick={() => setExpandedImage(file.url)}
                                                    className="w-24 h-24 object-cover rounded-lg border border-gray-200 hover:border-blue-400 transition-colors cursor-pointer"
                                                />
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
                                    <p className="font-medium text-gray-900">{new Date(localTask.createdAt).toLocaleDateString()}</p>
                                </div>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="9 18 15 12 9 6"></polyline>
                                </svg>
                                <div>
                                    <p className="text-gray-500">Due</p>
                                    <p className="font-medium text-gray-900">{new Date(localTask.dueDate).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Image Expansion Modal */}
            {expandedImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
                    onClick={() => setExpandedImage(null)}
                >
                    <div className="relative max-w-7xl max-h-full">
                        <button
                            onClick={() => setExpandedImage(null)}
                            className="absolute -top-10 right-0 text-white hover:text-gray-300 text-2xl font-bold"
                        >
                            ×
                        </button>
                        <img
                            src={expandedImage}
                            alt="Expanded view"
                            className="max-w-full max-h-[90vh] object-contain rounded-lg"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaskViewModal;
