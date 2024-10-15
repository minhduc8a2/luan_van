import React from "react";
import ChannelSettings from "./ChannelSettings/ChannelSettings";
import Button from "@/Components/Button";
import TipTapEditor from "@/Components/TipTapEditor";
import { router, usePage } from "@inertiajs/react";
import { getMentionsFromContent } from "@/helpers/tiptapHelper";
import { useChannelUsers } from "@/helpers/customHooks";
import { useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import useJoinChannel from "@/helpers/useJoinChannel";
import { FaLock } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import {
    addMessage,
    editMessage,
    updateMessageAfterSendFailed,
    updateMessageAfterSendSuccessfully,
} from "@/Store/channelsDataSlice";

export default function Editor({
    channel,
    permissions,
    isChannelMember,
    channelName,
    setFocus,
    setTemporaryMessageSending,
    setNewMessageReceived,
}) {
    const { auth } = usePage().props;
    const { channelId, workspaceId } = useParams();
    const { publicAppUrl } = useSelector((state) => state.workspace);
    const { channelUsers } = useChannelUsers(channelId);
    const joinChannel = useJoinChannel();
    const dispatch = useDispatch();
    function onSubmit(content, fileObjects, JSONContent) {
        let mentionsList = getMentionsFromContent(JSONContent);
        if (
            content == "<p></p>" &&
            fileObjects.length == 0 &&
            mentionsList.length == 0
        )
            return;
        //create new message on client side
        const tempFiles = fileObjects.map((fileObject, index) => {
            return {
                id: index,
                name: fileObject.name,
                url:
                    publicAppUrl +
                    "/" +
                    fileObject.path.replace("public", "storage"),
                type: fileObject.type,
                path: fileObject.path,
                workspace_id: workspaceId,
                user_id: auth.user.id,
                created_at: new Date().toUTCString(),
            };
        });
        const newMessageId = uuidv4();
        const newMessage = {
            id: newMessageId,
            isTemporary: true,
            content,
            reactions: [],
            thread_messages_count: 0,
            files: tempFiles,
            user_id: auth.user.id,
            channel_id: channelId,
            isSending: true,
            created_at: new Date().toUTCString(),
        };
        setTemporaryMessageSending(true);
        dispatch(addMessage({ id: channelId, data: newMessage }));
        setNewMessageReceived(true);
        setTimeout(() => {
            setTemporaryMessageSending(false);
        }, 0);
        axios
            .post(
                route("message.store", { channel: channel.id }),
                {
                    content,
                    fileObjects,
                    mentionsList,
                    created_at:newMessage.created_at,
                },
                {
                    headers: {
                        "X-Socket-Id": Echo.socketId(),
                    },
                }
            )
            .then((response) => {
                dispatch(
                    updateMessageAfterSendSuccessfully({
                        id: channelId,
                        temporaryId: newMessageId,
                        data: response.data.message,
                    })
                );
                setFocus((pre) => pre + 1);
            })
            .catch((error) => {
                dispatch(
                    updateMessageAfterSendFailed({
                        id: channelId,
                        temporaryId: newMessageId,
                    })
                );
            });
    }
    return (
        <div className="m-6 border border-color/15 pt-4 px-2 rounded-lg ">
            {permissions.chat && (
                <TipTapEditor
                    onSubmit={onSubmit}
                    channel={channel}
                    channelUsers={channelUsers}
                />
            )}
            {!permissions.chat && !channel?.is_archived && isChannelMember && (
                <h5 className="mb-4 text-center ml-4">
                    You're not allowed to post in channel. Contact Admins or
                    Channel managers for more information!
                </h5>
            )}
            {!isChannelMember && permissions.join && (
                <div className="">
                    <div className="flex items-baseline gap-x-1 font-bold justify-center text-lg">
                        {channel.type == "PUBLIC" ? (
                            <span className="text-xl">#</span>
                        ) : (
                            <FaLock className="text-sm inline" />
                        )}{" "}
                        {channelName}
                    </div>
                    <div className="flex gap-x-4 justify-center my-4 ">
                        <ChannelSettings
                            channelName={channelName}
                            buttonNode={
                                <Button className="bg-black/15 border border-color/15">
                                    Detail
                                </Button>
                            }
                        />
                        <Button
                            className="bg-green-900"
                            onClick={() => joinChannel(channelId)}
                        >
                            Join Channel
                        </Button>
                    </div>
                </div>
            )}
            {channel?.is_archived == true && (
                <div className="mb-4 justify-center flex ml-4 items-baseline gap-x-1 text-color/75">
                    You are viewing{" "}
                    <div className="flex items-baseline gap-x-1">
                        {channel.type == "PUBLIC" ? (
                            <span className="text-xl">#</span>
                        ) : (
                            <FaLock className="text-sm inline" />
                        )}{" "}
                        {channelName}
                    </div>
                    , an archived channel
                </div>
            )}
        </div>
    );
}
