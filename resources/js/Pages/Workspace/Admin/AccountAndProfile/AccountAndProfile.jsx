import React, { createContext, useContext, useState } from "react";
import { LuUser2 } from "react-icons/lu";
import UpdateProfileInformation from "./UpdateProfileInformationForm";
const AccountAndProfileContext = createContext(null);
export default function AccountAndProfile() {
    const [tabIndex, setTabIndex] = useState(0);
    return (
        <AccountAndProfileContext.Provider
            value={{ currentTabIndex: tabIndex, setTabIndex }}
        >
            <div>
                <div className="flex gap-x-3">
                    <LuUser2 className="text-dark-green text-4xl" />
                    <h1 className="text-4xl font-bold text-color-high-emphasis">
                        Account
                    </h1>
                </div>
                <div className="flex mt-4">
                    <TabItem tabIndex={0}>Settings</TabItem>
                    <TabItem tabIndex={1}>Profile</TabItem>
                </div>
                <div className="bg-color-contrast w-3/4  border border-color/15">
                    <UpdateProfileInformation/>
                </div>
            </div>
        </AccountAndProfileContext.Provider>
    );
}
function TabItem({ tabIndex, children }) {
    const { currentTabIndex, setTabIndex } = useContext(
        AccountAndProfileContext
    );
    return (
        <button
            onClick={() => setTabIndex(tabIndex)}
            className={`${
                tabIndex == currentTabIndex
                    ? "text-color-high-emphasis border border-color/15 border-b-color-contrast bg-color-contrast "
                    : "text-link"
            } font-semibold p-4 text-lg relative -mb-[1px]`}
        >
            {children}
        </button>
    );
}
