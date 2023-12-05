
import axios from 'axios';
import React, { useState } from 'react';
import { Modal } from "rsuite"
import { useRouter } from "next/router"
import { getCookie } from "cookies-next";
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
const Reviews = ({ open, handelClick }) => {
  const [reviews, setReviews] = useState([])
  const [rating, setRating] = useState(0)
  const [body, setBody] = useState("")
  const author = getCookie("user")
  const [loading, setLoading] = useState(false)
  const { query } = useRouter()

  const sendReview = async () => {
    setLoading(true)
    try {
      const { data } = await axios.post("/auth/review", {
        body,
        rating,
        userId: query?.page,
        author: author
      })
      // console.log(data.message)
      toast(data.message)
      setLoading(false)
      handelClick()
    } catch (e) {
      console.log(e)
      setLoading(false)
    }
  }

  return (
    <div>
      <Modal open={open} size="md" onClose={handelClick}>
        <Modal.Header>
          {/* <div className="border-b border-gray-200 p-3 w-full flex justify-between"> */}
          <Modal.Title>Rating and Reviews</Modal.Title>
          {/* </div> */}
        </Modal.Header>
        <Modal.Body>
          <div className='my-10'>
            <div className='w-full'>
              <textarea value={body} onChange={e => setBody(e.target.value)} className='p-2 border rounded-md w-full h-20'></textarea>
              <div className="flex my-2 justify-center cursor-pointer">
                <div onClick={() => setRating(1)} className="mx-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill={rating >= 1 ? "#C98821" : "#D9D9D9"}
                    className="bi bi-star-fill"
                    viewBox="0 0 16 16"
                  >
                    <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
                  </svg>
                </div>
                <div onClick={() => setRating(2)} className="mx-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill={rating >= 2 ? "#C98821" : "#D9D9D9"}
                    className="bi bi-star-fill"
                    viewBox="0 0 16 16"
                  >
                    <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
                  </svg>
                </div>
                <div onClick={() => setRating(3)} className="mx-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill={rating >= 3 ? "#C98821" : "#D9D9D9"}
                    className="bi bi-star-fill"
                    viewBox="0 0 16 16"
                  >
                    <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
                  </svg>
                </div>
                <div onClick={() => setRating(4)} className="mx-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill={rating >= 4 ? "#C98821" : "#D9D9D9"}
                    className="bi bi-star-fill"
                    viewBox="0 0 16 16"
                  >
                    <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
                  </svg>
                </div>
                <div onClick={() => setRating(5)} className="mx-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill={rating >= 5 ? "#C98821" : "#D9D9D9"}
                    className="bi bi-star-fill"
                    viewBox="0 0 16 16"
                  >
                    <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
                  </svg>
                </div>
              </div>
              <button onClick={() => sendReview()} className='p-2 w-44 text-center rounded-md bg-warning text-white'>{loading ? "loading..." : "Submit"}</button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
      <ToastContainer />

    </div>
  );
};

export default Reviews;