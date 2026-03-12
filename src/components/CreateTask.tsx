/* eslint-disable react/react-in-jsx-scope */
import { Modal } from "rsuite"
import { useState, useRef, useEffect } from "react"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import axios from "axios"
import router, { useRouter } from "next/router"
import Select from "react-select"
import Link from "next/link"

// --- GraphQL Queries ---
const NEW_TASK = `
  mutation CreateTask($createTaskInput: CreateTaskInput!) {
    createTask(createTaskInput: $createTaskInput) {
      _id
      name
      dueDate
      dueTime
      instruction
      images
      asset {
        url
        type
      }
      subtasks {
        title
        images
        attachment {
          url
          type
        }
        description {
          title
          images
          attachment {
            url
            type
          }
          done
        }
      }
      status
      lock
      createdAt
    }
  }
`;

const UPDATE_TASK = `
  mutation updateTask($updateTaskInput: UpdateTaskInput!){
    updateTask(updateTaskInput: $updateTaskInput){
      name
      dueDate
      instruction
      dueTime
    }
  } 
`;

import { SERVER_URL } from "../utils/constants";

const NewTask = ({ open, handelClick, task, operators }: { open: boolean; handelClick: any; task: any; operators: any }) => {
    const [loading, setLoading] = useState(false)
    const [previewImages, setFilePreview] = useState([])
    const uploadRef = useRef<HTMLInputElement>(null)
    const { query } = useRouter()
    const [name, setName] = useState(task?.name || "")

    const [dueDate, setDueDate] = useState(() => {
        return task?.dueDate
            ? new Date(task.dueDate).toISOString().split('T')[0]
            : '';
    }); const [instruction, setInstruction] = useState(task?.instruction || "")
    const [dueTime, setDueTime] = useState(task?.dueTime || "")
    const [assign, setAssign] = useState(
        task?.assigne?.length ? [task.assigne[0]._id] : []
    );
    const [subtasks, setSubtasks] = useState<Array<{
        title: string;
        images: string[];
        attachment?: { url: string; type: string };
        description: Array<{ title: string; images: string[]; attachment?: { url: string; type: string } }>;
    }>>(
        task?.subtasks?.map((st: any) => ({
            title: typeof st === 'string' ? st : st.title || '',
            images: st && typeof st !== 'string' ? (Array.isArray(st.images) ? st.images : []) : [],
            attachment: st && typeof st !== 'string' && st.attachment ? st.attachment : undefined,
            description: typeof st === 'string'
                ? [{ title: '', images: [], attachment: undefined }]
                : Array.isArray(st.description)
                    ? st.description.map((desc: any) =>
                        typeof desc === 'string'
                            ? { title: desc, images: [], attachment: undefined }
                            : { title: desc.title || '', images: Array.isArray(desc.images) ? desc.images : [], attachment: desc.attachment || undefined }
                    )
                    : [{ title: st.description || '', images: [], attachment: undefined }]
        })) || [{ title: "", images: [], attachment: undefined, description: [{ title: "", images: [], attachment: undefined }] }]
    );

    const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        const reader = new FileReader()

        if (files && files.length > 0) {
            reader.readAsDataURL(files[0])
            reader.onloadend = () => {
                if (reader.result) {
                    const type = files[0].name.substr(files[0].name.length - 3)
                    setFilePreview([
                        ...previewImages,
                        {
                            url: reader.result as string,
                            type: type === "mp4" ? "video" : "image",
                        },
                    ])
                }
            }
        }
    }

    const handleDelSelected = (index) => {
        setFilePreview((prev) => {
            const newPreviewImages = [...prev]
            newPreviewImages.splice(index, 1)
            return newPreviewImages
        })
    }

    const handleSubtaskFileUpload = (e: React.ChangeEvent<HTMLInputElement>, subtaskIndex: number, descIndex: number) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        Array.from(files).forEach((file) => {
            const reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onloadend = () => {
                if (reader.result) {
                    const ext = file.name.split('.').pop()?.toLowerCase() || ''
                    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'svg', 'bmp'].includes(ext)
                    const fileType = ext === "mp4" ? "video" : ext === "pdf" ? "pdf" : "image"
                    setSubtasks((prev) =>
                        prev.map((st, i) => {
                            if (i === subtaskIndex) {
                                return {
                                    ...st,
                                    description: st.description.map((desc, dIdx) => {
                                        if (dIdx === descIndex) {
                                            if (isImage) {
                                                return { ...desc, images: [...desc.images, reader.result as string] }
                                            } else {
                                                return { ...desc, attachment: { url: reader.result as string, type: fileType } }
                                            }
                                        }
                                        return desc
                                    })
                                }
                            }
                            return st
                        })
                    )
                }
            }
        })
    }

    const handleDeleteDescImage = (subtaskIndex: number, descIndex: number, imgIndex: number) => {
        setSubtasks((prev) =>
            prev.map((st, i) => {
                if (i === subtaskIndex) {
                    return {
                        ...st,
                        description: st.description.map((desc, dIdx) => {
                            if (dIdx === descIndex) {
                                return { ...desc, images: desc.images.filter((_, aIdx) => aIdx !== imgIndex) }
                            }
                            return desc
                        })
                    }
                }
                return st
            })
        )
    }

    const handleDeleteDescAttachment = (subtaskIndex: number, descIndex: number) => {
        setSubtasks((prev) =>
            prev.map((st, i) => {
                if (i === subtaskIndex) {
                    return {
                        ...st,
                        description: st.description.map((desc, dIdx) => {
                            if (dIdx === descIndex) {
                                return { ...desc, attachment: undefined }
                            }
                            return desc
                        })
                    }
                }
                return st
            })
        )
    }

    const handleSubmit = async () => {
        setLoading(true)
        try {
            const formattedSubtasks = subtasks.map(st => ({
                title: st.title,
                images: st.images,
                attachment: st.attachment || undefined,
                description: st.description.map(d => ({
                    title: d.title,
                    images: d.images,
                    attachment: d.attachment || undefined,
                })),
            }))
            const { data } = await axios.post(SERVER_URL + "/graphql", {
                query: NEW_TASK,
                variables: {
                    createTaskInput: {
                        name,
                        dueDate,
                        images: previewImages.filter(p => p.type === 'image').map(p => p.url),
                        asset: previewImages.find(p => p.type !== 'image') || undefined,
                        instruction,
                        dueTime,
                        author: query.page,
                        assigne: assign,
                        subtasks: formattedSubtasks,
                    },
                },
            })
            handelClick()
            setLoading(false)
            toast.success("Task created successfully")
            // window.location.reload()
        } catch (error) {
            console.log(error)
            toast.error(error?.response.data.message)
            setLoading(false)
        }
    }

    const handleUpdate = async () => {
        setLoading(true)
        try {
            const { data } = await axios.post(SERVER_URL + "/graphql", {
                query: UPDATE_TASK,
                variables: {
                    updateTaskInput: {
                        name,
                        dueDate,
                        assets: previewImages,
                        instruction,
                        dueTime,
                        author: query.page,
                        assigne: assign,
                        id: task._id,
                        subtasks
                    },
                },
            })
            console.log(data)
            handelClick()
            setLoading(false)
            window.location.reload()
            toast.success("Task updated successfully")
        } catch (error) {
            console.log(error)
            toast.error(error?.response.data.message)
            setLoading(false)
        }
    }

    const handleSubtaskLevelUpload = (e: React.ChangeEvent<HTMLInputElement>, subtaskIndex: number) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        Array.from(files).forEach((file) => {
            const reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onloadend = () => {
                if (reader.result) {
                    const ext = file.name.split('.').pop()?.toLowerCase() || ''
                    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'svg', 'bmp'].includes(ext)
                    const fileType = ext === "mp4" ? "video" : ext === "pdf" ? "pdf" : "image"
                    setSubtasks(prev =>
                        prev.map((st, i) => {
                            if (i === subtaskIndex) {
                                if (isImage) {
                                    return { ...st, images: [...st.images, reader.result as string] }
                                } else {
                                    return { ...st, attachment: { url: reader.result as string, type: fileType } }
                                }
                            }
                            return st
                        })
                    )
                }
            }
        })
    }

    const handleDeleteSubtaskImage = (subtaskIndex: number, imgIndex: number) => {
        setSubtasks(prev =>
            prev.map((st, i) => (i === subtaskIndex ? { ...st, images: st.images.filter((_, aIdx) => aIdx !== imgIndex) } : st))
        )
    }

    const handleDeleteSubtaskAttachment = (subtaskIndex: number) => {
        setSubtasks(prev =>
            prev.map((st, i) => (i === subtaskIndex ? { ...st, attachment: undefined } : st))
        )
    }

    return (
        <>
            <Modal open={open} onClose={handelClick} size="md">
                <Modal.Header>
                    <div className="px-6 py-4 border-b border-gray-100 w-full">
                        <Modal.Title>
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                    </svg>
                                </div>
                                <span className="text-lg font-semibold text-gray-800">{task === null ? "Create New Task" : "Edit Task"}</span>
                            </div>
                        </Modal.Title>
                    </div>
                </Modal.Header>
                <Modal.Body>
                    <div className="px-2 py-1">
                        <div className="mb-5 w-full">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Task Name</label>
                            <input onChange={(e) => setName(e.target.value)} value={name} type="text" placeholder="e.g. Prepare monthly report" className="p-2.5 w-full rounded-lg border border-gray-300 bg-white text-sm focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none transition-all" />
                        </div>
                        {/* <div className="my-3 w-full">
						<label className="text-sm">Enter Instructions</label>
						<textarea onChange={e => setInstruction(e.target.value)} value={instruction} className="p-2 w-full rounded-md"></textarea>

					</div> */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tasks & Subtasks</label>

                            <div className="flex flex-col gap-4">
                                {subtasks.map((subtask, idx) => {
                                    return (
                                        <div key={idx} className="border border-gray-200 rounded-xl p-4 bg-gradient-to-br from-gray-50 to-white shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-center mb-3">
                                                <span className="text-xs font-semibold text-orange-500 bg-orange-50 px-2.5 py-1 rounded-full">Task {idx + 1}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => setSubtasks((prev) => prev.filter((_, idx1) => idx1 !== idx))}
                                                    className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                                                    title="Delete task"
                                                >
                                                    <svg
                                                        width="18"
                                                        height="18"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    >
                                                        <polyline points="3 6 5 6 21 6"></polyline>
                                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                        <line x1="10" y1="11" x2="10" y2="17"></line>
                                                        <line x1="14" y1="11" x2="14" y2="17"></line>
                                                    </svg>
                                                </button>
                                            </div>

                                            <div className="flex flex-col gap-3">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-600 mb-1">Task Description</label>

                                                    <textarea
                                                        onChange={(e) =>
                                                            setSubtasks((prev) =>
                                                                prev.map((t, i) => {
                                                                    if (i === idx) return { ...t, title: e.target.value }
                                                                    return t
                                                                })
                                                            )
                                                        }
                                                        value={subtask.title}
                                                        placeholder="Describe the task..."
                                                        rows={3}
                                                        className="p-2.5 w-full rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none transition-all resize-none"
                                                    />

                                                    {/* Task-level images & attachment */}
                                                    {(subtask.images.length > 0 || subtask.attachment) && (
                                                        <div className="flex flex-wrap items-center gap-2 mt-2">
                                                            {subtask.images.map((imgUrl, imgIdx) => (
                                                                <div key={`img-${imgIdx}`} className="relative inline-block w-12 h-12">
                                                                    <img src={imgUrl} alt="preview" className="w-full h-full object-cover rounded-lg border border-gray-200" />
                                                                    <button type="button" onClick={() => handleDeleteSubtaskImage(idx, imgIdx)} className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 shadow-sm">×</button>
                                                                </div>
                                                            ))}
                                                            {subtask.attachment && (
                                                                <div className="relative inline-block w-12 h-12">
                                                                    {subtask.attachment.type === 'video' ? (
                                                                        <video src={subtask.attachment.url} className="w-full h-full object-cover rounded-lg border border-gray-200" />
                                                                    ) : (
                                                                        <div className="w-full h-full bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center text-xs text-gray-500 font-medium">PDF</div>
                                                                    )}
                                                                    <button type="button" onClick={() => handleDeleteSubtaskAttachment(idx)} className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 shadow-sm">×</button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    <button type="button" className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors" onClick={() => {
                                                        const el = document.getElementById(`subtask-upload-${idx}`) as HTMLInputElement | null
                                                        el?.click()
                                                    }}>
                                                        <img className="w-4 h-4" src="/images/home/icons/ic_outline-photo-camera.svg" alt="" />
                                                        <span>Attach files</span>
                                                    </button>
                                                    <input id={`subtask-upload-${idx}`} type="file" accept="image/*,video/*,.pdf,.doc,.docx" multiple onClick={(e) => { (e.currentTarget as HTMLInputElement).value = ''; }} onChange={(e) => handleSubtaskLevelUpload(e, idx)} className="hidden" />

                                                </div>

                                                <div className="pl-6 border-l-2 border-orange-200 ml-2">
                                                    <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">Subtasks</label>
                                                    {subtask.description.map((desc, descIdx) => (
                                                        <div key={descIdx} className="mb-3 border border-gray-200 rounded-lg p-3 bg-white shadow-sm">
                                                            <div className="flex gap-2 mb-2">
                                                                <textarea
                                                                    onChange={(e) =>
                                                                        setSubtasks((prev) =>
                                                                            prev.map((t, i) => {
                                                                                if (i === idx) {
                                                                                    const newDescriptions = [...t.description];
                                                                                    newDescriptions[descIdx] = {
                                                                                        ...newDescriptions[descIdx],
                                                                                        title: e.target.value
                                                                                    };
                                                                                    return { ...t, description: newDescriptions };
                                                                                }
                                                                                return t;
                                                                            })
                                                                        )
                                                                    }
                                                                    value={desc.title}
                                                                    placeholder="Describe the subtask..."
                                                                    rows={2}
                                                                    className="p-2.5 w-full rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none transition-all resize-none"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        setSubtasks((prev) =>
                                                                            prev.map((t, i) => {
                                                                                if (i === idx) {
                                                                                    return {
                                                                                        ...t,
                                                                                        description: t.description.filter((_, dIdx) => dIdx !== descIdx)
                                                                                    };
                                                                                }
                                                                                return t;
                                                                            })
                                                                        )
                                                                    }
                                                                    className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg h-fit transition-colors"
                                                                    title="Delete subtask"
                                                                >
                                                                    <svg
                                                                        width="16"
                                                                        height="16"
                                                                        viewBox="0 0 24 24"
                                                                        fill="none"
                                                                        stroke="currentColor"
                                                                        strokeWidth="2"
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                    >
                                                                        <polyline points="3 6 5 6 21 6"></polyline>
                                                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                                    </svg>
                                                                </button>
                                                            </div>

                                                            {/* Files for this specific subtask */}
                                                            <div>
                                                                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors">
                                                                    <img className="w-4 h-4" src="/images/home/icons/ic_outline-photo-camera.svg" alt="" />
                                                                    <span>Attach files</span>
                                                                    <input
                                                                        type="file"
                                                                        accept="image/*,video/*,.pdf,.doc,.docx"
                                                                        multiple
                                                                        onChange={(e) => handleSubtaskFileUpload(e, idx, descIdx)}
                                                                        className="hidden"
                                                                    />
                                                                </label>

                                                                {(desc.images.length > 0 || desc.attachment) && (
                                                                    <div className="mt-2 flex flex-wrap gap-2">
                                                                        {desc.images.map((imgUrl, imgIdx) => (
                                                                            <div key={`img-${imgIdx}`} className="relative inline-block w-16 h-16">
                                                                                <img
                                                                                    src={imgUrl}
                                                                                    alt={`Image ${imgIdx + 1}`}
                                                                                    className="w-full h-full object-cover rounded-lg border border-gray-200"
                                                                                />
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => handleDeleteDescImage(idx, descIdx, imgIdx)}
                                                                                    className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 shadow-sm"
                                                                                >×</button>
                                                                            </div>
                                                                        ))}
                                                                        {desc.attachment && (
                                                                            <div className="relative inline-block w-16 h-16">
                                                                                {desc.attachment.type === "video" ? (
                                                                                    <video
                                                                                        src={desc.attachment.url}
                                                                                        className="w-full h-full object-cover rounded-lg border border-gray-200"
                                                                                    />
                                                                                ) : (
                                                                                    <div className="w-full h-full bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                                                                                        <span className="text-xs text-gray-500 font-medium">PDF</span>
                                                                                    </div>
                                                                                )}
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => handleDeleteDescAttachment(idx, descIdx)}
                                                                                    className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 shadow-sm"
                                                                                >×</button>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setSubtasks((prev) =>
                                                                prev.map((t, i) => {
                                                                    if (i === idx) {
                                                                        return { ...t, description: [...t.description, { title: "", images: [], attachment: undefined }] };
                                                                    }
                                                                    return t;
                                                                })
                                                            )
                                                        }
                                                        className="inline-flex items-center gap-1 text-xs font-medium text-orange-600 hover:text-orange-700 mt-2 px-2 py-1 rounded-md hover:bg-orange-50 transition-colors"
                                                    >
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                                        Add subtask
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                                <button
                                    type="button"
                                    className="w-full py-2.5 border-2 border-dashed border-gray-300 rounded-xl text-sm font-medium text-gray-500 hover:border-orange-400 hover:text-orange-600 hover:bg-orange-50 transition-all flex items-center justify-center gap-2"
                                    onClick={() => setSubtasks((prev) => [...prev, { title: "", images: [], attachment: undefined, description: [{ title: "", images: [], attachment: undefined }] }])}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                    Add more tasks
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 my-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Due Date</label>
                                <input onChange={(e) => setDueDate(e.target.value)} value={dueDate} type="date" className="w-full p-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none transition-all" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Due Time</label>
                                <input value={dueTime} onChange={(e) => setDueTime(e.target.value)} type="time" className="w-full p-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none transition-all" />
                            </div>
                        </div>

                        <div className="mb-4 w-full">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Assign To</label>
                            {/* <Select
              isMulti
              defaultValue={assign}
              onChange={(e: any) => { setAssign([...assign, e]) }}
              options={operators} /> */}
                            {operators.length > 0 ? (
                                <select onChange={(e) => setAssign([e.target.value])} value={assign[0]} className="w-full p-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none transition-all bg-white">
                                    <option value="" className="hidden">
                                        Select an admin
                                    </option>
                                    {operators.map((single) => (
                                        <option key={single._id} value={single._id}>
                                            {single.firstName} {single.lastName}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <Link href={`professional/addprofessional?page=${query.page}`}>
                                    <div className="w-full p-3 rounded-md bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm cursor-pointer hover:bg-yellow-100 transition-colors">
                                        <div className="flex items-center gap-2">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="12" cy="12" r="10"></circle>
                                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                            </svg>
                                            <span>Please add Admin or Hire a V.A to assign tasks</span>
                                        </div>
                                    </div>
                                </Link>
                            )}
                        </div>
                    </div>
                </Modal.Body>

                <Modal.Footer>
                    <input type="file" ref={uploadRef} multiple={true} className="d-none" onChange={handleImage} />
                    {previewImages.length > 0 && (
                        <div className="flex flex-wrap gap-2 my-4 w-full">
                            {previewImages.map((image, index) =>
                                image?.type === "image" ? (
                                    <div className="relative w-20 h-20" key={index}>
                                        <img src={image?.url} alt={`Preview ${index}`} className="object-cover w-full h-full rounded-lg border border-gray-200" />
                                        <button type="button" onClick={() => handleDelSelected(index)} className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 shadow-sm">
                                            ×
                                        </button>
                                    </div>
                                ) : (
                                    <div className="relative w-20 h-20" key={index}>
                                        <video src={image?.url} muted className="w-full h-full object-cover rounded-lg border border-gray-200">
                                            <source src={image?.url} type="video/mp4" />
                                        </video>
                                        <button type="button" onClick={() => handleDelSelected(index)} className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 shadow-sm">
                                            ×
                                        </button>
                                    </div>
                                )
                            )}
                        </div>
                    )}
                    <div className="flex justify-end pt-2 border-t border-gray-100">
                        {task === null ? (
                            <button onClick={handleSubmit} disabled={loading} className="px-6 py-2.5 bg-warning text-white rounded-lg font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2 shadow-sm">
                                {loading ? (
                                    <>
                                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        Creating...
                                    </>
                                ) : "Create Task"}
                            </button>
                        ) : (
                            <button onClick={handleUpdate} disabled={loading} className="px-6 py-2.5 bg-warning text-white rounded-lg font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2 shadow-sm">
                                {loading ? (
                                    <>
                                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        Saving...
                                    </>
                                ) : "Save Changes"}
                            </button>
                        )}
                    </div>
                </Modal.Footer>
            </Modal>
            <ToastContainer />
        </>
    )
}

export default NewTask
