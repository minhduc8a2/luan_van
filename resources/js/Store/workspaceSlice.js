import { createSlice } from "@reduxjs/toolkit";

export const workspaceSlice = createSlice({
    name: "workspace",
    initialState: {
        workspaces: [],
        newNotificationsCount:0,
        workspacePermissions:[]
    },
    reducers: {
        setWorkspaceData(state, action) {
            state.workspaces = action.payload.workspaces;
            state.newNotificationsCount = action.payload.newNotificationsCount;
            state.workspacePermissions = action.payload.workspacePermissions;
        },
        
    },
});

// Action creators are generated for each case reducer function
export const { setWorkspaceData } =
    workspaceSlice.actions;

export default workspaceSlice.reducer;
