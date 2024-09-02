import { configureStore } from "@reduxjs/toolkit";
import huddleReducer from "@/Store/huddleSlice";
import sideBarReducer from "@/Store/sideBarSlice";
import OnlineStatusReducer from "./OnlineStatusSlice";
export const makeStore = () => {
    return configureStore({
        reducer: {
            huddle: huddleReducer,
            sideBar: sideBarReducer,
            onlineStatus:OnlineStatusReducer
        },
    });
};
