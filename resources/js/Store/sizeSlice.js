import { createSlice } from "@reduxjs/toolkit";

export const sizeSlice = createSlice({
    name: "size",
    initialState: {
        sideBarWidth: 0,

        rightWindowWidth: 500,
        leftWindowWidth: 500,
    },
    reducers: {
        setSideBarWidth(state, action) {
            state.sideBarWidth = action.payload;
        },
        setLeftWindowWidth(state, action) {
            state.leftWindowWidth = action.payload;
            localStorage.setItem("leftWindowWidth", action.payload);
        },
        setRightWindowWidth(state, action) {
            state.rightWindowWidth = action.payload;
            localStorage.setItem("rightWindowWidth", action.payload);
        },
    },
});

// Action creators are generated for each case reducer function
export const { setSideBarWidth, setLeftWindowWidth, setRightWindowWidth } =
    sizeSlice.actions;

export default sizeSlice.reducer;
