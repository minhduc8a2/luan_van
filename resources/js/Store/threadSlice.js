import { createSlice } from "@reduxjs/toolkit";
import { setRightWindowType } from "./windowTypeSlice";

export const setThreadedMessageId = (messageId) => (dispatch) => {
    dispatch(threadSlice.actions.setMessageId(messageId));
    if (messageId) {
        dispatch(setRightWindowType("thread"));
    } else {
        dispatch(setRightWindowType(""));
    }
};
export const threadSlice = createSlice({
    name: "thread",
    initialState: {
        messageId: null,
        message: null,
        messages: [],
        width: 500,
    },
    reducers: {
        setThreadedMessage(state, action) {
            state.message = action.payload;
        },
        editThreadedMessage(state, action) {
            if (state.message && state.message.id == action.payload.id) {
                Object.assign(state.message, action.payload.data);
            }
        },
        addReactionToThreadedMessage(state, action) {
            if (state.message && state.message.id == action.payload.id) {
                state.message.reactions.push(action.payload.data);
            }
        },
        removeReactionFromThreadedMessage(state, action) {
            if (state.message && state.message.id == action.payload.id) {
                state.message.reactions = state.message.reactions.filter(
                    (reaction) => reaction.id != action.payload.reactionId
                );
            }
        },
        setMessageId(state, action) {
            state.messageId = action.payload;
            if (!state.messageId) state.message = null;
        },
        addThreadMessage(state, action) {
            state.message.thread_messages_count += 1;
            state.messages = [...state.messages, action.payload];
        },
        addThreadMessages(state, action) {
            if (!Array.isArray(action.payload.data)) return;
            // filter existing messages
            state.messages = state.messages.filter((msg) => !msg.isTemporary);
            const filteredNewMessages = action.payload.data.filter(
                (msg) => !state.messages.some((m) => m.id == msg.id)
            );

            if (action.payload.position == "top") {
                state.messages = [...filteredNewMessages, ...state.messages];
            } else {
                state.messages = [...state.messages, ...filteredNewMessages];
            }
        },
        updateThreadMessageAfterSendSuccessfully(state, action) {
            if (state.messages) {
                let messageIndex = state.messages.findIndex(
                    (message) => message.id == action.payload.temporaryId
                );
                if (messageIndex >= 0) {
                    const { id, files } = action.payload.data;
                    state.messages[messageIndex].id = id;
                    state.messages[messageIndex].files = files;
                    state.messages[messageIndex].isTemporary = false;
                    state.messages[messageIndex].isSending = false;
                }
            }
        },
        updateThreadMessageAfterSendFailed(state, action) {
            if (state.messages) {
                let messageIndex = state.messages.findIndex(
                    (message) => message.id == action.payload.temporaryId
                );
                if (messageIndex >= 0) {
                    state.messages[messageIndex].isSending = false;
                    state.messages[messageIndex].isFailed = true;
                }
            }
        },
        setThreadMessages(state, action) {
            state.messages = action.payload;
        },
        editThreadMessage(state, action) {
            let messageIndex = state.messages.findIndex(
                (message) => message.id == action.payload.message_id
            );
            if (messageIndex >= 0) {
                state.messages[messageIndex].content = action.payload.content;
                state.messages[messageIndex].is_edited = true;
            }
        },
        addReactionToThreadMessage(state, action) {
            let messageIndex = state.messages.findIndex(
                (message) => message.id == action.payload.message_id
            );
            if (messageIndex >= 0) {
                state.messages[messageIndex].reactions.push(
                    action.payload.data
                );
            }
        },
        removeReactionFromThreadMessage(state, action) {
            let messageIndex = state.messages.findIndex(
                (message) => message.id == action.payload.message_id
            );
            if (messageIndex >= 0) {
                state.messages[messageIndex].reactions = state.messages[
                    messageIndex
                ].reactions.filter(
                    (reaction) => reaction.id != action.payload.reactionId
                );
            }
        },
        deleteThreadMessage(state, action) {
            let messageIndex = state.messages.findIndex(
                (message) => message.id == action.payload
            );
            if (messageIndex >= 0) {
                state.messages[messageIndex].deleted_at =
                    new Date().toUTCString();
                state.messages[messageIndex].reactions = [];

                state.messages[messageIndex].files = [];
                // state.message.thread_messages_count -= 1;
            }
        },

        deleteFileInThread(state, action) {
            //masterMessage

            if (state.message) {
                let fileIndex = state.message.files.findIndex((file) => {
                    return file.id == action.payload;
                });
                if (fileIndex >= 0) {
                    state.message.files[fileIndex].deleted_at =
                        new Date().toUTCString();
                    state.message.files[fileIndex].url = "";
                    state.message.files[fileIndex].type = "";
                    state.message.files[fileIndex].path = "";
                    state.message.files[fileIndex].name = "";
                }
            }
            //
            for (
                let msgIndex = 0;
                msgIndex < state.messages.length;
                msgIndex++
            ) {
                const files = state.messages[msgIndex].files; // Access the 'files' array

                for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
                    if (files[fileIndex].id == action.payload) {
                        files[fileIndex].deleted_at = new Date().toUTCString();
                        files[fileIndex].url = "";
                        files[fileIndex].type = "";
                        files[fileIndex].path = "";
                        files[fileIndex].name = "";

                        return;
                    }
                }
            }
        },
    },
});

// Action creators are generated for each case reducer function
export const {
    setThreadedMessage,
    setMessageId,
    setThreadMessages,
    deleteThreadMessage,
    addThreadMessage,
    editThreadMessage,
    deleteFileInThread,
    addThreadMessages,
    updateThreadMessageAfterSendSuccessfully,
    updateThreadMessageAfterSendFailed,
    addReactionToThreadMessage,
    removeReactionFromThreadMessage,
    editThreadedMessage,
    addReactionToThreadedMessage,
    removeReactionFromThreadedMessage
} = threadSlice.actions;

export default threadSlice.reducer;
