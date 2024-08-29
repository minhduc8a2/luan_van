import { createSlice } from "@reduxjs/toolkit";

export const channelUsersSlice = createSlice({
    name: "channelUsers",
    initialState: [],
    reducers: {
        setChannelUsers(state, action) {
            return action.payload;
        },
       
    },
});

// Action creators are generated for each case reducer function
export const { setChannelUsers } = channelUsersSlice.actions;

export default channelUsersSlice.reducer;
