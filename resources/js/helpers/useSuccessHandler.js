import { setNotificationPopup } from "@/Store/notificationPopupSlice";
import { useDispatch } from "react-redux";

const useSuccessHandler = (message) => {
    const dispatch = useDispatch();

    return (response) => {
        if (response.status < 300) {
            dispatch(
                setNotificationPopup({
                    type: "success",
                    messages: [message],
                })
            );
        }
    };
};

export default useSuccessHandler;
