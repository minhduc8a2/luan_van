import Button from "@/Components/Button";
import CustomedDialog from "@/Components/CustomedDialog";
import TextInput from "@/Components/Input/TextInput";
import OverlayConfirm from "@/Components/Overlay/OverlayConfirm";

import { Link, router, useForm, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";
import RemovePhoto from "./RemovePhoto";
import { useDispatch, useSelector } from "react-redux";
import { setNotificationPopup } from "@/Store/notificationPopupSlice";
import OverlayLoadingSpinner from "@/Components/Overlay/OverlayLoadingSpinner";
import Image from "@/Components/Image";

export default function EditProfile({ user, triggerButton }) {
    const { workspace } = usePage().props;
    const { default_avatar_url } = useSelector((state) => state.workspace);
    let [isOpen, setIsOpen] = useState(false);

    const [avatarFile, setAvatarFile] = useState(null);
    const [uploadingAvatarFile, setUploadingAvatarFile] = useState(false);
    const dispatch = useDispatch();
    const { data, setData, patch, processing, errors } = useForm({
        name: user.name,
        display_name: user.display_name || "",
    });
    useEffect(() => {
        if (!avatarFile) return;

        router.post(
            route("users.updateAvatar", user.id),
            { avatarFile, workspaceId: workspace.id },
            {
                only: [],
                preserveState: true,
                onStart: () => {
                    setUploadingAvatarFile(true);
                },
                onError: (errors) =>
                    dispatch(
                        setNotificationPopup({
                            type: "error",
                            message: errors.server,
                        })
                    ),

                onFinish: () => {
                    setUploadingAvatarFile(false);
                },
            }
        );
    }, [avatarFile, data]);
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
            <CustomedDialog
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                className="w-[700px]"
            >
                <CustomedDialog.Title>Edit Profile</CustomedDialog.Title>
                <div className="flex gap-x-8">
                    <div className="flex-1">
                        <div className="">
                            <label
                                htmlFor="profile-fullname"
                                className="font-bold block mb-4"
                            >
                                Full name
                            </label>
                            <TextInput
                                id="profile-fullname"
                                value={data.name}
                                placeholder="Full name"
                                onChange={(e) =>
                                    setData("name", e.target.value)
                                }
                            />
                        </div>
                        <div className="mt-4">
                            <label
                                htmlFor="profile-display-name"
                                className="font-bold block mb-4"
                            >
                                Display name
                            </label>
                            <TextInput
                                id="profile-display-name"
                                value={data.display_name}
                                placeholder="Display name"
                                onChange={(e) =>
                                    setData("display_name", e.target.value)
                                }
                            />
                        </div>
                        <div className="flex gap-x-4 mt-4">
                            <Button onClick={() => setIsOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                className="!bg-dark-green"
                                loading={processing}
                                onClick={onSubmit}
                            >
                                Save Changes
                            </Button>
                        </div>
                    </div>
                    <div className="w-48">
                        <h3 className="font-bold mb-4">Profile photo</h3>

                        <Image
                            url={user.avatar_url || default_avatar_url}
                            dimensions="w-48 h-48"
                        />
                        <label
                            className=" mt-4 text-center relative font-bold  block rounded-lg cursor-pointer border border-white/15 py-2 "
                            htmlFor="profile-choose-photo"
                        >
                            {uploadingAvatarFile && <OverlayLoadingSpinner />}

                            <span
                                className={
                                    uploadingAvatarFile ? "invisible" : ""
                                }
                            >
                                {" "}
                                Upload photo
                            </span>
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            id="profile-choose-photo"
                            className="hidden"
                            onChange={(e) => {
                                if (e.target.files.length > 0) {
                                    setAvatarFile(e.target.files[0]);
                                }
                            }}
                        />

                        <RemovePhoto user={user} />
                    </div>
                </div>
            </CustomedDialog>
        </>
    );
}
