import { createSlice } from "@reduxjs/toolkit";

export const joinedChannelIdsSlice = createSlice({
    name: "joinedChannelIds",
    initialState: {
        joinedChannelIds: {},
    },
    reducers: {
        setJoinedChannelIds(state, action) {
            action.payload.data.forEach((id) => {
                state.joinedChannelIds[id] = true;
            });
        },
        addJoinedChannelId(state, action) {
            state.joinedChannelIds[action.payload.id] = true;
        },
        removeJoinedChannelId(state, action) {
            state.joinedChannelIds[action.payload.id] = false;
        },
    },
});

// Action creators are generated for each case reducer function
export const {
    setJoinedChannelIds,
    addJoinedChannelId,
    removeJoinedChannelId,
} = joinedChannelIdsSlice.actions;

export default joinedChannelIdsSlice.reducer;
