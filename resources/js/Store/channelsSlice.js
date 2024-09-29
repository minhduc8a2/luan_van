import { createSlice } from "@reduxjs/toolkit";

export const channelsSlice = createSlice({
    name: "channels",
    initialState: {
        channels: [],
    },
    reducers: {
        setChannels(state, action) {
            state.channels = action.payload;
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
export const { setChannels, updateChannelInformation,addMessageCountForChannel,resetMessageCountForChannel } = channelsSlice.actions;

export default channelsSlice.reducer;
