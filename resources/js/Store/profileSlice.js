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
        updateProfileInformation(state, action) {
            Object.keys(action.payload).forEach((key) => {
                state.user[key] = action.payload[key];
            });
        },
    },
});

// Action creators are generated for each case reducer function
export const { updateProfileInformation, setUser } = profileSlice.actions;

export default profileSlice.reducer;
