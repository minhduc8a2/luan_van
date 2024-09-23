import { configureStore } from "@reduxjs/toolkit";
import huddleReducer from "@/Store/huddleSlice";
import sideBarReducer from "@/Store/sideBarSlice";
import OnlineStatusReducer from "./OnlineStatusSlice";
import panelReducer from "./panelSlice";
import activityReducer from "./activitySlice";
import threadReducer from "./threadSlice";
import mentionReducer from "./mentionSlice";
import messagesReducer from "./messagesSlice";
import newMessageCountsMapReducer from "./newMessageCountsMapSlice";
import pageReducer from "./pageSlice";
import notificationPopupReducer from "./notificationPopupSlice";
export const makeStore = () => {
    return configureStore({
        reducer: {
            huddle: huddleReducer,
            sideBar: sideBarReducer,
            onlineStatus: OnlineStatusReducer,
            panel: panelReducer,
            activity: activityReducer,
            thread: threadReducer,
            mention: mentionReducer,
            messages: messagesReducer,
            newMessageCountsMap: newMessageCountsMapReducer,
            page: pageReducer,
            notificationPopup: notificationPopupReducer,
        },
    });
};
