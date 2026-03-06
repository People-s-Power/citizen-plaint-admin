import React, { useState, useEffect } from "react"
import { Modal } from "rsuite"

const ACCESS_OPTIONS = [
    "View Dashboard",
    "Manage Admins",
    "Manage Posts",
    "Manage Events",
    "Manage Petitions",
    "Manage Updates",
    "Manage Products",
    "View Calendar",
    "Set Availability",
    "Manage Messages",
    "View Reports",
    "Manage Subscriptions",
    "Manage Withdrawals",
]

interface AccessSelectionModalProps {
    open: boolean
    onClose: () => void
    onSubmit: (selectedAccess: string[]) => void
    professionalName: string
    loading: boolean
    initialAccess?: string[]
    isEditMode?: boolean
}

const AccessSelectionModal = ({
    open,
    onClose,
    onSubmit,
    professionalName,
    loading,
    initialAccess = [],
    isEditMode = false,
}: AccessSelectionModalProps) => {
    const [selectedAccess, setSelectedAccess] = useState<string[]>(initialAccess)

    useEffect(() => {
        if (open) {
            setSelectedAccess(initialAccess)
        }
    }, [open, initialAccess])

    const toggleAccess = (access: string) => {
        setSelectedAccess((prev) =>
            prev.includes(access)
                ? prev.filter((a) => a !== access)
                : [...prev, access]
        )
    }

    const selectAll = () => {
        if (selectedAccess.length === ACCESS_OPTIONS.length) {
            setSelectedAccess([])
        } else {
            setSelectedAccess([...ACCESS_OPTIONS])
        }
    }

    return (
        <Modal open={open} onClose={onClose} size="sm">
            <Modal.Header>
                <Modal.Title>
                    {isEditMode ? "Edit" : "Set"} Access for {professionalName}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p className="text-sm text-gray-500 mb-4">
                    Select the permissions this user should have access to.
                </p>
                <div className="mb-3">
                    <label className="flex items-center gap-2 cursor-pointer font-semibold text-sm">
                        <input
                            type="checkbox"
                            checked={selectedAccess.length === ACCESS_OPTIONS.length}
                            onChange={selectAll}
                            className="w-4 h-4"
                        />
                        Select All
                    </label>
                </div>
                <div className="flex flex-col gap-2">
                    {ACCESS_OPTIONS.map((access) => (
                        <label
                            key={access}
                            className="flex items-center gap-2 cursor-pointer text-sm hover:bg-gray-50 p-1.5 rounded"
                        >
                            <input
                                type="checkbox"
                                checked={selectedAccess.includes(access)}
                                onChange={() => toggleAccess(access)}
                                className="w-4 h-4"
                            />
                            {access}
                        </label>
                    ))}
                </div>
            </Modal.Body>
            <Modal.Footer>
                <button
                    className="p-2 bg-transparent w-32"
                    onClick={onClose}
                >
                    Cancel
                </button>
                <button
                    className="p-2 bg-warning w-32 text-white rounded"
                    onClick={() => onSubmit(selectedAccess)}
                    disabled={loading}
                >
                    {loading ? "Saving..." : isEditMode ? "Update" : "Save"}
                </button>
            </Modal.Footer>
        </Modal>
    )
}

export default AccessSelectionModal
