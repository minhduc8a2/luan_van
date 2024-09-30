// src/hooks/useErrorHandler.js
import { setNotificationPopup } from "@/Store/notificationPopupSlice";
import { useDispatch } from "react-redux";
// Adjust based on your Redux setup

const useErrorHandler = () => {
    const dispatch = useDispatch();

    return (error) => {
        if (error.response) {
            // const status = error.response.status;
            const message = error.response.data.message || "An error occurred.";

            dispatch(
                setNotificationPopup({
                    type: "error",
                    messages: [message],
                })
            );
        } else if (error.request) {
            dispatch(
                setNotificationPopup({
                    type: "error",
                    messages: [
                        "No response from the server. Please try again later.",
                    ],
                })
            );
        } else {
            dispatch(
                setNotificationPopup({
                    type: "error",
                    messages: ["Request setup failed. Please try again."],
                })
            );
        }
    };
};

export default useErrorHandler;
