import { createSlice } from "@reduxjs/toolkit";

export const huddleSlice = createSlice({
    name: "huddle",
    initialState: {
        users: [],
        channel: null,
    },
    reducers: {
        toggleHuddle(state, action) {
            if (state.channel) {
                state.channel = null;
                state.users = [];
            } else {
                state.channel = action.payload.channel;
                state.users.push(action.payload.user);
            }
        },
        addHuddleUser(state, action) {
            if (!state.users.find((u) => u.id === action.payload.id))
                state.users.push(action.payload);
        },
        addManyHuddleUsers(state, action) {
            action.payload.forEach((user) => {
                if (!state.users.find((u) => u.id === user.id))
                    state.users.push(action.payload);
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
