import { createSlice } from "@reduxjs/toolkit";

export const messagesSlice = createSlice({
    name: "messages",
    initialState: [],
    reducers: {
        setMessages(state, action) {
            return action.payload;
        },
        addMessage(state, action) {
            return [...state, action.payload];
        },
    },
});

// Action creators are generated for each case reducer function
export const { setMessages, addMessage } = messagesSlice.actions;

export default messagesSlice.reducer;
