import { createSlice } from "@reduxjs/toolkit";

export const threadSlice = createSlice({
    name: "thread",
    initialState: {
        message:null
    },
    reducers: {
        setThreadMessage(state, action) {
            state.message = action.payload
        },
    },
});

// Action creators are generated for each case reducer function
export const { setThreadMessage } = threadSlice.actions;

export default threadSlice.reducer;
