import Button from "@/Components/Button";
import CustomedDialog from "@/Components/CustomedDialog";
import useErrorHandler from "@/helpers/useErrorHandler";

import React, { useState } from "react";
import { useParams } from "react-router-dom";

export default function RemovePhoto({ user }) {
    const { workspaceId } = useParams();
    const [show, setShow] = useState(false);

    const errorHandler = useErrorHandler();
    function removePhoto() {
        axios
            .delete(
                route("users.deleteAvatar", {
                    workspace: workspaceId,
                    user: user.id,
                })
            )
            .then(() => {
                setShow(false);
            })
            .catch(errorHandler);
    }
    if (!user.avatar_url) return "";
    return (
        <>
            <button
                className="text-link hover:underline text-center w-full block mt-2"
                onClick={() => setShow(true)}
            >
                Remove photo
            </button>
            <CustomedDialog
                isOpen={show}
                onClose={() => setShow(false)}
                className="w-[500px] max-w-screen-sm"
            >
                <CustomedDialog.Title>
                    Remove profile photo
                </CustomedDialog.Title>
                <div className="">
                    <div className="h-48 w-48 relative overflow-hidden mt-4 rounded-lg mx-auto">
                        <img
                            src={user.avatar_url || defaultAvatar}
                            alt={user.display_name || user.name}
                            className="object-cover object-center"
                        />
                    </div>
                    <p className=" text-wrap mt-4 text-center mx-auto">
                        Are you sure you want to remove your photo?
                    </p>
                    <p className=" text-wrap  text-center mx-auto">
                        We’ll replace it with a default Slack avatar.
                    </p>
                    <div className="flex justify-end gap-x-4 mt-8">
                        <Button onClick={() => setShow(false)}>Cancel</Button>
                        <Button type="danger" onClick={removePhoto}>
                            Yes, Remove Photo
                        </Button>
                    </div>
                </div>
            </CustomedDialog>
        </>
    );
}
