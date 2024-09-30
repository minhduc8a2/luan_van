import { createSlice } from "@reduxjs/toolkit";
import { removeChannelData } from "./channelsDataSlice";

export const removeChannel = (channelId) => (dispatch) => {
    dispatch(removeChannelData({ id: channelId }));
    dispatch(removeChannelFromChannelsStore(channelId));
};
export const channelsSlice = createSlice({
    name: "channels",
    initialState: {
        channels: [],
    },
    reducers: {
        setChannels(state, action) {
            state.channels = action.payload;
            state.channels.sort((a, b) => a.id - b.id);
        },
        addNewChannelToChannelsStore(state, action) {
            if (state.channels.some((cn) => cn.id == action.payload.id)) return;
            state.channels.push(action.payload);
            state.channels.sort((a, b) => a.id - b.id);
        },
        removeChannelFromChannelsStore(state, action) {
            console.log("removeChannelFromChannelsStore");
            state.channels = state.channels.filter(
                (cn) => cn.id != action.payload
            );
        },
        updateChannelInformation(state, action) {
            const channelIndex = state.channels.findIndex(
                (channel) => channel.id === action.payload.id
            );
            if (channelIndex >= 0) {
                Object.keys(action.payload.data).forEach((key) => {
                    if (key == "id") return;
                    state.channels[channelIndex][key] =
                        action.payload.data[key];
                });
            }
        },

        addMessageCountForChannel(state, action) {
            const channelIndex = state.channels.findIndex(
                (channel) => channel.id === action.payload.id
            );
            if (channelIndex >= 0) {
                state.channels[channelIndex].unread_messages_count += 1;
            }
        },
        resetMessageCountForChannel(state, action) {
            const channelIndex = state.channels.findIndex(
                (channel) => channel.id === action.payload.id
            );
            if (channelIndex >= 0) {
                state.channels[channelIndex].unread_messages_count = 0;
            }
        },
    },
});

// Action creators are generated for each case reducer function
export const {
    setChannels,
    updateChannelInformation,
    addMessageCountForChannel,
    resetMessageCountForChannel,
    addNewChannelToChannelsStore,
    removeChannelFromChannelsStore,
} = channelsSlice.actions;

export default channelsSlice.reducer;
