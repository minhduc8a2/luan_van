import { configureStore } from "@reduxjs/toolkit";
import huddleReducer from "@/Store/huddleSlice";
import sideBarReducer from "@/Store/sideBarSlice";
export const makeStore = () => {
    return configureStore({
        reducer: {
            huddle: huddleReducer,
            sideBar: sideBarReducer,
        },
    });
};
