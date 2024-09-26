import { configureStore } from "@reduxjs/toolkit";
import huddleReducer from "@/Store/huddleSlice";
import sizeReducer from "@/Store/sizeSlice";
import OnlineStatusReducer from "./OnlineStatusSlice";
import panelReducer from "./panelSlice";
import activityReducer from "./activitySlice";
import threadReducer from "./threadSlice";
import mentionReducer from "./mentionSlice";
import messagesReducer from "./messagesSlice";
import newMessageCountsMapReducer from "./newMessageCountsMapSlice";
import pageReducer from "./pageSlice";
import notificationPopupReducer from "./notificationPopupSlice";
import mediaReducer from "./mediaSlice";
import profileReducer from "./profileSlice";
import windowTypeReducer from "./windowTypeSlice";
export const makeStore = () => {
    return configureStore({
        reducer: {
            huddle: huddleReducer,
            size: sizeReducer,
            onlineStatus: OnlineStatusReducer,
            panel: panelReducer,
            activity: activityReducer,
            thread: threadReducer,
            mention: mentionReducer,
            messages: messagesReducer,
            newMessageCountsMap: newMessageCountsMapReducer,
            page: pageReducer,
            notificationPopup: notificationPopupReducer,
            media: mediaReducer,
            profile: profileReducer,
            windowType: windowTypeReducer,
        },
    });
};
