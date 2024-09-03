import { createSlice } from "@reduxjs/toolkit";

export const huddleSlice = createSlice({
    name: "huddle",
    initialState: {
        users: [],
        joinedUsers: [],
        channel: null,
    },
    reducers: {
        toggleHuddle(state, action) {
            if (state.channel) {
                if (action.payload?.channel) {
                    if (action.payload.channel.id == state.channel.id) {
                        state.channel = null;
                        state.users = [];
                        state.joinedUsers = [];
                    } else {
                        state.channel = action.payload.channel;
                        state.users = [action.payload.user];
                        state.joinedUsers = [action.payload.user];
                    }
                } else {
                    state.channel = null;
                    state.users = [];
                    state.joinedUsers = [];
                }
            } else {
                state.channel = action.payload.channel;
                state.users.push(action.payload.user);
                state.joinedUsers.push(action.payload.user);
            }
        },
        addHuddleUser(state, action) {
            if (!state.users.find((u) => u.id === action.payload.id)) {
                state.users.push(action.payload);
                state.joinedUsers.push(action.payload);
            }
        },
        addManyHuddleUsers(state, action) {
            action.payload.forEach((user) => {
                if (!state.users.find((u) => u.id === user.id)) {
                    state.users.push(user);
                    state.joinedUsers.push(user);
                }
            });
        },
        removeHuddleUser(state, action) {
            state.users = state.users.filter((u) => u.id != action.payload.id);
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
