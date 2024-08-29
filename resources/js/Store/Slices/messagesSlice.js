import { createSlice } from "@reduxjs/toolkit";

export const messagesSlice = createSlice({
    name: "messages",
    initialState: [],
    reducers: {
        setMessages(state, action) {
            state = action.payload;
        },
       
    },
});

// Action creators are generated for each case reducer function
export const { setMessages } = messagesSlice.actions;

export default messagesSlice.reducer;
