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
            if (!state[action.payload.id]) {
                state[action.payload.id] = {};
            }
            Object.keys(action.payload.data).forEach((key) => {
                state[action.payload.id][key] = action.payload.data[key];
            });
        },

        removeUserFromChannel(state, action) {
            if (
                state[action.payload.id] &&
                state[action.payload.id].channelUserIds
            ) {
                state[action.payload.id].channelUserIds = state[
                    action.payload.id
                ].channelUserIds.filter(
                    (userId) => userId != action.payload.userId
                );
            }
        },
        addUsersToChannel(state, action) {
            if (
                state[action.payload.id] &&
                state[action.payload.id].channelUserIds
            ) {
                action.payload.userIds.forEach((userId) => {
                    if (
                        !state[action.payload.id].channelUserIds.find(
                            (uId) => uId == userId
                        )
                    ) {
                        state[action.payload.id].channelUserIds.push(userId);
                    }
                });
            }
        },
        removeManagerFromChannel(state, action) {
            if (
                state[action.payload.id] &&
                state[action.payload.id].managerIds
            ) {
                state[action.payload.id].managerIds = state[
                    action.payload.id
                ].managerIds.filter(
                    (userId) => userId != action.payload.userId
                );
            }
        },
        addManagersToChannel(state, action) {
            if (
                state[action.payload.id] &&
                state[action.payload.id].managerIds
            ) {
                action.payload.userIds?.forEach((userId) => {
                    if (
                        !state[action.payload.id].managerIds.find(
                            (uId) => uId == userId
                        )
                    ) {
                        state[action.payload.id].managerIds.push(userId);
                    }
                });
            }
        },
        addMessages(state, action) {
            if (state[action.payload.id] && state[action.payload.id].messages) {
                if (action.payload.position == "top") {
                    state[action.payload.id].messages = [
                        ...action.payload.data,
                        ...state[action.payload.id].messages,
                    ];
                } else {
                    state[action.payload.id].messages = [
                        ...state[action.payload.id].messages,
                        ...action.payload.data,
                    ];
                }
            }
        },
        addMessage(state, action) {
            if (state[action.payload.id] && state[action.payload.id].messages) {
                if (
                    !state[action.payload.id].messages.find(
                        (msg) => msg.id == action.payload.data.id
                    )
                ) {
                    state[action.payload.id].messages.push(action.payload.data);
                }
            }
        },

        editMessage(state, action) {
            if (state[action.payload.id] && state[action.payload.id].messages) {
                let messageIndex = state[action.payload.id].messages.findIndex(
                    (message) => message.id == action.payload.data.message_id
                );
                if (messageIndex >= 0) {
                    state[action.payload.id].messages[messageIndex].content =
                        action.payload.data.content;
                    state[action.payload.id].messages[
                        messageIndex
                    ].is_edited = true;
                }
            }
        },
        deleteMessage(state, action) {
            if (state[action.payload.id] && state[action.payload.id].messages) {
                let messageIndex = state[action.payload.id].messages.findIndex(
                    (message) => message.id == action.payload.data.message_id
                );
                if (messageIndex >= 0) {
                    state[action.payload.id].messages[messageIndex].deleted_at =
                        new Date().toUTCString();
                    state[action.payload.id].messages[messageIndex].reactions =
                        [];

                    state[action.payload.id].messages[messageIndex].files = [];
                }
            }
        },

        addThreadMessagesCount(state, action) {
            if (state[action.payload.id] && state[action.payload.id].messages) {
                let messageIndex = state[action.payload.id].messages.findIndex(
                    (message) => message.id == action.payload.data.message_id
                );
                if (messageIndex >= 0) {
                    state[action.payload.id].messages[
                        messageIndex
                    ].thread_messages_count += 1;
                }
            }
        },
        subtractThreadMessagesCount(state, action) {
            if (state[action.payload.id] && state[action.payload.id].messages) {
                let messageIndex = state[action.payload.id].messages.findIndex(
                    (message) => message.id == action.payload.data.message_id
                );
                if (messageIndex >= 0) {
                    state[action.payload.id].messages[
                        messageIndex
                    ].thread_messages_count -= 1;
                }
            }
        },

        deleteFile(state, action) {
            if (state[action.payload.id] && state[action.payload.id].messages) {
                for (
                    let msgIndex = 0;
                    msgIndex < state[action.payload.id].messages.length;
                    msgIndex++
                ) {
                    const files =
                        state[action.payload.id].messages[msgIndex].files; // Access the 'files' array

                    for (
                        let fileIndex = 0;
                        fileIndex < files.length;
                        fileIndex++
                    ) {
                        if (
                            files[fileIndex].id == action.payload.data.file_id
                        ) {
                            files[fileIndex].deleted_at =
                                new Date().toUTCString();
                            files[fileIndex].url = "";
                            files[fileIndex].type = "";
                            files[fileIndex].path = "";
                            files[fileIndex].name = "";

                            return;
                        }
                    }
                }
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
} = channelsDataSlice.actions;

export default channelsDataSlice.reducer;
