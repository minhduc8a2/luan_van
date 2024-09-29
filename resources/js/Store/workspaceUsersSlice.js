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
            if (userIndex >= 0) {
                Object.keys(action.payload.data).forEach((key) => {
                    if (key == "id") return;
                    state.workspaceUsers[userIndex][key] =
                        action.payload.data[key];
                });
            }
        },
    },
});

// Action creators are generated for each case reducer function
export const { setWorkspaceUsers, updateWorkspaceUserInformation } =
    workspaceUsersSlice.actions;

export default workspaceUsersSlice.reducer;
