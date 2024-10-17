import { createSlice } from "@reduxjs/toolkit";

export const workspaceSlice = createSlice({
    name: "workspace",
    initialState: {
        workspaces: [],
        newNotificationsCount: 0,
        workspacePermissions: [],

        publicAppUrl: "",
        workspace: null,
    },
    reducers: {
        setWorkspaceData(state, action) {
            Object.keys(action.payload).forEach((key) => {
                state[key] = action.payload[key];
            });
        },
        updateWorkspaceName(state, action) {
            if (state.workspace) {
                state.workspace.name = action.payload.name;
            }
        },
        setWorkspaces(state, action) {
            if (action.payload.workspaces) {
                state.workspaces = action.payload.workspaces;
            }
        },
    },
});

// Action creators are generated for each case reducer function
export const { setWorkspaceData, updateWorkspaceName, setWorkspaces } = workspaceSlice.actions;

export default workspaceSlice.reducer;
