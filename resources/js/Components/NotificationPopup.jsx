import { setNotificationPopup } from "@/Store/notificationPopupSlice";
import { useDispatch, useSelector } from "react-redux";
import CustomedDialog from "./CustomedDialog";

export default function NotificationPopup() {
    const { type, messages, title } = useSelector(
        (state) => state.notificationPopup
    );
    const dispatch = useDispatch();
    let color;
    switch (type) {
        case "error":
            color = "text-danger-400";
            break;
        case "success":
            color = "text-blue-400";
            break;
        default:
            color = "";
            break;
    }
    return (
        <CustomedDialog
            isOpen={!!type}
            onClose={() => dispatch(setNotificationPopup(null))}
        >
            <CustomedDialog.Title>
                {title ? title : "Notifications"}
            </CustomedDialog.Title>
            <ul className="gap-y-2 flex  flex-col">
                {messages.map((message, index) => (
                    <li className={`${color} text-lg`} key={index}>
                        {message}
                    </li>
                ))}
            </ul>
            <CustomedDialog.CloseButton />
        </CustomedDialog>
    );
}
