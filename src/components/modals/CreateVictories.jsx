import React from "react"
import { Modal } from "rsuite"
import { useState, useRef, useEffect } from "react"
import axios from "axios"
import { useRouter } from "next/router"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

const CreateVictories = ({ open, handelClick, victory }) => {
	const [loading, setLoading] = useState(false)
	const [body, setBody] = useState(victory?.body || "Congratulations to all who supported our petition ‘’ to achieve its campaign goal and getting a massive victory. Our petition has just won. Let’s keep making the change that we need.")
	const { query } = useRouter()

	const handelSubmit = async () => {
		setLoading(true)
		try {
			const { data } = await axios.post("/victory", {
				orgId: query.page,
				body: body,
				assets: [{
					type: "image",
					url: "https://media.tenor.com/AyG5njrbcGIAAAAM/animated-cute.gif"
				}],
			},
			)
			console.log(data)
			setLoading(false)
			toast("Victory Created Successfully!")
			handelClick()
		} catch (err) {
			console.log(err)
			setLoading(false)
		}
	}
	const handelUpdate = async () => {
		setLoading(true)
		try {
			const { data } = await axios.patch("/victory/prof/edit", {
				orgId: query.page,
				victoryId: victory._id,
				body: body,
				assets: [{
					type: "image",
					url: "https://media.tenor.com/AyG5njrbcGIAAAAM/animated-cute.gif"
				}],
			},
			)
			console.log(data)
			setLoading(false)
			toast("Victory Edited Successfully!")
			handelClick()
		} catch (err) {
			console.log(err)
			setLoading(false)
		}
	}
	return (
		<>
			<Modal open={open} onClose={handelClick}>
				<Modal.Header>
					<div className="border-b border-gray-200 p-3 w-full">
						{
							victory === null ? <Modal.Title>Celebrate Victory</Modal.Title> : <Modal.Title>Edit Victory</Modal.Title>
						}
					</div>
				</Modal.Header>
				<Modal.Body>
					<textarea
						value={body}
						onChange={(e) => setBody(e.target.value)}
						name=""
						className="w-full h-32 border border-white text-sm"
						placeholder="Let your supporters congratulate you on this Victory..."
					></textarea>
				</Modal.Body>

				<Modal.Footer>
					<div className="flex justify-between text-gray-500">
						{victory === null ? (
							<button onClick={handelSubmit} className="p-1 bg-warning text-white rounded-sm w-40">
								{loading ? "Loading..." : "Celebrate Victory"}
							</button>
						) : (
							<button onClick={handelUpdate} className="p-1 bg-warning text-white rounded-sm w-40">
								{loading ? "Loading..." : "Edit Victory"}
							</button>
						)}
					</div>
				</Modal.Footer>
			</Modal>
			<ToastContainer />
		</>
	)
}

export default CreateVictories
