import React, { createContext, useContext, useState } from "react";
import { LuUser2 } from "react-icons/lu";
import UpdateEmailForm from "./UpdateEmailForm";
import SettingsTabs from "../SettingsTabs";
import UpdatePasswordForm from "./UpdatePasswordForm";
import UpdateProfileForm from "./UpdateProfileForm";
const AccountAndProfileContext = createContext(null);
export default function AccountAndProfile() {
    const [tabIndex, setTabIndex] = useState(0);
    const tabs = ["Settings", "Profile"];
    const contents = [
        <>
            <UpdateEmailForm />
            <hr className="my-4" />
            <UpdatePasswordForm />
            <hr className="my-4" />
        </>,
        <>
            <UpdateProfileForm />
            <hr className="my-4" />
        </>,
    ];
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
                <SettingsTabs tabs={tabs} contents={contents} />
            </div>
        </AccountAndProfileContext.Provider>
    );
}
