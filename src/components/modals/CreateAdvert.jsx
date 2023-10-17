/* eslint-disable react/react-in-jsx-scope */
import { useEffect } from "react"
import { Modal } from "rsuite"
import { useRef, useState } from "react"
import axios from "axios"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import Select from "react-select"
import { useRouter } from "next/router"

const CreateAdvert = ({ open, handelClick, advert }) => {
	const [previewImages, setFilePreview] = useState(advert?.image || []);
	const [countries, setCountries] = useState([])
	const [cities, setCities] = useState([])
	const [country, setCountry] = useState("")
	const [city, setCity] = useState("")
	const uploadRef = useRef(null)
	const [caption, setCaption] = useState(advert?.caption || "")
	const [link, setLink] = useState(advert?.link || "")
	const [duration, setDuration] = useState(advert?.duration || "")
	const [message, setMessage] = useState(advert?.message || "")
	const [email, setEmail] = useState(advert?.email || "")
	const [audience, setAudience] = useState(advert?.audience || "")
	const [action, setAction] = useState(advert?.action || "")
	const [loading, setLoading] = useState(false)
	const { query } = useRouter()

	useEffect(() => {
		// Get countries
		// getUsers()
		axios
			.get(window.location.origin + "/api/getCountries")
			.then((res) => {
				const calculated = res.data.map((country) => ({ label: country, value: country }))
				setCountries(calculated)
			})
			.catch((err) => console.log(err))
	}, [])

	useEffect(() => {
		// Get countries
		// getUsers()
		if (country) {
			axios
				.get(`${window.location.origin}/api/getState?country=${country}`)
				.then((res) => {
					const calculated = res.data.map((state) => ({ label: state, value: state }))
					setCities(calculated)
				})
				.catch((err) => console.log(err))
		}
	}, [country])

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

	const handleSubmit = async () => {
		if (message === "" || caption === "" || action === "" || link === "" || duration == "" || country === "" || city === "") {
			toast.warn("Please fill all fields!")
			return
		}
		setLoading(true)
		try {
			const { data } = await axios.post("/advert", {
				orgId: query.page,
				message: message,
				caption: caption,
				action: action,
				link: link,
				duration: duration,
				email: email,
				assets: previewImages,
				country: country,
				state: city,
				audience: "EVERYONE"
			},
			)
			toast.success("Advert Created Successfully!")
			console.log(data)
			handelClick()
			setMessage("")
			setCaption("")
			setAudience("")
			setLink("")
			setAction("")
			setEmail("")
			setDuration("")
			setLoading(true)
			setFilePreview([])
		} catch (error) {
			console.log(error.response)
			toast.warn("Oops something happened")
		}
	}
	const handleEdit = async () => {
		setLoading(true)
		try {
			const { data } = await axios.patch("/advert/prof/edit", {
				orgId: query.page,
				message: message,
				caption: caption,
				action: action,
				link: link,
				duration: duration,
				email: email,
				assets: previewImages,
				adId: advert._id,
				country: country,
				state: city
			},
			)
			toast.success("Advert Edited Successfully!")
			console.log(data)
			handelClick()
			setMessage("")
			setCaption("")
			setAudience("")
			setLink("")
			setAction("")
			setEmail("")
			setDuration("")
			setLoading(true)
			setFilePreview([])
		} catch (error) {
			console.log(error)
			toast.warn("Oops something happened")
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
						<Modal.Title>Create Product</Modal.Title>
					</div>
				</Modal.Header>
				{/* <Modal.Body> */}
				<div className="bg-gray-200 w-full p-4 text-center relative">
					<input type="file" ref={uploadRef} multiple={true} className="hidden" onChange={handleImage} />
					<img onClick={() => uploadRef.current?.click()} src="/images/ant-design_camera-outlined.svg" className="w-20 h-20 mx-auto" alt="" />
					<div className="text-base my-3">Upload Product Cover Image</div>
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
				<div className="mt-2">
					<div className="text-sm my-1">Caption</div>
					<input value={caption} type="text" onChange={(e) => setCaption(e.target.value)} className="p-1 border border-gray-700 w-full rounded-sm" />
				</div>
				<div className="mt-2">
					<div className="text-sm my-1">Message</div>
					<textarea value={message} onChange={(e) => setMessage(e.target.value)} className="p-1 border border-gray-700 w-full h-20 rounded-sm" />
				</div>
				<div className="flex justify-between mt-2">

					<div className="w-[45%] text-sm">
						<div className="text-sm my-1">Website/Email/ Phone No</div>
						<input value={link} onChange={(e) => setLink(e.target.value)} type="text" className="w-full border border-gray-700 text-sm" />
					</div>
					<div className="w-[45%] text-sm">
						<div className="text-sm my-1">Duration</div>
						<input value={duration} onChange={(e) => setDuration(e.target.value)} type="text" className="w-full border border-gray-700 text-sm" />
					</div>
				</div>
				<div className="flex justify-between mt-2">
					{/* <div className="w-[45%]">
						<div className="text-sm my-1">Phone number</div>
						<input type="number" className="w-full border border-gray-700 text-sm" />
					</div> */}
				</div>
				<div className="lg:flex my-2 justify-between">
					<div className="w-[45%] text-xs">
						<div className="my-1">Country</div>
						<div>
							{/* <input onChange={(e) => setCountry(e.target.value)} type="text" className="rounded-sm" placeholder="Nigeria" /> */}
							<Select options={countries} onChange={(e) => setCountry(e?.value)} />
						</div>
					</div>
					<div className="w-[45%] text-xs">
						<div className="my-1">City</div>
						<div>
							{/* <input onChange={(e) => setCity(e.target.value)} type="text" className="rounded-sm" placeholder="Lagis" /> */}
							<Select options={cities} onChange={(e) => setCity(e?.value)} />
						</div>
					</div>
				</div>
				<div className="flex justify-between mt-2">
					<div className="w-[45%] text-sm">
						<div className="text-sm my-1">Call to action</div>
						<select onChange={(e) => setAction(e.target.value)} name="" id="" className="w-full border border-gray-700 text-sm">
							<option value="Book now">Book now</option>
							<option value="Call us">Call us</option>
							<option value="Learn More">Learn More</option>
							<option value="Email us">Email us</option>
							<option value="Apply Now">Apply Now</option>
						</select>
					</div>

					<div className="w-[45%]">
						<div className="text-sm my-1">Email</div>
						<input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="w-full border border-gray-700 text-sm" />
					</div>
				</div>
				{/* </Modal.Body> */}
				<Modal.Footer>
					{advert === null ? (
						<button onClick={handleSubmit} className="p-1 bg-warning text-white rounded-md w-44 my-4">
							{loading ? "Loading..." : "Create Product"}
						</button>
					) : (
						<button onClick={handleEdit} className="p-1 bg-warning text-white rounded-md w-44 my-4">
							{loading ? "Loading..." : "Update Product"}
						</button>
					)}
				</Modal.Footer>
			</Modal>
			<ToastContainer />
		</>
	)
}
export default CreateAdvert
