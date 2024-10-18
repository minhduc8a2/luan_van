import AvatarAndName from "@/Components/AvatarAndName";

import AutocompleInput from "@/Components/Input/AutocompleInput";

import TipTapEditor from "@/Components/TipTapEditor";

import { usePage } from "@inertiajs/react";
import React, { useEffect, useMemo, useState } from "react";
import { FaLock } from "react-icons/fa";
import Message from "../Message";
import { useDispatch, useSelector } from "react-redux";

import { getMentionsFromContent } from "@/helpers/tiptapHelper";

import { useChannel, useChannelUsers } from "@/helpers/customHooks";
import { useParams } from "react-router-dom";
import useGoToChannel from "@/helpers/useGoToChannel";
import useErrorHandler from "@/helpers/useErrorHandler";
import CustomedDialog from "@/Components/CustomedDialog";
import useLoadChannelData from "@/helpers/useLoadChannelData";

export default function ForwardMessage({ message, show, onClose }) {
    const dispatch = useDispatch();
    const { auth } = usePage().props;
    const { channelId, workspaceId } = useParams();
    const { channel } = useChannel(channelId);
    const channelsData = useSelector((state) => state.channelsData);
    const { channelUsers } = useChannelUsers(channelId);
    const { channels } = useSelector((state) => state.channels);
    const { workspaceUsers } = useSelector((state) => state.workspaceUsers);
    const goToChannel = useGoToChannel();
    const loadChannelData = useLoadChannelData(workspaceId);
    const [choosenChannelsList, setChoosenChannelsList] = useState([]);
    const [loadingChannelUserIds, setLoadingChannelUserIds] = useState(false);
    const errorHandler = useErrorHandler();
    function changeChannel(channelId) {
        goToChannel(channel.workspace_id, channelId);
    }
    function onSubmit(content, _, JSONContent) {
        if (choosenChannelsList.length < 1) return;

        let mentionsList = getMentionsFromContent(JSONContent);
        axios
            .post(
                route("message.store", { channel: channel.id }),
                {
                    content,
                    channelId: choosenChannelsList[0].id,
                    forwardedMessageId: message.id,
                    mentionsList,
                },
                {
                    headers: {
                        "X-Socket-Id": Echo.socketId(),
                    },
                }
            )
            .then((response) => {
                onClose();
                changeChannel(choosenChannelsList[0].id);
            })
            .catch(errorHandler);
    }

    function handleChooseChannel(cn) {
        if (choosenChannelsList.length > 0) return;

        setChoosenChannelsList([cn]);
        if (channelsData.hasOwnProperty(cn.id)) return;
        setLoadingChannelUserIds(true);

        loadChannelData(cn.id).then(() => {
            setLoadingChannelUserIds(false);
        });
    }
    useEffect(() => {
        setChoosenChannelsList([]);
    }, [message]);

    const selectedChannelUsers = useMemo(() => {
        if (choosenChannelsList.length > 0) {
            const choosenChannel = choosenChannelsList[0];
            if (channelsData.hasOwnProperty(choosenChannel.id)) {
                return channelsData[choosenChannel.id].channelUserIds.reduce(
                    (val, id) => {
                        const u = workspaceUsers.find((u) => u.id == id);
                        if (u) return [...val, u];
                        else return [...val];
                    },
                    []
                );
            }
        }
        return [];
    }, [workspaceUsers, choosenChannelsList, channelsData]);
    if (!message) return "";

    const user = channelUsers.filter((mem) => mem.id === message.user_id)[0];

    return (
        <CustomedDialog isOpen={show} onClose={onClose}>
            <CustomedDialog.Title>Forward this message</CustomedDialog.Title>
            <AutocompleInput
                isLimitReached={choosenChannelsList.length > 0}
                choosenList={choosenChannelsList}
                inputPlaceholder="Add by name or channel"
                renderChoosenList={() =>
                    choosenChannelsList.map((item) => {
                        if (item.type == "DIRECT") {
                            const userIds = item.name.split("_");
                            const userId = userIds.find(
                                (id) => id != auth.user.id
                            );
                            let user = workspaceUsers.find(
                                (u) => u.id == userId
                            );
                            return (
                                <AutocompleInput.InputItem
                                    onRemove={() => setChoosenChannelsList([])}
                                    key={item.id}
                                >
                                    <AvatarAndName
                                        user={user}
                                        className="h-4 w-4"
                                    />
                                </AutocompleInput.InputItem>
                            );
                        } else
                            return (
                                <AutocompleInput.InputItem
                                    onRemove={() => setChoosenChannelsList([])}
                                    key={item.id}
                                >
                                    <div className="flex items-baseline gap-x-1">
                                        {item.type == "PUBLIC" ? (
                                            <span className="text-xl">#</span>
                                        ) : (
                                            <FaLock className="text-sm inline" />
                                        )}{" "}
                                        {item.name}
                                    </div>
                                </AutocompleInput.InputItem>
                            );
                    })
                }
                renderDropListFn={(inputValue) => {
                    if (!inputValue && choosenChannelsList.length > 0)
                        return "";
                    return channels
                        .filter((item) =>
                            item.name
                                .toLowerCase()
                                .includes(inputValue.toLowerCase())
                        )
                        .map((item) => {
                            if (item.type == "DIRECT") {
                                const userIds = item.name.split("_");
                                const userId = userIds.find(
                                    (id) => id != auth.user.id
                                );
                                let user = workspaceUsers.find(
                                    (u) => u.id == userId
                                );
                                return (
                                    <button
                                        key={item.id}
                                        className="hover:bg-color/15 p-2 px-4"
                                        onClick={() =>
                                            handleChooseChannel(item)
                                        }
                                    >
                                        <AvatarAndName
                                            user={user}
                                            className="h-6 w-6"
                                            noStatus={true}
                                        />
                                    </button>
                                );
                            } else if (item.type == "SELF") {
                                return (
                                    <button
                                        key={item.id}
                                        className="hover:bg-color/15 p-2 px-4"
                                        onClick={() =>
                                            handleChooseChannel(item)
                                        }
                                    >
                                        <AvatarAndName
                                            user={auth.user}
                                            className="h-6 w-6"
                                            noStatus={true}
                                        />
                                    </button>
                                );
                            } else
                                return (
                                    <button
                                        className="flex items-baseline gap-x-1 hover:bg-color/15 px-4 py-1"
                                        key={item.id}
                                        onClick={() =>
                                            handleChooseChannel(item)
                                        }
                                    >
                                        {item.type == "PUBLIC" ? (
                                            <span className="text-xl">#</span>
                                        ) : (
                                            <FaLock className="text-sm inline" />
                                        )}{" "}
                                        {item.name}
                                    </button>
                                );
                        });
                }}
            />
            {choosenChannelsList.length > 0 && (
                <div className="border border-color/15 p-4 pb-2 mt-4 rounded-lg ">
                    <TipTapEditor
                        onSubmit={onSubmit}
                        onlyText
                        channel={choosenChannelsList[0]}
                        channelUsers={selectedChannelUsers}
                    />
                </div>
            )}
            <div className="max-h-[35vh] overflow-y-auto scrollbar mt-4 border-l-4 border-l-white/15 relative">
                <Message
                    noToolbar
                    threadStyle={true}
                    message={message}
                    user={user}
                    hasChanged={true}
                    index={0}
                />
            </div>
            <CustomedDialog.CloseButton />
        </CustomedDialog>
    );
}
