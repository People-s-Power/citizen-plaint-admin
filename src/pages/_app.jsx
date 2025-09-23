import "@/styles/globals.css";
import axios from "axios";
import { getCookie } from "cookies-next";
import 'rsuite/dist/rsuite.min.css';

const HTTP_URI = "https://project-experthub.onrender.com/v1";
// const HTTP_URI = "http://localhost:5000/v1";
export const SERVER_URL = "https://people-powapi-v5-5ifxz.ondigitalocean.app";
import cookie from "js-cookie"

import TimeAgo from "javascript-time-ago"
import en from "javascript-time-ago/locale/en.json"
// Initialize time-ago locales
TimeAgo.addDefaultLocale(en)
TimeAgo.addLocale(en)


import { io } from "socket.io-client"
const org = cookie.get("org")
export const socket = io(SERVER_URL, {
  query: {
    user_id: org,
  },
})

const token = getCookie("token");
axios.defaults.baseURL = HTTP_URI;
// axios.defaults.withCredentials = true;
axios.defaults.headers.common["Authorization"] = "Bearer " + token;

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
