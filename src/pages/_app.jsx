import "@/styles/globals.css";
import axios from "axios";
import { getCookie } from "cookies-next";
import 'rsuite/dist/rsuite.min.css';

const HTTP_URI = "https://project-experthub.onrender.com/v1";
// const HTTP_URI = "http://localhost:5000/v1";

const token = getCookie("token");
axios.defaults.baseURL = HTTP_URI;
// axios.defaults.withCredentials = true;
axios.defaults.headers.common["Authorization"] = "Bearer " + token;

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
