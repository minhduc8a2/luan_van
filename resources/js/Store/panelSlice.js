import { createSlice } from "@reduxjs/toolkit";

export const panelSlice = createSlice({
    name: "panel",
    initialState: {
        type:"home"
    },
    reducers: {
        setPanelType(state, action) {
            state.type = action.payload
        },
    },
});

// Action creators are generated for each case reducer function
export const { setPanelType } = panelSlice.actions;

export default panelSlice.reducer;
