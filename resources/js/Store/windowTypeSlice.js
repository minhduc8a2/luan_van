import { createSlice } from "@reduxjs/toolkit";

export const windowTypeSlice = createSlice({
    name: "windowType",
    initialState: {
        leftWindowType: "",
        rightWindowType: "",
    },
    reducers: {
        setLeftWindowType(state, action) {
            state.leftWindowType = action.payload;
        },
        setRightWindowType(state, action) {
            state.rightWindowType = action.payload;
        },
    },
});

// Action creators are generated for each case reducer function
export const { setLeftWindowType, setRightWindowType } =
    windowTypeSlice.actions;

export default windowTypeSlice.reducer;
