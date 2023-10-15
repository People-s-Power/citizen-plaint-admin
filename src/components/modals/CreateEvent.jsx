/* eslint-disable react/react-in-jsx-scope */
import { Loader, Modal, Popover, Whisper } from "rsuite"
import { useState, useRef, useEffect } from "react"
import axios from "axios"
import Select from "react-select"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { useRouter } from "next/router"

const CreateEvent = ({ open, handelClick, event }) => {
	const [name, setName] = useState(event?.name || "")
	const [des, setDes] = useState(event?.description || "")
	const [endDate, setEndDate] = useState(event?.endDate || "")
	const [startDate, setStartDate] = useState(event?.startDate || "")
	const [time, setTime] = useState(event?.time || "")
	const [type, setType] = useState(event?.type || "")
	const [audience, setAudience] = useState(event?.audience || "")
	const [loading, setLoading] = useState(false)
	const uploadRef = useRef(null)
	const [previewImages, setFilePreview] = useState(event?.image || []);
	const { query } = useRouter()


	// const [countries, setCountries] = useState([])
	// const [cities, setCities] = useState([])
	// const [country, setCountry] = useState("")
	// const [city, setCity] = useState("")

	// useEffect(() => {
	// 	// Get countries
	// 	// getUsers()
	// 	axios
	// 		.get(window.location.origin + "/api/getCountries")
	// 		.then((res) => {
	// 			const calculated = res.data.map((country: any) => ({ label: country, value: country }))
	// 			setCountries(calculated)
	// 		})
	// 		.catch((err) => console.log(err))
	// }, [])

	// useEffect(() => {
	// 	// Get countries
	// 	// getUsers()
	// 	if (country) {
	// 		axios
	// 			.get(`${window.location.origin}/api/getState?country=${country}`)
	// 			.then((res) => {
	// 				const calculated = res.data.map((state: any) => ({ label: state, value: state }))
	// 				setCities(calculated)
	// 			})
	// 			.catch((err) => console.log(err))
	// 	}
	// }, [country])

	const handleImage = (e) => {
		const files = e.target.files

		if (files && files.length <= 6) {
			const fileArray = Array.from(files);
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
	}

	const handleSubmit = async () => {
		if (name === "" || des === "" || endDate === "" || startDate === "" || time === "" || type === "" || type === "" || previewImages.length === 0) {
			toast.warn("Please fill all fields!")
			return
		}
		setLoading(true)
		try {
			const { data } = await axios.post("/event", {
				orgId: query.page,
				name: name,
				description: des,
				endDate: endDate,
				startDate: startDate,
				time: time,
				type: type,
				assets: previewImages,
				country: author.country,
				state: author.city,
				audience: ""
			},
			)
			console.log(data)
			// setBody("")
			toast.success("Event Created Successfully!")
			setLoading(false)
			setFilePreview([])
			handelClick()
		} catch (error) {
			console.log(error)
			setLoading(false)
		}
	}

	const handleEdit = async () => {
		setLoading(true)
		console.log(event)
		try {
			const { data } = await axios.patch("/event/prof/edit", {
				orgId: query.page,
				eid: event._id,
				name: name,
				description: des,
				endDate: endDate,
				startDate: startDate,
				time: time,
				type: type,
				assets: previewImages,
				country: author.country,
				state: author.city,
				// audience: audience,
			},
			)
			console.log(data)
			// setBody("")
			setLoading(false)
			toast.success("Event Edited Successfully!")
			setFilePreview([])
			handelClick()
		} catch (error) {
			console.log(error)
			setLoading(false)
		}
	}

	const handleDelSelected = (index) => {
		setFilePreview((prev) => {
			const newPreviewImages = [...prev];
			newPreviewImages.splice(index, 1);
			return newPreviewImages;
		});
	};
	return (
		<>
			<Modal open={open} onClose={handelClick}>
				<Modal.Header>
					<div className="border-b border-gray-200 p-3 w-full">
						{event === null ? <Modal.Title>Create event</Modal.Title> : <Modal.Title>Edit event</Modal.Title>}
					</div>
				</Modal.Header>
				<Modal.Body>
					<div className="bg-gray-200 w-full p-4 text-center relative cursor-pointer" onClick={() => uploadRef.current?.click()}>
						{/* {image?.type === "image" && <img onClick={() => uploadRef.current?.click()} src={image.file} width="500" className="h-52 left-0 object-cover w-full absolute top-0" />}
						{image?.type === "video" && (
							<video
								src={image.file}
								width="500"
								controls={true}
								className="embed-responsive-item absolute top-0 w-full object-cover left-0 h-52"
							>
								<source src={image.file} type="video/mp4" />
							</video>
						)} */}
						<input type="file" ref={uploadRef} multiple={true} className="hidden" onChange={handleImage} />
						<img src="/images/ant-design_camera-outlined.svg" className="w-20 h-20 mx-auto" alt="" />
						<div className="text-base my-3">Upload Event Cover Image</div>
						<div className="text-sm my-2 text-gray-800">Cover image should be minimum of 500pxl/width</div>
					</div>
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
					<div>
						<div className="text-sm my-2 mt-4">Event type</div>
						<div className="flex my-3">
							<div className="flex">
								<input onChange={() => setType("online")} type="radio" checked={type === "online"} className="p-2" />
								<div className="ml-4 text-sm my-auto">Online</div>
							</div>
							<div className="flex ml-8">
								<input onChange={() => setType("offline")} type="radio" checked={type === "offline"} className="p-2" />
								<div className="ml-4 text-sm my-auto">Offline</div>
							</div>
						</div>
					</div>
					<div className="mt-2">
						<div className="text-sm my-1">Title of Event</div>
						<input value={name} onChange={(e) => setName(e.target.value)} type="text" className="p-1 border border-gray-700 w-full rounded-sm" />
					</div>
					<div className="mt-2">
						<div className="text-sm my-1">About event</div>
						<textarea value={des} onChange={(e) => setDes(e.target.value)} className="p-1 border border-gray-700 w-full h-20 rounded-sm" />
					</div>
					<div className="flex justify-between mt-2">
						<div className="w-[45%]">
							<div className="text-sm my-1">Date</div>
							<input onChange={(e) => setStartDate(e.target.value)} type="date" className="w-full border border-gray-700 text-sm" />
						</div>
						<div className="w-[45%] text-sm">
							<div className="text-sm my-1">Time</div>
							<input type="time" onChange={(e) => setTime(e.target.value)} className="w-full border border-gray-700 text-sm" />
						</div>
					</div>
					{/* <div className="lg:flex my-2 justify-between">
						<div className="w-[45%] text-xs">
							<div className="my-1">Country</div>
							<div>
								<Select options={countries} onChange={(e: any) => setCountry(e?.value)} />
							</div>
						</div>
						<div className="w-[45%] text-xs">
							<div className="my-1">City</div>
							<div>
								<Select options={cities} onChange={(e: any) => setCity(e?.value)} />
							</div>
						</div>
					</div> */}
					<div className="flex justify-between mt-2">
						<div className="w-[45%] text-sm">
							<div className="text-sm my-1">End date</div>
							<input type="date" onChange={(e) => setEndDate(e.target.value)} className="w-full border border-gray-700 text-sm" />
						</div>
					</div>
				</Modal.Body>
				<Modal.Footer>
					{event === null ? (
						<button onClick={handleSubmit} className="p-1 bg-warning text-white rounded-md w-44 my-4">
							{loading ? <Loader /> : "Create Event"}
						</button>
					) : (
						<button onClick={handleEdit} className="p-1 bg-warning text-white rounded-md w-44 my-4">
							{loading ? <Loader /> : "Edit Event"}
						</button>
					)}
				</Modal.Footer>
			</Modal>
			<ToastContainer />
		</>
	)
}
export default CreateEvent
