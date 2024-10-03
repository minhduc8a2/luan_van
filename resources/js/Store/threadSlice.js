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
        setMessageId(state, action) {
            state.messageId = action.payload;
            if (!state.messageId) state.message = null;
        },
        addThreadMessage(state, action) {
            state.message.thread_messages_count += 1;
            state.messages.push(action.payload);
        },
        addThreadMessages(state, action) {
           
            if (action.payload.position == "top") {
                state.messages = [...action.payload.data, ...state.messages];
            } else {
                state.messages = [...state.messages, ...action.payload.data];
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
} = threadSlice.actions;

export default threadSlice.reducer;
