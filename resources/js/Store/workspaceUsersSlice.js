import { createSlice } from "@reduxjs/toolkit";

export const workspaceUsersSlice = createSlice({
    name: "workspaceUsers",
    initialState: {
        workspaceUsers: [],
    },
    reducers: {
        setWorkspaceUsers(state, action) {
            state.workspaceUsers = action.payload || [];
        },
        updateWorkspaceUserInformation(state, action) {
            const userIndex = state.workspaceUsers.findIndex(
                (user) => user.id === action.payload.id
            );
            if (userIndex >= 0) {
                Object.assign(
                    state.workspaceUsers[userIndex],
                    action.payload.data
                );
            }
        },
        addWorkspaceUser(state, action) {
            if (state.workspaceUsers.some((u) => u.id == action.payload.id))
                return;
            state.workspaceUsers.push(action.payload);
        },
    },
});

// Action creators are generated for each case reducer function
export const {
    setWorkspaceUsers,
    updateWorkspaceUserInformation,
    addWorkspaceUser,
} = workspaceUsersSlice.actions;

export default workspaceUsersSlice.reducer;
