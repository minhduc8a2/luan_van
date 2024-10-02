import { createSlice } from "@reduxjs/toolkit";

export const workspaceSlice = createSlice({
    name: "workspace",
    initialState: {
        workspaces: [],
        newNotificationsCount: 0,
        workspacePermissions: [],
        default_avatar_url: "",
        publicAppUrl: "",
        workspace:null,
    },
    reducers: {
        setWorkspaceData(state, action) {
            Object.keys(action.payload).forEach((key) => {
                state[key] = action.payload[key];
            });
        },
    },
});

// Action creators are generated for each case reducer function
export const { setWorkspaceData } = workspaceSlice.actions;

export default workspaceSlice.reducer;
