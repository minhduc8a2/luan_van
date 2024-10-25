import { usePage } from "@inertiajs/react";
import { createContext, useRef, useState } from "react";
import { useEffect } from "react";

import { useDispatch, useSelector } from "react-redux";

import {
    addReactionToThreadedMessage,
    addReactionToThreadMessage,
    deleteFileInThread,
    editThreadedMessage,
    removeReactionFromThreadedMessage,
    removeReactionFromThreadMessage,
    setThreadedMessageId,
} from "@/Store/threadSlice";
import {
    addMessageCountForChannel,
    updateChannelInformation,
} from "@/Store/channelsSlice";
import { isHiddenUser } from "@/helpers/userHelper";
import {
    addManagersToChannel,
    addMessage,
    addReactionToMessage,
    addUsersToChannel,
    deleteFile,
    deleteMessage,
    editMessage,
    removeManagerFromChannel,
    removeReactionFromMessage,
    removeUserFromChannel,
} from "@/Store/channelsDataSlice";
import { useParams } from "react-router-dom";
import useReloadPermissions from "@/helpers/useReloadPermissions";
import useReloadLoadedChannelsDataPermissions from "@/helpers/useReloadLoadedChannelsDataPermissions";
import ChannelEventsEnum from "@/services/Enums/ChannelEventsEnum";
export const ChannelEventHandlersProviderContext = createContext({});
export default function ChannelEventHandlersProvider({ children }) {
    const { auth } = usePage().props;
    const [event, setEvent] = useState(null);
    const { channelId, workspaceId } = useParams();
    const { workspace } = useSelector((state) => state.workspace);
    const dispatch = useDispatch();
    const { channels } = useSelector((state) => state.channels);
    const channelsData = useSelector((state) => state.channelsData);
    const { workspaceUsers } = useSelector((state) => state.workspaceUsers);
    const { threadMessageId } = useSelector((state) => state.thread);
    const { channelId: huddleChannelId } = useSelector((state) => state.huddle);
    const reloadPermissions = useReloadPermissions(workspaceId);
    const reloadLoadedChannelsDataPermissions =
        useReloadLoadedChannelsDataPermissions(workspaceId);
    const channelsDataRef = useRef(null);
    const channelsRef = useRef(null);
    const workspaceUsersRef = useRef(null);
    const threadMessageIdRef = useRef(null);
    const channelIdRef = useRef(null);
    const huddleChannelIdRef = useRef(null);
    const mainChannelRef = useRef(null);
    const reloadLoadedChannelsDataPermissionsRef = useRef(null);
    const subscribedChannelsRef = useRef(new Map());
    useEffect(() => {
        reloadLoadedChannelsDataPermissionsRef.current =
            reloadLoadedChannelsDataPermissions;
    }, [reloadLoadedChannelsDataPermissions]);
    useEffect(() => {
        channelsDataRef.current = channelsData;
    }, [channelsData]);

    useEffect(() => {
        channelsRef.current = channels;
    }, [channels]);
    useEffect(() => {
        workspaceUsersRef.current = workspaceUsers;
    }, [workspaceUsers]);

    useEffect(() => {
        threadMessageIdRef.current = threadMessageId;
    }, [threadMessageId]);

    useEffect(() => {
        channelIdRef.current = channelId;
    }, [channelId]);

    useEffect(() => {
        huddleChannelIdRef.current = huddleChannelId;
    }, [huddleChannelId]);

    useEffect(() => {
        mainChannelRef.current = { id: workspace?.main_channel_id };
    }, [workspace]);

    useEffect(() => {
        channels.forEach((cn) => {
            if (!subscribedChannelsRef.current.has(cn.id)) {
                const subscription = Echo.private(`private_channels.${cn.id}`)
                    .listen("MessageEvent", (e) => {
                        switch (e.type) {
                            case ChannelEventsEnum.NEW_MESSAGE_CREATED:
                                if (
                                    !isHiddenUser(
                                        workspaceUsersRef.current,
                                        e.message?.user_id
                                    )
                                ) {
                                    dispatch(
                                        addMessage({
                                            id: cn.id,
                                            data: e.message,
                                        })
                                    );
                                    // setNewMessageReceived(true);
                                }
                                if (e.message?.user_id != auth.user.id)
                                    if (cn.id != channelIdRef.current)
                                        if (
                                            !isHiddenUser(
                                                workspaceUsersRef.current,
                                                e.message?.user_id
                                            )
                                        )
                                            dispatch(
                                                addMessageCountForChannel({
                                                    id: cn.id,
                                                })
                                            );
                                break;
                            case ChannelEventsEnum.MESSAGE_EDITED:
                                dispatch(
                                    editMessage({
                                        id: cn.id,
                                        data: {
                                            message_id: e.message.id,
                                            content: e.message.content,
                                        },
                                    })
                                );
                                dispatch(
                                    editThreadedMessage({
                                        id: e.message.id,
                                        data: e.message,
                                    })
                                );
                                break;
                            case ChannelEventsEnum.MESSAGE_DELETED:
                                if (threadMessageIdRef.current == e.message?.id)
                                    dispatch(setThreadedMessageId(null));
                                dispatch(
                                    deleteMessage({
                                        id: cn.id,
                                        data: {
                                            message_id: e.message?.id,
                                        },
                                    })
                                );

                            default:
                                break;
                        }
                    })
                    .listen("ChannelEvent", (e) => {
                        console.log("ChannelEvent", e);
                        switch (e.type) {
                            case ChannelEventsEnum.CHANNEL_UPDATED:
                                dispatch(
                                    updateChannelInformation({
                                        id: cn.id,
                                        data: e.data,
                                    })
                                );
                                break;
                            case ChannelEventsEnum.ADD_MANAGERS:
                                dispatch(
                                    addManagersToChannel({
                                        id: cn.id,
                                        userIds: e.data,
                                    })
                                );
                                if (e.data?.find((id) => id == auth.user.id)) {
                                    reloadPermissions(cn.id);
                                }
                                break;
                            case ChannelEventsEnum.REMOVE_MANAGER:
                                dispatch(
                                    removeManagerFromChannel({
                                        id: cn.id,
                                        userId: e.data,
                                    })
                                );
                                if (e.data == auth.user.id) {
                                    reloadPermissions(cn.id);
                                }
                                break;

                            case ChannelEventsEnum.REMOVE_USER_FROM_CHANNEL:
                                dispatch(
                                    removeManagerFromChannel({
                                        id: cn.id,
                                        userId: e.data,
                                    })
                                );
                                dispatch(
                                    removeUserFromChannel({
                                        id: cn.id,
                                        userId: e.data,
                                    })
                                );

                                break;
                            case ChannelEventsEnum.ADD_USERS_TO_CHANNEL:
                                dispatch(
                                    addUsersToChannel({
                                        id: cn.id,
                                        userIds: e.data,
                                    })
                                );

                                break;
                            case ChannelEventsEnum.UPDATE_CHANNEL_PERMISSIONS:
                                reloadPermissions(cn.id);
                                break;

                            case ChannelEventsEnum.ARCHIVE_CHANNEL:
                                reloadPermissions(cn.id);
                                dispatch(
                                    updateChannelInformation({
                                        id: cn.id,
                                        data: e.data,
                                    })
                                );
                                break;
                            case ChannelEventsEnum.UNARCHIVE_CHANNEL:
                                reloadPermissions(cn.id);
                                dispatch(
                                    updateChannelInformation({
                                        id: cn.id,
                                        data: e.data,
                                    })
                                );
                                break;
                            case ChannelEventsEnum.NEW_USER_JOIN:
                                dispatch(
                                    addUsersToChannel({
                                        id: cn.id,
                                        userIds: [e.data],
                                    })
                                );
                                break;
                            case ChannelEventsEnum.LEAVE:
                                dispatch(
                                    removeManagerFromChannel({
                                        id: cn.id,
                                        userId: e.data,
                                    })
                                );
                                dispatch(
                                    removeUserFromChannel({
                                        id: cn.id,
                                        userId: e.data,
                                    })
                                );

                                break;
                            case ChannelEventsEnum.FILE_CREATED:
                                setEvent({
                                    type: ChannelEventsEnum.FILE_CREATED,
                                    data: e.data,
                                    channelId: cn.id,
                                });
                                break;
                            case ChannelEventsEnum.FILE_DELETED:
                                setEvent({
                                    type: ChannelEventsEnum.FILE_DELETED,
                                    data: e.data,
                                    channelId: cn.id,
                                });
                                dispatch(
                                    deleteFile({
                                        id: cn.id,
                                        data: { file_id: e.data },
                                    })
                                );
                                dispatch(deleteFileInThread(e.data));
                                break;
                            case ChannelEventsEnum.REACTION_CREATED:
                                dispatch(
                                    addReactionToMessage({
                                        id: cn.id,
                                        data: e.data,
                                    })
                                );
                                dispatch(
                                    addReactionToThreadedMessage({
                                        id: e.data.message_id,
                                        data: e.data,
                                    })
                                );
                                dispatch(
                                    addReactionToThreadMessage({
                                        message_id: e.data.message_id,
                                        data: e.data,
                                    })
                                );
                                break;
                            case ChannelEventsEnum.REACTION_DELETED:
                                dispatch(
                                    removeReactionFromMessage({
                                        id: cn.id,
                                        data: e.data,
                                    })
                                );
                                dispatch(
                                    removeReactionFromThreadedMessage({
                                        id: e.data.message_id,
                                        reactionId: e.data.reactionId,
                                    })
                                );
                                dispatch(
                                    removeReactionFromThreadMessage({
                                        message_id: e.data.message_id,
                                        reactionId: e.data.reactionId,
                                    })
                                );

                                break;
                        }
                    });
                subscribedChannelsRef.current.set(cn.id, subscription);
                console.log(`Subscribed to channel ${cn.id}`);
            }
        });
        subscribedChannelsRef.current.forEach((_, id) => {
            if (!channels.some((cn) => cn.id == id)) {
                Echo.leaveChannel(`private_channels.${id}`);
                subscribedChannelsRef.current.delete(id);
                console.log(`Unsubscribed from channel ${id}`);
            }
        });
    }, [channels, workspaceId, auth.user.id]);
    useEffect(() => {
        return () => {
            subscribedChannelsRef.current.forEach((_, id) => {
                Echo.leaveChannel(`private_channels.${id}`);
            });
            subscribedChannelsRef.current.clear();
            console.log("Unsubscribed from all channels");
        };
    }, []);

    return (
        <ChannelEventHandlersProviderContext.Provider
            value={{ event, setEvent }}
        >
            {children}
        </ChannelEventHandlersProviderContext.Provider>
    );
}
