/* eslint-disable react/react-in-jsx-scope */
import { Modal } from "rsuite"
import React, { useState, useRef, useEffect } from "react"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import axios from "axios"
import { useRouter } from "next/router"

const AddUpdates = ({ open, handelClick, petition, update }) => {
	const [loading, setLoading] = useState(false)
	const [previewImages, setFilePreview] = useState(update?.image || []);
	const { query } = useRouter()
	const [body, setBody] = useState(update?.body || "")
	const uploadRef = useRef(null)

	const handleImage = (e) => {
		const files = e.target.files
		const reader = new FileReader()

		if (files && files.length > 0) {
			reader.readAsDataURL(files[0])
			reader.onloadend = () => {
				if (reader.result) {
					const type = files[0].name.substr(files[0].name.length - 3)
					setFilePreview([...previewImages, {
						url: reader.result,
						type: type === "mp4" ? "video" : "image"
					}])
				}
			}
		}
	}

	const handleDelSelected = (index) => {
		setFilePreview((prev) => {
			const newPreviewImages = [...prev];
			newPreviewImages.splice(index, 1);
			return newPreviewImages;
		});
	};

	const handleSubmit = async () => {
		if (previewImages.length < 0 || body === "") {
			return toast.warn("Please fill all fields")
		}
		setLoading(true)
		try {
			const { data } = await axios.post("/update", {
				orgId: query.page,
				petition: petition._id,
				body: body,
				assets: previewImages,
			})
			// toast.success("Updates added successfulluy")
			setLoading(false)
			handelClick()
			toast("Updates added  Successfully!")
		} catch (err) {
			console.log(err)
			toast.warn("Oops an error occured")
			setLoading(false)
		}
	}

	const handleUpdate = async () => {
		setLoading(true)
		try {
			const { data } = await axios.patch("/update/prof/edit", {
				updateId: update._id,
				body: body,
				assets: previewImages,
				orgId: query.page,
			})
			toast.success("Updates edited successfulluy")
			setLoading(false)
			handelClick()
		} catch (err) {
			console.log(err)
			toast.warn("Oops an error occured")
			setLoading(false)
		}
	}
	return (
		<>
			<Modal open={open} onClose={handelClick}>
				<Modal.Header>
					<div className="border-b border-gray-200 p-3 w-full">
						<Modal.Title> {update === null ? "Add Update" : "Edit Update"}</Modal.Title>
					</div>
				</Modal.Header>
				<Modal.Body>
					<textarea
						value={body}
						onChange={(e) => setBody(e.target.value)}
						name=""
						className="w-full h-32 border border-white text-sm"
						placeholder="Let your supporters know about the progress of this petition ..."
					></textarea>
				</Modal.Body>

				<Modal.Footer>
					<input type="file" ref={uploadRef} multiple={true} className="d-none" onChange={handleImage} />
					{previewImages.length > 0 && (
						<div className="flex flex-wrap my-4 w-full">
							{previewImages.map((image, index) => (
								image.type === 'image' ?
									<div className="w-[100px] h-[100px] m-[3px]" key={index}>
										<img
											src={image.url}
											alt={`Preview ${index}`}
											className=" object-cover w-full h-full"
										/>
										<div
											className="flex  cursor-pointer text-[red] justify-center items-center"
											onClick={() => handleDelSelected(index)}
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
											<source src={image.url} type="video/mp4" />
										</video>
										<div
											className="flex  cursor-pointer text-[red] justify-center items-center"
											onClick={() => handleDelSelected(index)}
										>
											Delete
										</div>
									</div>
							))}
						</div>
					)}
					<div className="flex justify-between text-gray-500">
						<div className="w-24 flex justify-between my-auto">
							<div onClick={() => uploadRef.current?.click()} className="cursor-pointer">
								<img className="w-4 h-4 my-auto" src="/images/home/icons/ic_outline-photo-camera.svg" alt="" />
							</div>
							<div className="cursor-pointer">
								<img className="w-4 h-4 my-auto" src="/images/home/icons/charm_camera-video.svg" alt="" />
							</div>
							<div className="cursor-pointer">
								<img className="w-4 h-4 my-auto" src="/images/home/icons/fe_sitemap.svg" alt="" />
							</div>
							<div className="cursor-pointer">
								<img className="w-4 h-4 my-auto" src="/images/home/icons/tabler_article.svg" alt="" />
							</div>
						</div>
						{update === null ? (
							<button onClick={handleSubmit} className="p-1 bg-warning text-white rounded-sm w-40">
								{loading ? "Loading..." : "Add Update"}
							</button>
						) : (
							<button onClick={handleUpdate} className="p-1 bg-warning text-white rounded-sm w-40">
								{loading ? "Loading..." : "Edit Update"}
							</button>
						)}
					</div>
				</Modal.Footer>
			</Modal>
			<ToastContainer />
		</>
	)
}
export default AddUpdates
