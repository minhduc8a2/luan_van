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
    },
});

// Action creators are generated for each case reducer function
export const { setChannels, updateChannelInformation } = channelsSlice.actions;

export default channelsSlice.reducer;
