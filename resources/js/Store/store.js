import { configureStore } from "@reduxjs/toolkit";
import channelReducer from "@/Store/Slices/channelSlice";
import channelUsersReducer from "@/Store/Slices/channelUsersSlice";
import huddleReducer from "@/Store/Slices/huddleSlice";
import messagesReducer from "@/Store/Slices/messagesSlice";
import workspaceProfileReducer from "@/Store/Slices/workspaceProfileSlice";

export const makeStore = () => {
    return configureStore({
        reducer: {
            huddle: huddleReducer,
            channel: channelReducer,
            channelUsers: channelUsersReducer,
            messages: messagesReducer,
            workspaceProfile: workspaceProfileReducer,
        },
    });
};
