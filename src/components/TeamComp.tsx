/* eslint-disable react/no-unescaped-entities */
import React, { useState, useEffect } from "react"
import axios from "axios"
import router, { useRouter } from "next/router"
import { SERVER_URL } from "../pages/_app"
import { Tooltip } from "rsuite"
import { Modal } from "rsuite"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { useAtom } from "jotai"
import { adminAtom } from "@/atoms/adminAtom"
import Link from "next/link"
import Reviews from "@/components/modals/Reviews"
import AccessSelectionModal from "@/components/modals/AccessSelectionModal"

export interface Operator {
    userId: string
    role: string
}

const TeamComp = () => {
    const [author] = useAtom(adminAtom)
    const [admins, setAdmins] = useState<any[]>([])
    const { query } = useRouter()
    const [role, setRole] = useState("")
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const [userId, setUserId] = useState<any>("")
    const [review, setReview] = useState(false)
    const [orgs, setOrgs] = useState<any[]>([])
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [showAccessModal, setShowAccessModal] = useState(false)
    const [selectedUser, setSelectedUser] = useState<any>(null)
    const [accessLoading, setAccessLoading] = useState(false)
    const [ratingLoading, setRatingLoading] = useState<string | null>(null)

    const ratingDescriptions: Record<number, string> = {
        1: 'Bad',
        2: 'Good',
        3: 'Very Good',
        4: 'Excellent',
        5: 'Outstanding',
    }

    const submitStarRating = async (adminId: string, star: number) => {
        if (ratingLoading) return
        try {
            setRatingLoading(adminId)
            await axios.post("/auth/review", {
                body: ratingDescriptions[star],
                rating: star,
                userId: adminId,
                author: query?.page,
            })
            toast.success(`Rated ${star} star${star > 1 ? 's' : ''} — ${ratingDescriptions[star]}`)
            // Update local rating
            setAdmins((prev) =>
                prev.map((a) =>
                    (a._id || a.id) === adminId ? { ...a, rating: star } : a
                )
            )
        } catch (error) {
            console.error(error)
            toast.error("Failed to submit rating")
        } finally {
            setRatingLoading(null)
        }
    }

    const getAdmins = async (orgId: string) => {
        try {
            const res = await axios(`/organization/${orgId}/operators`)
            console.log(res.data)
            setAdmins(res.data as any)
        } catch (error) {
            console.log(error)
        }
    }


    useEffect(() => {
        const fetchOrgs = async () => {
            try {
                const authorId = String(author?.id ?? "")
                if (!authorId) return
                const { data } = await axios.get(`${SERVER_URL}/api/v5/organization/user/${authorId}`)
                console.log(data)
                setOrgs(data)
            } catch (err) {
                // console.log(err)
            }
        }
        fetchOrgs()
    }, [author])


    const updateAdmin = async () => {
        try {
            setLoading(true)
            const { data } = await axios.put(`${SERVER_URL}/api/v5/organization/operators/role`, {
                userId: userId,
                role: role,
                orgId: query.page,
            })
            setLoading(false)
            console.log(data)
            toast.success("Admin role updated ")
            setOpen(false)
            location.reload()
        } catch (error) {
            toast.warn("Oops an error occoured")
        } finally {
            setLoading(false)
        }
    }

    const removeAdmin = async (sing: any) => {
        // console.log(sing)
        try {
            setLoading(true)
            const { data } = await axios.delete(`${SERVER_URL}/api/v5/organization/operators/${sing}`, {
                data: { orgId: query.page },
            })
            console.log(data)
            setLoading(false)
            getAdmins(query.page as string)
            toast.success("Admin Deleted Successfully!")
            setAdmins((prev) => prev.filter((u) => u.id != sing))
        } catch (error) {
            toast.warn("Oops an error occoured")
        }
    }

    const handleEditAccessSubmit = async (selectedAccess: string[]) => {
        if (!selectedUser) return;

        try {
            setAccessLoading(true)
            const response = await axios.put(`${SERVER_URL}/api/v5/organization/operators/access`, {
                operatorId: selectedUser._id || selectedUser.id,
                orgId: query.page,
                access: selectedAccess
            })

            if (response.data) {
                toast.success("Access permissions updated successfully!")
                setShowAccessModal(false)
                setSelectedUser(null)
                getAdmins(query.page as string)
            }
        } catch (error) {
            console.error('Error updating access:', error)
            toast.error("Failed to update access permissions")
        } finally {
            setAccessLoading(false)
        }
    }

    useEffect(() => {
        const orgId =
            typeof query.page === "string"
                ? query.page
                : Array.isArray(query.page)
                    ? query.page[0]
                    : author?.id as string
        if (orgId) getAdmins(orgId)
    }, [query])

    useEffect(() => {
        if (!dropdownOpen) return;
        function handleClick(e: MouseEvent) {
            const sidebar = document.querySelector('.sidebar');
            if (sidebar && !sidebar.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => {
            document.removeEventListener('mousedown', handleClick);
        };
    }, [dropdownOpen]);

    const adminTooltip = <Tooltip>This person makes, edits, create and promote, posts, petitons, events, update, organization and profile.</Tooltip>
    const editorTooltip = <Tooltip>This person edits posts, petitons, events, update and products.</Tooltip>

    return (
        <>
            <div className="flex gap-3">
                {/* <div className="sidebar text-base bg-[#f8fbfa] h-fit rounded-md p-3 max-w-xs w-full"> */}
                {/* <div className="relative">
                        <button
                            className="flex items-center p-2 border rounded-md hover:bg-gray-50"
                            onClick={() => setDropdownOpen((open) => !open)}
                            type="button"
                        >
                            <img
                                className="w-8 h-8 rounded-full mr-2"
                                src={orgs.find(org => org._id === query.page)?.image || '/images/logo.svg'}
                                alt=""
                            />
                            <span>{orgs.find(org => org._id === query.page)?.name || 'Select Organization'}</span>
                            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        {dropdownOpen && (
                            <div className="absolute left-0 mt-2 w-64 bg-white border rounded-md shadow-lg z-50">
                                {orgs.map((org, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center p-3 hover:bg-gray-50 cursor-pointer"
                                        onClick={() => {
                                            setDropdownOpen(false);
                                            router.push(`/manageadmins?page=${org._id}`);
                                        }}
                                    >
                                        {org?.image ? (
                                            <img className="w-8 h-8 rounded-full" src={org.image} alt="" />
                                        ) : (
                                            <img className="w-8 h-8 opacity-20" src="/images/logo.svg" alt="" />
                                        )}
                                        <p className="pl-2 text-sm">{org?.name}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div> */}
                {/* <ul className="pl-0 pt-2 flex flex-col gap-2 text-sm">
                            <li>
                                <Link href={`/manageadmins?page=${query.page}`}>
                                    <button className="bg-transparent text-warning text-sm">Admins</button>
                                </Link>
                            </li>
                        </ul> */}
                {/* </div> */}

                <main className="grow">
                    <section className="top flex justify-between">
                        <div>
                            {/* <Link href={`/addadmin?page=${query.page}`}>
                                <h3 className="text-lg font-semibold cursor-pointer">+ Add Admins</h3>
                            </Link> */}
                            {/* <p>View all admins</p> */}
                        </div>
                        <div className="flex gap-2 h-fit">
                            {/* <Link href={`/addadmin?page=${query.page}`}>
                                    <button className="bg-warning text-white rounded px-4 py-1.5 h-auto">Add admins</button>
                                </Link> */}
                            <Link href={`/professional/addprofessional?page=${query.page}`}>
                                <button className="bg-warning text-white rounded px-4 py-1.5 h-auto">Hire a Virtual Assistant</button>
                            </Link>
                        </div>
                    </section>

                    {admins?.length ? (
                        <table className="table-auto my-3 w-full border !border-spacing-1 !border-slate-600">
                            <thead>
                                <tr className="!bg-gray-100">
                                    <th className="border px-1 pl-2 py-1 border-slate-600 font-semibold">Name</th>
                                    <th className="border px-1 pl-2 py-1 border-slate-600 font-semibold">Status</th>
                                    <th className="border px-1 pl-2 py-1 border-slate-600 font-semibold">Role</th>
                                    <th className="border px-1 pl-2 py-1 border-slate-600 font-semibold">Edit </th>
                                    {/* <th className="border px-1 pl-2 py-1 border-slate-600 font-semibold">Edit Access</th> */}
                                    <th className="border px-1 pl-2 py-1 border-slate-600 font-semibold">Rating</th>
                                    <th className="border px-1 pl-2 py-1 border-slate-600 font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {admins && admins.length > 0 ? (
                                    admins.map((org) => (
                                        <tr key={org.id || org._id}>
                                            <td className="border px-1 pl-2 py-1 border-slate-600">
                                                <div className="flex gap-1 items-center">
                                                    <img src={org.image} className="w-12 rounded-full h-12 " alt="" />
                                                    <p>
                                                        {org?.firstName} {org.lastName}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="border px-1 pl-2 py-1 border-slate-600">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${org?.status?.toLowerCase() === 'accepted'
                                                    ? 'bg-green-100 text-green-800'
                                                    : org?.status?.toLowerCase() === 'pending'
                                                        ? 'bg-red-100 text-red-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {org?.status}
                                                </span>
                                            </td>
                                            <td className="border px-1 pl-2 py-1 border-slate-600">
                                                {org?.orgRole}
                                                {/* {org?.role === "admin" ? (
                                                    <Whisper placement="bottom" controlId="control-id-hover" trigger="hover" speaker={adminTooltip}>
                                                        <button>{org?.role} &#x1F6C8;</button>
                                                    </Whisper>
                                                ) : (
                                                    <Whisper placement="bottom" controlId="control-id-hover" trigger="hover" speaker={editorTooltip}>
                                                        <button>{org?.role} &#x1F6C8;</button>
                                                    </Whisper>
                                                )} */}
                                            </td>
                                            <td className="border px-1 pl-2 py-1 border-slate-600">
                                                <button
                                                    onClick={() => {
                                                        setOpen(!open), setRole(org.role), setUserId(org?._id || org.id)
                                                    }}
                                                    className="bg-transparent w-20 p-2"
                                                >
                                                    <span>&#x270E;</span> Edit Role
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedUser(org)
                                                        setShowAccessModal(true)
                                                    }}
                                                    className="bg-transparent w-20 p-2 hover:bg-gray-100"
                                                >
                                                    <span>&#x1F512;</span> Edit Access
                                                </button>
                                            </td>
                                            {/* <td className="border px-1 pl-2 py-1 border-slate-600">
                                                
                                            </td> */}
                                            <td className="border px-1 pl-2 py-1 border-slate-600">
                                                <div className={`flex items-center gap-1 ${ratingLoading === (org._id || org.id) ? 'opacity-50 pointer-events-none' : ''}`}>
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <svg
                                                            key={star}
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            width="18"
                                                            height="18"
                                                            fill={org.rating >= star ? "#C98821" : "#D9D9D9"}
                                                            viewBox="0 0 16 16"
                                                            className="cursor-pointer hover:scale-125 transition-transform"
                                                            onClick={() => submitStarRating(org._id || org.id, star)}
                                                        >
                                                            <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
                                                        </svg>
                                                    ))}
                                                </div>
                                            </td>
                                            <td
                                                className="border px-1 pl-2 py-1 border-slate-600 cursor-pointer"
                                                onClick={() => {
                                                    removeAdmin(org.id || org._id)
                                                }}
                                            >
                                                &#10006;
                                            </td>
                                        </tr>
                                    ))) : (
                                    <tr>
                                        <td colSpan={6} className="text-center py-4">
                                            No Admins yet
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    ) : (
                        <>
                            <div className="text-center text-sm my-20">No Admins yet</div>
                        </>
                    )}
                </main>
            </div>
            <ToastContainer />
            <Modal open={open} onClose={() => setOpen(!open)}>
                <div>
                    <div className="p-4">Update Admin role</div>
                    <div>
                        <div>
                            <div className="flex my-1">
                                <div className="my-auto mx-3">
                                    <input
                                        type="checkbox"
                                        className="p-4"
                                        value="admin"
                                        checked={role === "admin"}
                                        onChange={() => {
                                            setRole("admin")
                                        }}
                                    />
                                </div>
                                <div className="my-auto">
                                    <div className="text-lg font-bold">Admin</div>
                                    {/* <p>Event coverage, Writing and posting of campaigns, Editing of profile and campaigns, Promote campaigns, create an organization, Make update.	</p> */}
                                </div>
                            </div>
                            <div className="flex my-1">
                                <div className="my-auto mx-3">
                                    <input
                                        type="checkbox"
                                        className="p-4"
                                        value="editor"
                                        checked={role === "editor"}
                                        onChange={() => {
                                            setRole("editor")
                                        }}
                                    />
                                </div>
                                <div className="my-auto">
                                    <div className="text-lg font-bold">Editor</div>
                                    {/* <p>Edit profile, Edit campaigns and designs</p> */}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <Modal.Footer>
                    <button className="p-2 bg-transparent w-40" onClick={() => setOpen(!open)}>
                        Cancel
                    </button>
                    <button className="p-2 bg-warning w-40 text-white" onClick={() => updateAdmin()}>
                        Update
                    </button>
                </Modal.Footer>
            </Modal>

            <Reviews open={review} handelClick={() => setReview(false)} />

            <AccessSelectionModal
                open={showAccessModal}
                onClose={() => {
                    setShowAccessModal(false)
                    setSelectedUser(null)
                }}
                onSubmit={handleEditAccessSubmit}
                professionalName={selectedUser ? `${selectedUser.firstName} ${selectedUser.lastName}` : ''}
                loading={accessLoading}
                initialAccess={selectedUser?.access || []}
                isEditMode={true}
            />
        </>
    )
}

export default TeamComp