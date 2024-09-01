import { createSlice } from "@reduxjs/toolkit";

export const sideBarSlice = createSlice({
    name: "sideBar",
    initialState: {
        width: 0,
    },
    reducers: {
        setSideBarWidth(state, action) {
            state.width = action.payload;
        },
    },
});

// Action creators are generated for each case reducer function
export const { setSideBarWidth } = sideBarSlice.actions;

export default sideBarSlice.reducer;
