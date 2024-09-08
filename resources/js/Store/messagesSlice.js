import { createSlice } from "@reduxjs/toolkit";

export const messagesSlice = createSlice({
    name: "messages",
    initialState: {
        messages: [],
    },
    reducers: {
        setMessages(state, action) {
            state.messages = action.payload
        },
    },
});

// Action creators are generated for each case reducer function
export const { setMessages } = messagesSlice.actions;

export default messagesSlice.reducer;
