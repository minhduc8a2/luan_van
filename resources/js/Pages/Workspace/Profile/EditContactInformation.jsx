import Button from "@/Components/Button";
import CustomedDialog from "@/Components/CustomedDialog";
import TextInput from "@/Components/Input/TextInput";

import { useState } from "react";

import { FaLock } from "react-icons/fa";
import { useCustomedForm } from "@/helpers/customHooks";

export default function EditContactInformation({ user, triggerButton }) {
    let [isOpen, setIsOpen] = useState(false);

    const {
        getValues,
        setValues,
        loading: processing,
        submit,
    } = useCustomedForm(
        {
            phone: user.phone || "",
        },
        {
            method: "patch",
            url: route("users.update", user.id),
            hasEchoHeader: true,
        }
    );

    function onSubmit(e) {
        e.preventDefault();
        submit().then(() => {
            setIsOpen(false);
        });
    }
    return (
        <>
            <div onClick={() => setIsOpen(true)}>{triggerButton}</div>
            <CustomedDialog isOpen={isOpen} onClose={() => setIsOpen(false)}>
                <CustomedDialog.Title>
                    Edit Contact information
                </CustomedDialog.Title>
                <div className="flex-1">
                    <div className="">
                        <label
                            htmlFor="profile-email"
                            className="font-bold gap-x-1 mb-4 flex items-baseline"
                        >
                            <FaLock className="text-xs" /> Email Address
                        </label>
                        <TextInput
                            disabled
                            id="profile-email"
                            value={user.email}
                            placeholder="Full name"
                            // onChange={(e) => setData("email", e.target.value)}
                        />
                    </div>
                    <div className="mt-4">
                        <label
                            htmlFor="profile-phone"
                            className="font-bold block mb-4"
                        >
                            Phone
                        </label>
                        <TextInput
                            id="profile-phone"
                            value={getValues().phone}
                            placeholder="Phone number"
                            onChange={(e) => setValues("phone", e.target.value)}
                        />
                    </div>
                    <div className="flex gap-x-4 mt-4">
                        <Button onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button
                            className="!bg-dark-green"
                            loading={processing}
                            onClick={onSubmit}
                        >
                            Save Changes
                        </Button>
                    </div>
                </div>
            </CustomedDialog>
        </>
    );
}
