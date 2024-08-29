import { createSlice } from "@reduxjs/toolkit";

export const huddleSlice = createSlice({
    name: "huddle",
    initialState: {
        show: false,
    },
    reducers: {
        toggleHuddle(state, action) {
            if (action.payload) state.show = action.payload;
            else state.show = !state.show;
        },

    },
});

// Action creators are generated for each case reducer function
export const { toggleHuddle} = huddleSlice.actions;

export default huddleSlice.reducer;
