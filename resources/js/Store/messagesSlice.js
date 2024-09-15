import { createSlice } from "@reduxjs/toolkit";

export const messagesSlice = createSlice({
    name: "messages",
    initialState: {
        messages: [],
    },
    reducers: {
        setMessages(state, action) {
            state.messages = action.payload;
        },
        addMessage(state, action) {
            state.messages.push(action.payload);
        },
        addThreadToMessages(state, action) {
            let messageIndex = state.messages.findIndex(
                (message) => message.id == action.payload.message_id
            );
            if (messageIndex >= 0) {
                state.messages[messageIndex].thread = action.payload;
                state.messages[messageIndex].thread.messages_count = 1;
            }
        },
        editMessage(state, action) {
            let messageIndex = state.messages.findIndex(
                (message) => message.id == action.payload.message_id
            );
            if (messageIndex >= 0) {
                state.messages[messageIndex].content = action.payload.content;
                state.messages[messageIndex].is_edited = true;
            }
        },
        addThreadMessagesCount(state, action) {
            let messageIndex = state.messages.findIndex(
                (message) => message.id == action.payload
            );
            if (messageIndex >= 0) {
                state.messages[messageIndex].thread.messages_count += 1;
            }
        },
    },
});

// Action creators are generated for each case reducer function
export const {
    setMessages,
    addMessage,
    addThreadToMessages,
    addThreadMessagesCount,
    editMessage,
} = messagesSlice.actions;

export default messagesSlice.reducer;
