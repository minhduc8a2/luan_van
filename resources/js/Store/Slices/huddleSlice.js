import { createSlice } from "@reduxjs/toolkit";

export const huddleSlice = createSlice({
    name: "huddle",
    initialState: {
        show: false,
        channel: null,
    },
    reducers: {
        toggleHuddle(state, action) {
            if(state.channel) state.channel = null;
            else state.channel = action.payload
        },
    },
});

// Action creators are generated for each case reducer function
export const { toggleHuddle } = huddleSlice.actions;

export default huddleSlice.reducer;
