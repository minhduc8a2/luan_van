import { configureStore } from "@reduxjs/toolkit";
import huddleReducer from "@/Store/huddleSlice";
import sizeReducer from "@/Store/sizeSlice";
import OnlineStatusReducer from "./OnlineStatusSlice";
import activityReducer from "./activitySlice";
import threadReducer from "./threadSlice";
import mentionReducer from "./mentionSlice";
import messagesReducer from "./messagesSlice";

import pageReducer from "./pageSlice";
import notificationPopupReducer from "./notificationPopupSlice";
import mediaReducer from "./mediaSlice";
import profileReducer from "./profileSlice";
import windowTypeReducer from "./windowTypeSlice";
import workspaceUsersReducer from "./workspaceUsersSlice";
import channelsReducer from "./channelsSlice";
import workspaceReducer from "./workspaceSlice";
export const makeStore = () => {
    return configureStore({
        reducer: {
            huddle: huddleReducer,
            size: sizeReducer,
            onlineStatus: OnlineStatusReducer,
            activity: activityReducer,
            thread: threadReducer,
            mention: mentionReducer,
            messages: messagesReducer,

            page: pageReducer,
            notificationPopup: notificationPopupReducer,
            media: mediaReducer,
            profile: profileReducer,
            windowType: windowTypeReducer,
            workspaceUsers: workspaceUsersReducer,
            channels: channelsReducer,
            workspace: workspaceReducer,
        },
    });
};
