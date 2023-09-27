import { NextApiRequest, NextApiResponse } from "next"
import countries from "./countries.json"

export default async function handler(req, res) {
  try {
    const filtered = countries.filter((country) => country.country === req.query.country)
    if (filtered.length === 0) return res.status(400).json({ message: "No record" })
    return res.json(filtered[0].cities)
  } catch (error) {
    console.log(error)
    return res.json({
      success: false,
    })
  }
}