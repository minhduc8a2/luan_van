import { createSlice } from "@reduxjs/toolkit";
import { setRightWindowType } from "./windowTypeSlice";

export const setProfile = (user) => (dispatch) => {
    dispatch(profileSlice.actions.setUser(user));
    if (user) {
        dispatch(setRightWindowType("profile"));
    } else {
        dispatch(setRightWindowType(""));
    }
};
export const profileSlice = createSlice({
    name: "profile",
    initialState: {
        user: null,
    },
    reducers: {
        setUser(state, action) {
            state.user = action.payload;
        },
    },
});

// Action creators are generated for each case reducer function
export const { setProfileWidth, setUser } = profileSlice.actions;

export default profileSlice.reducer;
