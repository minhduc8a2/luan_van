import { createSlice } from "@reduxjs/toolkit";

export const pageSlice = createSlice({
    name: "page",
    initialState: {
        name: "normal",
    },
    reducers: {
        setPageName(state, action) {
            state.name = action.payload;
        },
    },
});

// Action creators are generated for each case reducer function
export const { setPageName } = pageSlice.actions;

export default pageSlice.reducer;
