import { createSlice } from "@reduxjs/toolkit";

export const notificationPopupSlice = createSlice({
    name: "notificationPopup",
    initialState: null,
    reducers: {
        setNotificationPopup(state, action) {
            return action.payload;
        },
    },
});

// Action creators are generated for each case reducer function
export const { setNotificationPopup } = notificationPopupSlice.actions;

export default notificationPopupSlice.reducer;
