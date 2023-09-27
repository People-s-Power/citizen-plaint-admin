import { NextApiRequest, NextApiResponse } from "next"
import countries from "./countries.json"

export default async function handler(_req, res) {
  try {
    return res.json(countries.map((country) => country.country))
  } catch (error) {
    console.log(error)
    return res.json({
      success: false,
    })
  }
}