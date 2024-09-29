import { createSlice } from "@reduxjs/toolkit";
import { setRightWindowType } from "./windowTypeSlice";

export const setProfile = (userId) => (dispatch) => {
    dispatch(profileSlice.actions.setUserId(userId));
    if (userId) {
        dispatch(setRightWindowType("profile"));
    } else {
        dispatch(setRightWindowType(""));
    }
};
export const profileSlice = createSlice({
    name: "profile",
    initialState: {
        userId: null,
    },
    reducers: {
        setUserId(state, action) {
            state.userId = action.payload;
        },
        
    },
});

// Action creators are generated for each case reducer function
export const { setUserId } = profileSlice.actions;

export default profileSlice.reducer;
