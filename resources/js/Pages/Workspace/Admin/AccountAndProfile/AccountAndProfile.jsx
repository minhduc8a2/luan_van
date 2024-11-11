
import { LuUser2 } from "react-icons/lu";
import UpdateEmailForm from "./UpdateEmailForm";
import SettingsTabs from "../SettingsTabs";
import UpdatePasswordForm from "./UpdatePasswordForm";
import UpdateProfileForm from "./UpdateProfileForm";
import { Head } from "@inertiajs/react";

export default function AccountAndProfile() {
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
        <div className="pl-16 pt-16">
             <Head title="Account" />
            <div className="flex gap-x-3">
                <LuUser2 className="text-dark-green text-4xl" />
                <h1 className="text-4xl font-bold text-color-high-emphasis">
                    Account
                </h1>
            </div>
            <SettingsTabs tabs={tabs} contents={contents} />
        </div>
    );
}
