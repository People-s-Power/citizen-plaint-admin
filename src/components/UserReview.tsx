import React, { useState, useEffect } from "react"
import axios from "axios"

interface UserReviewProps {
    userId: string
}

const UserReview = ({ userId }: UserReviewProps) => {
    const [rating, setRating] = useState<number>(0)

    useEffect(() => {
        const fetchReview = async () => {
            try {
                const { data } = await axios.get(`/auth/review/${userId}`)
                if (data?.rating) {
                    setRating(data.rating)
                }
            } catch (error) {
                // Silently fail if no review exists
            }
        }
        if (userId) fetchReview()
    }, [userId])

    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <svg
                    key={star}
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    fill={rating >= star ? "#C98821" : "#D9D9D9"}
                    viewBox="0 0 16 16"
                >
                    <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
                </svg>
            ))}
        </div>
    )
}

export default UserReview
