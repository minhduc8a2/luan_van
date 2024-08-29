import { createSlice } from "@reduxjs/toolkit";

export const channelSlice = createSlice({
    name: "channel",
    initialState: null,
    reducers: {
        setChannel(state, action) {
            return action.payload;
        },
    },
});

// Action creators are generated for each case reducer function
export const { setChannel } = channelSlice.actions;

export default channelSlice.reducer;
