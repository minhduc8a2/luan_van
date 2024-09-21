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
} = threadSlice.actions;

export default threadSlice.reducer;
