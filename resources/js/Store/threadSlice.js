import { createSlice } from "@reduxjs/toolkit";

export const threadSlice = createSlice({
    name: "thread",
    initialState: {
        message: null,
        messages: [],
        width: 500,
    },
    reducers: {
        setThreadMessage(state, action) {
            state.message = action.payload;
        },
        addThreadMessage(state, action) {
            state.messages.push(action.payload);
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
                state.messages[messageIndex].thread = null;
                state.messages[messageIndex].files = [];
            }
        },
        setThreadWidth(state, action) {
            localStorage.setItem("threadWidth", action.payload);
            state.width = action.payload;
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
    setThreadMessage,
    setThreadMessages,
    deleteThreadMessage,
    addThreadMessage,
    editThreadMessage,
    setThreadWidth,
    deleteFileInThread,
} = threadSlice.actions;

export default threadSlice.reducer;
