import { createSlice } from "@reduxjs/toolkit";

export const workspaceUsersSlice = createSlice({
    name: "workspaceUsers",
    initialState: {
        workspaceUsers: [],
    },
    reducers: {
        setWorkspaceUsers(state, action) {
            state.workspaceUsers = action.payload;
        },
        updateWorkspaceUserInformation(state, action) {
            const userIndex = state.workspaceUsers.findIndex(
                (user) => user.id === action.payload.id
            );
            Object.keys(action.payload).forEach((key) => {
                if (key != "id") {
                    state.user[key] = action.payload[key];
                }
            });
        },
    },
});

// Action creators are generated for each case reducer function
export const { setWorkspaceUsers, updateWorkspaceUserInformation } =
    workspaceUsersSlice.actions;

export default workspaceUsersSlice.reducer;
