import { createSlice } from "@reduxjs/toolkit";

export const channelsDataSlice = createSlice({
    name: "channelsData",
    initialState: {},
    reducers: {
        setchannelData(state, action) {
            if (!state[action.payload.id]) {
                state[action.payload.id] = {};
            }
            Object.keys(action.payload.data).forEach((key) => {
                state[action.payload.id][key] = action.payload.data[key];
            });
        },
    },
});

// Action creators are generated for each case reducer function
export const { setchannelData } = channelsDataSlice.actions;

export default channelsDataSlice.reducer;
