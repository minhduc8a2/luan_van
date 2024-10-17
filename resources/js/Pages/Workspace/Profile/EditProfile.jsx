import Button from "@/Components/Button";
import CustomedDialog from "@/Components/CustomedDialog";
import TextInput from "@/Components/Input/TextInput";
import { useEffect, useState } from "react";
import RemovePhoto from "./RemovePhoto";
import { useDispatch } from "react-redux";
import LoadingSpinner from "@/Components/LoadingSpinner";
import Image from "@/Components/Image";
import defaultAvatar from "@/../images/default_avatar.png";
import { useCustomedForm } from "@/helpers/customHooks";
import useErrorHandler from "@/helpers/useErrorHandler";
import { useParams } from "react-router-dom";
import useSuccessHandler from "@/helpers/useSuccessHandler";
export default function EditProfile({ user, triggerButton }) {
    const { workspaceId } = useParams();

    let [isOpen, setIsOpen] = useState(false);

    const [avatarFile, setAvatarFile] = useState(null);
    const [uploadingAvatarFile, setUploadingAvatarFile] = useState(false);
    const successHandler = useSuccessHandler("Update profile successfully!");
    const errorHandler = useErrorHandler();
    const { getValues, setValues, submit, loading, reset } = useCustomedForm(
        {
            email: user.email,
            name: user.name,
            phone: user.phone,
            display_name: user.display_name || "",
        },
        { url: route("profile.update"), method: "patch" }
    );

    useEffect(() => {
        if (!avatarFile) return;

        setUploadingAvatarFile(true);
        console.log(avatarFile);
        axios
            .postForm(route("users.updateAvatar", user.id), {
                avatarFile,
                workspaceId: workspaceId,
            })
            .catch(errorHandler)
            .finally(() => {
                setUploadingAvatarFile(false);
            });
    }, [avatarFile]);
    function onSubmit(e) {
        e.preventDefault();
        submit()
            .then(successHandler)
            .then(() => {
                setIsOpen(false);
            });
    }
    return (
        <>
            <div
                onClick={() => {
                    setIsOpen(true);
                    reset();
                }}
            >
                {triggerButton}
            </div>
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
                                value={getValues().name}
                                placeholder="Full name"
                                onChange={(e) =>
                                    setValues("name", e.target.value)
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
                                value={getValues().display_name}
                                placeholder="Display name"
                                onChange={(e) =>
                                    setValues("display_name", e.target.value)
                                }
                            />
                        </div>
                        <div className="flex gap-x-4 mt-4">
                            <Button onClick={() => setIsOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                type="green"
                                loading={loading}
                                onClick={onSubmit}
                            >
                                Save Changes
                            </Button>
                        </div>
                    </div>
                    <div className="w-48">
                        <h3 className="font-bold mb-4">Profile photo</h3>

                        <Image
                            url={user.avatar_url || defaultAvatar}
                            dimensions="w-48 h-48"
                        />
                        <label
                            className=" mt-4 text-center relative font-bold  block rounded-lg cursor-pointer border border-color/15 py-2 "
                            htmlFor="profile-choose-photo"
                        >
                            {uploadingAvatarFile && <LoadingSpinner />}

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
