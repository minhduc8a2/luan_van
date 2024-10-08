import { createSlice } from "@reduxjs/toolkit";

export const activitySlice = createSlice({
    name: "activity",
    initialState: { notifications: [], new_count: 0 },
    reducers: {
        setActivity(state, action) {
            state.notifications = [...action.payload];
        },
        setNotificationsCount(state, action) {
            state.new_count = action.payload;
        },
        addNotificationCount(state, action) {
            state.new_count += 1;
            console.log("in add count", state.new_count);
        },
        addActivity(state, action) {
            state.notifications.unshift(action.payload);
            state.new_count += 1;
            console.log("in add activity", state.new_count);
        },
        pushActivity(state, action) {
            state.notifications.push(action.payload);
        },
        pushManyActivity(state, action) {
            state.notifications = [...state.notifications, ...action.payload];
        },
        setAsRead(state, action) {
            state.notifications = state.notifications.map((notification) => ({
                ...notification,
                read_at: notification.read_at
                    ? notification.read_at
                    : new Date().toUTCString(),
            }));
            state.new_count -= 1;
        },
        setAsView(state, action) {
            const index = state.notifications.findIndex(
                (notification) => notification.id == action.payload
            );
            if (index >= 0) {
                state.notifications[index].view_at = new Date().toUTCString();
                state.notifications[index].read_at = state.notifications[index]
                    .read_at
                    ? state.notifications[index].read_at
                    : new Date().toUTCString();
                state.new_count -= 1;
            }
        },
    },
});

// Action creators are generated for each case reducer function
export const {
    setActivity,
    addActivity,
    setAsRead,
    setAsView,
    pushActivity,
    pushManyActivity,
    setNotificationsCount,
    addNotificationCount,
} = activitySlice.actions;

export default activitySlice.reducer;
