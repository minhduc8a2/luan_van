import { createSlice } from "@reduxjs/toolkit";

export const panelSlice = createSlice({
    name: "panel",
    initialState: {
        type: "home",
        width: 500,
    },
    reducers: {
        setPanelType(state, action) {
            state.type = action.payload;
        },
        setPanelWidth(state, action) {
            state.width = action.payload;
            localStorage.setItem("panelWidth", action.payload);
        },
    },
});

// Action creators are generated for each case reducer function
export const { setPanelType, setPanelWidth } = panelSlice.actions;

export default panelSlice.reducer;
