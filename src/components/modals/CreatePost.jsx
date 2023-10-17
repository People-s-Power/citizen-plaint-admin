/* eslint-disable react/react-in-jsx-scope */
import { Modal, Popover, Whisper } from "rsuite"
import { useState, useRef, useEffect } from "react"
import { Dropdown } from "rsuite"
import axios from "axios"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { useRouter } from "next/router"
const CreatePost = ({
	open,
	handelClick,
	post,
}) => {
	const [filesPreview, setFilePreview] = useState(post?.asset || [])
	const [loading, setLoading] = useState(false)
	const [body, setBody] = useState(post?.body || "")
	const uploadRef = useRef(null)
	const [category, setCategory] = useState("Add Category")
	const { query } = useRouter()

	const handleImage = (e) => {
		const files = e.target.files
		const reader = new FileReader()

		if (files && files.length > 0) {
			reader.readAsDataURL(files[0])
			reader.onloadend = () => {
				if (reader.result) {
					const type = files[0].name.substr(files[0].name.length - 3)
					setFilePreview([...filesPreview, {
						url: reader.result,
						type: type === "mp4" ? "video" : "image"
					}])
				}
			}
		}
	}

	const clearFile = (index) => {
		const array = filesPreview
		array.splice(index, 1)
		setFilePreview(array)
	}

	const handleSubmit = async () => {
		if (category === "Add Category") return
		if (body === "" || category === "") {
			toast.warn("Please fill all fields!")
			return
		}
		setLoading(true)
		try {
			const { data } = await axios.post("/post", {
				orgId: query.page,
				body: body,
				assets: filesPreview,
				categories: [category],
			},
			)
			console.log(data)
			handelClick()
			setBody("")
			setFilePreview([])
			setLoading(false)
			toast("Post Created Successfully!")
		} catch (error) {
			console.log(error)
			setLoading(false)
		}
	}

	const handleUpdate = async () => {
		setLoading(true)
		try {
			const { data } = await axios.patch("/post/prof/edit", {
				orgId: query.page,
				body: body,
				postId: post._id,
				assets: filesPreview,
				categories: [category],
			},
			)
			console.log(data)
			handelClick()
			setBody("")
			setLoading(false)
			toast("Post Updated Successfully!")
		} catch (error) {
			console.log(error)
			setLoading(false)
		}
	}

	return (
		<>
			<Modal open={open} onClose={handelClick}>
				<Modal.Header>
					<div className="border-b border-gray-200 w-full pb-2 flex justify-between">
						{post === null ? (
							<button onClick={handleSubmit} className="p-1 h-8 my-auto bg-warning text-white rounded-sm w-20">
								{loading ? "Loading..." : "Post"}
							</button>
						) : (
							<button onClick={handleUpdate} className="p-1 h-8 my-auto bg-warning text-white rounded-sm w-20">
								{loading ? "Loading..." : "Update"}
							</button>
						)}
					</div>
				</Modal.Header>
				<Modal.Body>
					<textarea
						value={body}
						onChange={(e) => setBody(e.target.value)}
						name=""
						className="w-full h-32 border border-white text-sm"
						placeholder="Start your complaint..."
					></textarea>
				</Modal.Body>
				<div className="z-40">
					<Dropdown placement="topStart" title={<div className="text-sm text-warning">{category}</div>}>
						<Dropdown.Item onClick={() => setCategory("Human right awareness")}>Human right awareness</Dropdown.Item>
						<Dropdown.Item onClick={() => setCategory("Social Policy")}>Social Policy</Dropdown.Item>
						<Dropdown.Item onClick={() => setCategory("Criminal Justice")}>Criminal Justice</Dropdown.Item>
						<Dropdown.Item onClick={() => setCategory("Human Right Action")}>Human Right Action</Dropdown.Item>
						<Dropdown.Item onClick={() => setCategory("Development")}>Development</Dropdown.Item>
						<Dropdown.Item onClick={() => setCategory("Environment")}>Environment</Dropdown.Item>
						<Dropdown.Item onClick={() => setCategory("Health")}>Health</Dropdown.Item>
						<Dropdown.Item onClick={() => setCategory("Politics")}>Politics</Dropdown.Item>
						<Dropdown.Item onClick={() => setCategory("Disability")}>Disability</Dropdown.Item>
						<Dropdown.Item onClick={() => setCategory("Equality")}>Equality</Dropdown.Item>
					</Dropdown>
				</div>
				<Modal.Footer>
					<input type="file" ref={uploadRef} className="hidden" onChange={handleImage} />
					<div className="flex my-4">
						{filesPreview.map((image, index) => (
							image.type === 'image' ?
								<div className="w-[100px] h-[100px] m-[3px]" key={index}>
									<img
										src={image.url}
										alt={`Preview ${index}`}
										className=" object-cover w-full h-full"
									/>
									<div
										className="flex  cursor-pointer text-[red] justify-center items-center"
										onClick={() => clearFile(index)}
									>
										Delete
									</div>
								</div>
								: <div className="w-[100px] h-[100px] m-[3px]" key={index}>
									<video
										src={image.url}
										width="500"
										autoPlay muted
										className="embed-responsive-item w-full object-cover h-full"
									>
										<source src={image.file} type="video/mp4" />
									</video>
									<div
										className="flex  cursor-pointer text-[red] justify-center items-center"
										onClick={() => clearFile(index)}
									>
										Delete
									</div>
								</div>
						))}
					</div>

					<div className="flex sm:flex-wrap justify-between text-gray-500">
						<div className="w-10 flex justify-between my-auto">
							<div onClick={() => uploadRef.current?.click()} className="cursor-pointer">
								<img className="w-4 h-4 my-auto" src="/images/ic_outline-photo-camera.svg" alt="" />
							</div>
							<div onClick={() => uploadRef.current?.click()} className="cursor-pointer">
								<img className="w-4 h-4 my-auto" src="/images/charm_camera-video.svg" alt="" />
							</div>
						</div>
					</div>
				</Modal.Footer>
			</Modal>
			<ToastContainer />
		</>
	)
}
export default CreatePost
