import { createSlice } from "@reduxjs/toolkit";

export const mentionSlice = createSlice({
    name: "mention",
    initialState: {
        messageId: null,
        threadMessage: null,
    },
    reducers: {
        setMention(state, action) {
            state.messageId = action.payload?.messageId || null;
            state.threadMessage = action.payload?.threadMessage || null;
        },
    },
});

// Action creators are generated for each case reducer function
export const { setMention } = mentionSlice.actions;

export default mentionSlice.reducer;
