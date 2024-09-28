import axios from "axios";
window.axios = axios;

window.axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";

/**
 * Echo exposes an expressive API for subscribing to channels and listening
 * for events that are broadcast by Laravel. Echo and event broadcasting
 * allow your team to quickly build robust real-time web applications.
 */

import "./echo";
// if ("serviceWorker" in navigator) {
//     window.addEventListener("load", () => {
//         navigator.serviceWorker
//             .register("/serviceWorker.js", { scope: "/" })
//             .then((registration) => {
//                 console.log(
//                     "Service Worker registered with scope:",
//                     registration.scope
//                 );
//             })
//             .catch((error) => {
//                 console.error("Service Worker registration failed:", error);
//             });
//     });
// }
