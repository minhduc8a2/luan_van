import { createSlice } from "@reduxjs/toolkit";

export const invitationsSlice = createSlice({
    name: "invitations",
    initialState: {
        invitationsMap: {},
    },
    reducers: {
        setInvitations(state, action) {
            action.payload.forEach(
                (invitation) =>
                    (state.invitationsMap[invitation.id] = invitation)
            );
        },

        addInvitation(state, action) {
            state.invitationsMap[action.payload.id] = action.payload;
        },
        updateInvitation(state, action) {
            state.invitationsMap[action.payload.id] = action.payload;
        },
        removeInvitation(state, action) {
            delete state.invitationsMap[action.payload.id];
        },
    },
});

// Action creators are generated for each case reducer function
export const {
    setInvitations,
    addInvitation,
    removeInvitation,
    updateInvitation,
} = invitationsSlice.actions;

export default invitationsSlice.reducer;
