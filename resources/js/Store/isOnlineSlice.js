import { createSlice } from "@reduxjs/toolkit";

export const isOnlineSlice = createSlice({
    name: "isOnline",
    initialState: {
        isOnline:false,
    },
    reducers: {
        setIsOnline(state, action) {
            state.isOnline = action.payload.isOnline;
        },
    },
});

// Action creators are generated for each case reducer function
export const { setIsOnline } = isOnlineSlice.actions;

export default isOnlineSlice.reducer;
