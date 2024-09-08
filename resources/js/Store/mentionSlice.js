import { createSlice } from "@reduxjs/toolkit";

export const mentionSlice = createSlice({
    name: "mention",
    initialState: {
        messageId:null
    },
    reducers: {
        setMessageId(state, action) {
            state.messageId = action.payload;
        },
    },
});

// Action creators are generated for each case reducer function
export const { setMessageId } = mentionSlice.actions;

export default mentionSlice.reducer;
