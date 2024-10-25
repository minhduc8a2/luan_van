import CustomedDialog from "@/Components/CustomedDialog";

import { useCustomedForm } from "@/helpers/customHooks";
import { deleteMessage } from "@/Store/channelsDataSlice";
import { deleteThreadMessage, setThreadedMessageId } from "@/Store/threadSlice";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";

export default function DeleteMessage({ message, user }) {
    const { workspaceId } = useParams();
    const { messageId: threadMessageId } = useSelector((state) => state.thread);
    const [isOpen, setIsOpen] = useState(false);
    const { submit, loading } = useCustomedForm(
        {},
        {
            url: route("message.delete", {
                workspace: workspaceId,
                message: message.id,
            }),
            method: "delete",
        }
    );

    const dispatch = useDispatch();

    function onSubmit() {
        submit().then((response) => {
            if(response.ok)
            dispatch(
                deleteMessage({
                    id: message.channel_id,
                    data: { message_id: message.id },
                })
            );
            dispatch(deleteThreadMessage(message.id));
            if (threadMessageId == message.id)
                dispatch(setThreadedMessageId(null));
        });
    }
    return (
        <>
            <button
                className="hover:bg-danger-500  hover:text-white px-4  py-2 w-full text-left text-danger-400"
                onClick={() => setIsOpen(true)}
            >
                Delete message
            </button>
            <CustomedDialog isOpen={isOpen} onClose={() => setIsOpen(false)}>
                <CustomedDialog.Title>Delete message</CustomedDialog.Title>
                <h5 className="text-color-high-emphasis">
                    Are you sure you want to delete this message? This cannot be
                    undone.
                </h5>
                <CustomedDialog.ActionButtons
                    btnName2="Delete"
                    loading={loading}
                    onClickBtn2={onSubmit}
                />
            </CustomedDialog>
        </>
    );
}
