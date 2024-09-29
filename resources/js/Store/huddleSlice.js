import { createSlice } from "@reduxjs/toolkit";

export const huddleSlice = createSlice({
    name: "huddle",
    initialState: {
        userIds: [],
        joinedUserIds: [],
        channelId: null,
    },
    reducers: {
        toggleHuddle(state, action) {
            if (state.channelId) {
                if (action.payload?.channelId) {
                    if (action.payload.channelId == state.channelId) {
                        state.channelId = null;
                        state.userIds = [];
                        state.joinedUserIds = [];
                    } else {
                        state.channelId = action.payload.channelId;
                        state.userIds = [action.payload.userId];
                        state.joinedUserIds = [action.payload.userId];
                    }
                } else {
                    state.channelId = null;
                    state.userIds = [];
                    state.joinedUserIds = [];
                }
            } else {
                state.channelId = action.payload.channelId;
                state.userIds.push(action.payload.userId);
                state.joinedUserIds.push(action.payload.userId);
            }
        },
        addHuddleUser(state, action) {
            if (!state.userIds.find((id) => id === action.payload)) {
                state.userIds.push(action.payload);
                state.joinedUserIds.push(action.payload);
            }
        },
        addManyHuddleUsers(state, action) {
            action.payload.forEach((user) => {
                if (!state.userIds.find((id) => id === user.id)) {
                    state.userIds.push(user.id);
                    state.joinedUserIds.push(user.id);
                }
            });
        },
        removeHuddleUser(state, action) {
            state.userIds = state.userIds.filter((id) => id != action.payload);
        },
    },
});

// Action creators are generated for each case reducer function
export const {
    toggleHuddle,
    addHuddleUser,
    removeHuddleUser,
    addManyHuddleUsers,
} = huddleSlice.actions;

export default huddleSlice.reducer;
