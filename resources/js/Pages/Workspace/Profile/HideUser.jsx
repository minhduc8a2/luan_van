import Button from "@/Components/Button";
import CustomedDialog from "@/Components/CustomedDialog";
import useErrorHandler from "@/helpers/useErrorHandler";
import { updateWorkspaceUserInformation } from "@/Store/workspaceUsersSlice";
import { FiBellOff } from "react-icons/fi";
import { IoSettingsOutline } from "react-icons/io5";
import { RiUserForbidLine } from "react-icons/ri";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";

export default function HideUser({ user, isOpen, onClose }) {
    const { workspaceId } = useParams();
    const dispatch = useDispatch();
    const errorHandler = useErrorHandler();

    function hideUser() {
        axios
            .post(route("users.hide", workspaceId), {
                userId: user.id,
                mode: "hide",
            })

            .then(() => {
                onClose();
                dispatch(
                    updateWorkspaceUserInformation({
                        id: user.id,
                        data: { is_hidden: true },
                    })
                );
            })
            .catch(errorHandler);
    }
    return (
        <>
            <CustomedDialog
                isOpen={isOpen}
                onClose={onClose}
                className="w-[500px]"
            >
                <CustomedDialog.Title>
                    Hide {user.displayName || user.name}?
                </CustomedDialog.Title>
                <div className="flex flex-col gap-y-4">
                    <div className="flex gap-x-6 items-center">
                        <RiUserForbidLine className="text-4xl" />
                        <p>
                            Their messages in channels will be hidden from you,
                            and you won’t be notified when they mention or DM
                            you.
                        </p>
                    </div>
                    <div className="flex  gap-x-6 items-center">
                        <IoSettingsOutline className="text-2xl" />
                        <p>You can always unhide them later.</p>
                    </div>
                    <div className="flex  gap-x-6 items-center">
                        <FiBellOff className="text-xl" />
                        <p>They won’t be notified that you’ve hidden them.</p>
                    </div>
                </div>
                <div className="flex justify-end gap-x-4 mt-8">
                    <Button onClick={onClose}>Close</Button>
                    <Button type="danger" onClick={hideUser}>
                        Hide This Person
                    </Button>
                </div>
            </CustomedDialog>
        </>
    );
}
