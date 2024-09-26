import { createSlice } from "@reduxjs/toolkit";

export const mediaSlice = createSlice({
    name: "media",
    initialState: {
        url: null,
        type: "image",
        name: "",
    },
    reducers: {
        setMedia(state, action) {
            state.url = action.payload.url;
            state.type = action.payload.type;
            state.name = action.payload.name;
        },
    },
});

// Action creators are generated for each case reducer function
export const { setMedia } = mediaSlice.actions;

export default mediaSlice.reducer;
