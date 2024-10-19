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
            Object.assign(state, action.payload);
        },
        updateCurrentWorkspace(state, action) {
            if (!state.workspace) state.workspace = {};
            Object.assign(state.workspace, action.payload);

            const workspaceIndex = state.workspaces.findIndex(
                (wsp) => wsp.id === action.payload.id
            );
            if (workspaceIndex >= 0) {
                Object.assign(state.workspaces[workspaceIndex], action.payload);
            }
        },

        updateWorkspace(state, action) {
            const workspaceIndex = state.workspaces.findIndex(
                (wsp) => wsp.id === action.payload.id
            );
            if (workspaceIndex >= 0) {
                Object.assign(state.workspaces[workspaceIndex], action.payload);
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
export const {
    setWorkspaceData,
    updateCurrentWorkspace,
    setWorkspaces,
    updateWorkspace,
} = workspaceSlice.actions;

export default workspaceSlice.reducer;
