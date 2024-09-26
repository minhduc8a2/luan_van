import { createSlice } from "@reduxjs/toolkit";

export const notificationPopupSlice = createSlice({
    name: "notificationPopup",
    initialState: {
        type: null,
        messages: [],
    },
    reducers: {
        setNotificationPopup(state, action) {
            state.type = action.payload?.type;
            state.messages = action.payload?.messages || [];
        },
    },
});

// Action creators are generated for each case reducer function
export const { setNotificationPopup } = notificationPopupSlice.actions;

export default notificationPopupSlice.reducer;
