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
        // addThreadToMessages(state, action) {
        //     let messageIndex = state.messages.findIndex(
        //         (message) => message.id == action.payload.message_id
        //     );
        //     if (messageIndex >= 0) {

        //         state.messages[messageIndex].threadMessages_count = 1;
        //     }
        // },
        editMessage(state, action) {
            let messageIndex = state.messages.findIndex(
                (message) => message.id == action.payload.message_id
            );
            if (messageIndex >= 0) {
                state.messages[messageIndex].content = action.payload.content;
                state.messages[messageIndex].is_edited = true;
            }
        },
        deleteMessage(state, action) {
            let messageIndex = state.messages.findIndex(
                (message) => message.id == action.payload
            );
            if (messageIndex >= 0) {
                state.messages[messageIndex].deleted_at =
                    new Date().toUTCString();
                state.messages[messageIndex].reactions = [];

                state.messages[messageIndex].files = [];
            }
        },
       
        addThreadMessagesCount(state, action) {
            let messageIndex = state.messages.findIndex(
                (message) => message.id == action.payload
            );
            if (messageIndex >= 0) {
                state.messages[messageIndex].thread_messages_count += 1;
            }
        },
        subtractThreadMessagesCount(state, action) {
            let messageIndex = state.messages.findIndex(
                (message) => message.id == action.payload
            );
            if (messageIndex >= 0) {
                state.messages[messageIndex].thread_messages_count -= 1;
            }
        },

        deleteFile(state, action) {
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
    setMessages,
    addMessage,
    addThreadToMessages,
    addThreadMessagesCount,
    editMessage,
    deleteMessage,
    subtractThreadMessagesCount,
    deleteFile,
} = messagesSlice.actions;

export default messagesSlice.reducer;
