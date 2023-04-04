import "@/styles/globals.css";
import axios from "axios";
import { getCookie } from "cookies-next";

const HTTP_URI = "https://shark-app-28vbj.ondigitalocean.app/v1";
const token = getCookie("token");
axios.defaults.baseURL = HTTP_URI;
// axios.defaults.withCredentials = true;
axios.defaults.headers.common["Authorization"] = "Bearer " + token;

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
