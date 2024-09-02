import { createSlice } from "@reduxjs/toolkit";
import { enableMapSet } from "immer";

enableMapSet();
export const OnlineStatusSlice = createSlice({
    name: "onlineStatus",
    initialState: {},
    reducers: {
        setOnlineStatus(state, action) {
            state[action.payload.user.id] = action.payload.onlineStatus;
        },
        setManyOnline(state, action) {
            action.payload.forEach((user) => {
                state[user.id] = true;
            });
        },
    },
});

// Action creators are generated for each case reducer function
export const { setOnlineStatus, setManyOnline } = OnlineStatusSlice.actions;

export default OnlineStatusSlice.reducer;
