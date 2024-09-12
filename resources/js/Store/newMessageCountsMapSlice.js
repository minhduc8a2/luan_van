import { createSlice } from "@reduxjs/toolkit";

export const newMessageCountsMapSlice = createSlice({
    name: "newMessageCounts",
    initialState: {},
    reducers: {
        initMessageCountForChannel(state, action) {
            state[action.payload.id] = action.payload.unread_messages_count;
        },
        addMessageCountForChannel(state, action) {
            if (state[action.payload.id]) state[action.payload.id] += 1;
            else state[action.payload.id] = 1;
        },
        resetMessageCountForChannel(state, action) {
            state[action.payload.id] = 0;
        },
    },
});

// Action creators are generated for each case reducer function
export const { initMessageCountForChannel, addMessageCountForChannel, resetMessageCountForChannel } =
    newMessageCountsMapSlice.actions;

export default newMessageCountsMapSlice.reducer;
