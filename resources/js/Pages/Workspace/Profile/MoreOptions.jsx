import Button from "@/Components/Button";
import CustomedPopover from "@/Components/CustomedPopover";
import React, { useState } from "react";
import { FiMoreVertical } from "react-icons/fi";
import HideUser from "./HideUser";
import { router, usePage } from "@inertiajs/react";
import { useDispatch } from "react-redux";
import { updateWorkspaceUserInformation } from "@/Store/workspaceUsersSlice";
import { useParams } from "react-router-dom";
import useErrorHandler from "@/helpers/useErrorHandler";

export default function MoreOptions({ user }) {
    const [hideUserOpen, setHideUserOpen] = useState(false);
    const { workspaceId } = useParams();
    const dispatch = useDispatch();
    const errorHandler = useErrorHandler();

    function unhideUser() {
        axios
            .post(route("users.hide", workspaceId), {
                userId: user.id,
                mode: "unhide",
            })

            .then(() => {
                dispatch(
                    updateWorkspaceUserInformation({
                        id: user.id,
                        data: { is_hidden: false },
                    })
                );
            })
            .catch(errorHandler);
    }
    return (
        <>
            <CustomedPopover
                width="w-80"
                anchor="bottom end"
                className="mt-1 bg-foreground"
                triggerNode={
                    <Button>
                        <div className="flex items-center">
                            <FiMoreVertical className="text-lg" />
                        </div>
                    </Button>
                }
            >
                {!user.is_hidden && (
                    <CustomedPopover.ListItem
                        className="!text-danger-400 hover:!bg-danger-500 hover:!text-white"
                        onClick={() => {
                            setHideUserOpen(true);
                        }}
                    >
                        Hide {user.displayName || user.name}
                    </CustomedPopover.ListItem>
                )}
                {user.is_hidden && (
                    <CustomedPopover.ListItem className="" onClick={unhideUser}>
                        Unhide {user.displayName || user.name}
                    </CustomedPopover.ListItem>
                )}
            </CustomedPopover>
            <HideUser
                user={user}
                isOpen={hideUserOpen}
                onClose={() => setHideUserOpen(false)}
            />
        </>
    );
}
