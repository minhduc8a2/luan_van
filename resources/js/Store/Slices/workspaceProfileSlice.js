import { createSlice } from "@reduxjs/toolkit";

export const workspaceProfileSlice = createSlice({
    name: "workspaceProfile",
    initialState: null,
    reducers: {
        setWorkspaceProfile(state, action) {
            return action.payload;
        },
        setSideBarWidth(state, action) {
            state.sideBarWidth = action.payload;
        },

        updateUsersOnlineStatus(state, action) {
            const users = action.payload;
            state.users = state.users.map((user) => {
                if (users.find((u) => u.id == user.id)) user.online = true;
                return user;
            });
        },

        addJustJoinedUserToWorkspace(state, action) {
            const user = action.payload;
            const foundUserIndex = state.users.findIndex(
                (u) => u.id == user.id
            );
            if (foundUserIndex < 0) state.users.push({ ...user, online: true });
            else {
                state.users[foundUserIndex].online = true;
            }
        },
        removeJustLeavedUserToWorkspace(state, action) {
            const user = action.payload;
            const foundUserIndex = state.users.findIndex(
                (u) => u.id == user.id
            );
            if (foundUserIndex >= 0) state.users[foundUserIndex].online = false;
        },
        setSideBarWidth(state, action) {
            state.sideBarWidth = action.payload;
        },

        setChannels(state, action) {
            state.channels = action.payload;
        },
        setDirectChannels(state, action) {
            state.directChannels = action.payload;
        },
    },
});

// Action creators are generated for each case reducer function
export const {
    setWorkspaceProfile,
    setSideBarWidth,
    updateUsersOnlineStatus,
    addJustJoinedUserToWorkspace,
    removeJustLeavedUserToWorkspace,
    setChannels,
    setDirectChannels,
} = workspaceProfileSlice.actions;

export default workspaceProfileSlice.reducer;
