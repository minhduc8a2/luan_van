import Button from "@/Components/Button";
import CustomedDialog from "@/Components/CustomedDialog";
import TextInput from "@/Components/Input/TextInput";
import OverlayConfirm from "@/Components/Overlay/OverlayConfirm";

import { Link, router, useForm, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";
import RemovePhoto from "./RemovePhoto";
import { useDispatch } from "react-redux";
import { setNotificationPopup } from "@/Store/notificationPopupSlice";
import OverlayLoadingSpinner from "@/Components/Overlay/OverlayLoadingSpinner";
import Image from "@/Components/Image";
import { FaLock } from "react-icons/fa";

export default function EditContactInformation({ user, triggerButton }) {
    const { workspace, default_avatar_url } = usePage().props;
    let [isOpen, setIsOpen] = useState(false);

    const dispatch = useDispatch();
    const { data, setData, patch, processing, errors } = useForm({
        // email: user.email,
        phone: user.phone || "",
    });

    function onSubmit(e) {
        e.preventDefault();
        patch(route("users.update", user.id), {
            preserveState: true,
            only: [],
            onError: (errors) =>
                dispatch(
                    setNotificationPopup({
                        type: "error",
                        messages: Object.values(errors),
                    })
                ),
            onSuccess: () => {
                setIsOpen(false);
            },
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
                            <FaLock className="text-xs"/> Email Address
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
                            value={data.phone}
                            placeholder="Phone number"
                            onChange={(e) => setData("phone", e.target.value)}
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
