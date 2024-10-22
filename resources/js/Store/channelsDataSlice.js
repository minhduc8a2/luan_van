import { createSlice } from "@reduxjs/toolkit";

export const channelsDataSlice = createSlice({
    name: "channelsData",
    initialState: {},
    reducers: {
        removeChannelData(state, action) {
            console.log("remove channel data", action.payload.id);
            if (state[action.payload.id]) {
                delete state[action.payload.id];
            }
        },

        setChannelData(state, action) {
            const { id, data } = action.payload;
            if (!state[id]) {
                state[id] = {};
            }
            const channel = state[id];

            Object.keys(data).forEach((key) => {
                switch (key) {
                    case "messages":
                        channel.messagesMap = {};
                        data.messages.forEach(
                            (msg) => (channel.messagesMap[msg.id] = msg)
                        );
                        break;
                    case "managerIds":
                        channel.managerIdsMap = {};
                        data.managerIds.forEach(
                            (id) => (channel.managerIdsMap[id] = true)
                        );
                        break;
                    case "channelUserIds":
                        channel.channelUserIdsMap = {};
                        data.channelUserIds.forEach(
                            (id) => (channel.channelUserIdsMap[id] = true)
                        );
                        break;
                    default:
                        channel[key] = data[key];
                        break;
                }
            });
        },
        clearChannelData(state, action) {
            state = {};
        },
        removeUserFromChannel(state, action) {
            const { id, userId } = action.payload;
            const channel = state[id];
            if (channel && channel.channelUserIdsMap) {
                delete channel.channelUserIdsMap[userId];
            }
        },
        addUsersToChannel(state, action) {
            const { id, userIds } = action.payload;
            const channel = state[id];
            if (channel && channel.channelUserIdsMap) {
                userIds.forEach((userId) => {
                    channel.channelUserIdsMap[userId] = true;
                });
            }
        },
        removeManagerFromChannel(state, action) {
            const { id, userId } = action.payload;
            const channel = state[id];
            if (channel && channel.managerIdsMap) {
                delete channel.managerIdsMap[userId];
            }
        },
        addManagersToChannel(state, action) {
            const { id, userIds } = action.payload;
            const channel = state[id];
            if (channel && channel.managerIdsMap) {
                userIds?.forEach((userId) => {
                    channel.managerIdsMap[userId] = true;
                });
            }
        },
        addMessages(state, action) {
            const { id, data } = action.payload;
            if (!Array.isArray(data) || !id) return;
            const channel = state[id];
            if (channel && channel.messagesMap) {
                // filter existing messages
                Object.values(channel.messagesMap).forEach((msg) => {
                    if (msg.isTemporary) delete channel.messagesMap[msg.id];
                });

                data.forEach((msg) => {
                    channel.messagesMap[msg.id]= msg;
                });
            }
        },
        addMessage(state, action) {
            const { id, data } = action.payload;
            const channel = state[id];
            if (channel && channel.messagesMap) {
                channel.messagesMap[data.id] = data;
            }
        },

        updateMessageAfterSendSuccessfully(state, action) {
            const { id, data, temporaryId } = action.payload;
            const channel = state[id];
            if (channel && channel.messagesMap) {
                const { id: newId, files } = data;
                if (channel.messagesMap[temporaryId]) {
                    channel.messagesMap[temporaryId].id = newId;
                    channel.messagesMap[temporaryId].files = files;
                    channel.messagesMap[temporaryId].isTemporary = false;
                    channel.messagesMap[temporaryId].isSending = false;

                    channel.messagesMap[newId] =
                        channel.messagesMap[temporaryId];

                    delete channel.messagesMap[temporaryId];
                }
            }
        },
        updateMessageAfterSendFailed(state, action) {
            const { id, temporaryId } = action.payload;
            const channel = state[id];
            if (
                channel &&
                channel.messagesMap &&
                channel.messagesMap[temporaryId]
            ) {
                channel.messagesMap[temporaryId].isSending = false;
                channel.messagesMap[temporaryId].isFailed = true;
            }
        },
        editMessage(state, action) {
            const { id, data } = action.payload;
            const channel = state[id];
            if (
                channel &&
                channel.messagesMap &&
                channel.messagesMap[data.message_id]
            ) {
                channel.messagesMap[data.message_id].content = data.content;
                channel.messagesMap[data.message_id].is_edited = true;
            }
        },
        addReactionToMessage(state, action) {
            const { id, data } = action.payload;
            const channel = state[id];
            if (
                channel &&
                channel.messagesMap &&
                channel.messagesMap[data.message_id]
            ) {
                channel.messagesMap[data.message_id].reactions.push(data);
            }
        },
        removeReactionFromMessage(state, action) {
            const { id, data } = action.payload;
            const channel = state[id];
            if (
                channel &&
                channel.messagesMap &&
                channel.messagesMap[data.message_id]
            ) {
                channel.messagesMap[data.message_id].reactions =
                    channel.messagesMap[data.message_id].reactions.filter(
                        (reaction) => reaction.id != data.reactionId
                    );
            }
        },
        deleteMessage(state, action) {
            const { id, data } = action.payload;
            const channel = state[id];
            if (
                channel &&
                channel.messagesMap &&
                channel.messagesMap[data.message_id]
            ) {
                channel.messagesMap[data.message_id].deleted_at =
                    new Date().toUTCString();
                channel.messagesMap[data.message_id].reactions = [];

                channel.messagesMap[data.message_id].files = [];
            }
        },

        addThreadMessagesCount(state, action) {
            const { id, data } = action.payload;
            const channel = state[id];
            if (
                channel &&
                channel.messagesMap &&
                channel.messagesMap[data.message_id]
            ) {
                channel.messagesMap[data.message_id].thread_messages_count += 1;
            }
        },
        subtractThreadMessagesCount(state, action) {
            const { id, data } = action.payload;
            const channel = state[id];
            if (
                channel &&
                channel.messagesMap &&
                channel.messagesMap[data.message_id]
            ) {
                channel.messages[messageIndex].thread_messages_count -= 1;
            }
        },

        deleteFile(state, action) {
            const { id, data } = action.payload;
            const channel = state[id];
            if (channel && channel.messagesMap) {
                const fileIdToDelete = data.file_id;
                Object.values(channel.messagesMap).forEach((message) => {
                    const files = message.files;
                    const fileIndex = files.findIndex(
                        (file) => file.id === fileIdToDelete
                    );
                    if (fileIndex !== -1) {
                        files[fileIndex].deleted_at = new Date().toUTCString();
                        files[fileIndex].url = "";
                        files[fileIndex].type = "";
                        files[fileIndex].path = "";
                        files[fileIndex].name = "";
                    }
                });
            }
        },
    },
});

// Action creators are generated for each case reducer function
export const {
    setChannelData,
    removeUserFromChannel,
    addUsersToChannel,
    removeManagerFromChannel,
    addManagersToChannel,
    addMessage,
    editMessage,
    deleteMessage,
    addThreadMessagesCount,
    subtractThreadMessagesCount,
    deleteFile,
    removeChannelData,
    addMessages,
    updateMessageAfterSendSuccessfully,
    updateMessageAfterSendFailed,
    clearChannelData,
    addReactionToMessage,
    removeReactionFromMessage,
} = channelsDataSlice.actions;

export default channelsDataSlice.reducer;
