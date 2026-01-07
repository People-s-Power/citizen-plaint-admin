import { NYLAS_API_KEY, NYLAS_API_URI } from "@/utils/constants"
import Nylas from "nylas"

const nylasClient = new Nylas({
  apiKey: NYLAS_API_KEY,
  apiUri: NYLAS_API_URI,
})

export const nylas = nylasClient
export default nylasClient