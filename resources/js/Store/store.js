import { configureStore } from "@reduxjs/toolkit";
import huddleReducer from "@/Store/huddleSlice";
import sideBarReducer from "@/Store/sideBarSlice";
import OnlineStatusReducer from "./onlineStatusSlice";
import panelReducer from "./panelSlice";
import activityReducer from "./activitySlice";
export const makeStore = () => {
    return configureStore({
        reducer: {
            huddle: huddleReducer,
            sideBar: sideBarReducer,
            onlineStatus: OnlineStatusReducer,
            panel: panelReducer,
            activity: activityReducer,
        },
    });
};
