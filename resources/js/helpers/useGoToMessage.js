import { useDispatch, useSelector } from "react-redux";

import { loadSpecificMessagesById } from "./loadSpecificMessagesById";
import { useParams } from "react-router-dom";
import { useChannelData } from "./customHooks";
import { setMention } from "@/Store/mentionSlice";
import { setThreadedMessageId, setThreadMessages } from "@/Store/threadSlice";
import { setChannelData } from "@/Store/channelsDataSlice";
import useGoToChannel from "./useGoToChannel";
import useLoadRelatedChannelData from "./useLoadRelatedChannelData";

const useGoToMessage = () => {
    const { channelId, workspaceId } = useParams();
    const { channels } = useSelector((state) => state.channels);
    const channelsData = useSelector((state) => state.channelsData);
    const { messages } = useChannelData(channelId);
    const dispatch = useDispatch();
    const goToChannel = useGoToChannel();
    const loadRelatedChannelData = useLoadRelatedChannelData(workspaceId);
    return (message) => {
        const isThreadMessage = message.threaded_message_id != null;
        const channel = channels.find((cn) => cn.id == message.channel_id);
        if (isThreadMessage) {
            if (!channelsData.hasOwnProperty(channel.id)) {
                console.error("is thread message, not have channel data");
                loadRelatedChannelData(channel.id).then(() => {
                    loadSpecificMessagesById(
                        message.id,
                        channel.id,
                        message.threaded_message_id
                    )
                        .then((data) => {
                            dispatch(setThreadMessages(data));
                        })
                        .then(() => {
                            dispatch(
                                setMention({
                                    messageId: message.threaded_message_id,
                                    threadMessage: message,
                                })
                            );
                            dispatch(
                                setThreadedMessageId(
                                    message.threaded_message_id
                                )
                            );
                        });
                });
            } else {
                console.error("is thread message,have channel data");

                loadSpecificMessagesById(
                    message.id,
                    channel.id,
                    message.threaded_message_id
                )
                    .then((data) => {
                        dispatch(setThreadMessages(data));
                    })
                    .then(() => {
                        dispatch(
                            setMention({
                                messageId: message.threaded_message_id,
                                threadMessage: message,
                            })
                        );
                        dispatch(
                            setThreadedMessageId(message.threaded_message_id)
                        );
                    });
            }
        } else if (channel.id == channelId) {
            console.error("normal message, have channel data");
            if (messages?.find((msg) => msg.id == message.id)) {
                const targetMessage = document.getElementById(
                    `message-${message.id}`
                );

                if (targetMessage) {
                    targetMessage.classList.add("bg-link/15");

                    setTimeout(() => {
                        targetMessage.classList.remove("bg-link/15");
                    }, 3000);
                    targetMessage.scrollIntoView({
                        behavior: "instant",
                        block: "center",
                    });
                }
            } else {
                loadSpecificMessagesById(message.id, channel.id)
                    .then((data) => {
                        dispatch(
                            setChannelData({
                                id: channel.id,
                                data: { messages: data },
                            })
                        );
                    })
                    .then(() => {
                        dispatch(setMention({ messageId: message.id }));
                    });
            }
        } else {
            //not in current channel
            if (channelsData.hasOwnProperty(channel.id)) {
                console.error(
                    "normal message, load specific messages for channel, have some channel data"
                );
                loadSpecificMessagesById(message.id, channel.id)
                    .then((data) => {
                        dispatch(
                            setChannelData({
                                id: channel.id,
                                data: { messages: data },
                            })
                        );
                    })
                    .then(() => {
                        goToChannel(workspaceId, channel.id);
                    })
                    .then(() => {
                        dispatch(setMention({ messageId: message.id }));
                    });
            } else {
                console.error(
                    "normal message, not have channel data, go to channel to load data"
                );
                dispatch(setMention({ messageId: message.id }));
                goToChannel(workspaceId, channel.id);
            }
        }
    };
};
export default useGoToMessage;
