import { useState } from "react";
import copy from "copy-to-clipboard";
import TextArea from "@/Components/Input/TextArea";
import { FaLink } from "react-icons/fa6";
import { LuPlus } from "react-icons/lu";
import { useCustomedForm } from "@/helpers/customHooks";
import useErrorHandler from "@/helpers/useErrorHandler";
import useSuccessHandler from "@/helpers/useSuccessHandler";
import CustomedDialog from "@/Components/CustomedDialog";
import LoadingSpinner from "@/Components/LoadingSpinner";

export function InvitationForm({ workspace }) {
    const [invitationLink, setInvitationLink] = useState("");
    const [invitationSent, setInvitationSent] = useState("");
    const [generatingLink, setGeneratingLink] = useState(false);
    const errorHandler = useErrorHandler();
    const successHandler = useSuccessHandler("Invitation sent successfully!");
    const [isOpen, setIsOpen] = useState(false);
    const { getValues, setValues, loading, submit, reset } = useCustomedForm(
        {
            emailList: "",
            workspace_id: workspace.id,
        },
        {
            url: route("invitation.mail", workspace.id),
        }
    );

    function onSubmit(e) {
        e.preventDefault();
        if (typeof getValues().emailList == "string") {
            const emailList = getValues().emailList.split(",");
            setValues(
                "emailList",
                emailList.map((em) => em.trim()).filter((em) => em != "")
            );
        }

        submit().then((response) => {
            copy(response.data.invitation_link);
            setInvitationLink(response.data.invitation_link);
            setInvitationSent(response.data.invitation_sent);
            successHandler(response);
        });
    }
    function generateInviteLink(e) {
        e.preventDefault();
        if (invitationLink) {
            copy(invitationLink);
            return;
        }
        setGeneratingLink(true);
        axios
            .post(route("invitation.store", workspace.id), {
                workspace_id: workspace.id,
            })
            .then((response) => {
                copy(response.data.invitation_link);
                setInvitationLink(response.data.invitation_link);
            })
            .catch(errorHandler)
            .finally(() => {
                setGeneratingLink(false);
            });
    }

    return (
        <div className="">
            <button
                className="grid-item mt-2 px-4 w-fit"
                onClick={() => {
                    reset();
                    setIsOpen(true);
                }}
            >
                <div className="flex items-center w-full h-full">
                    <LuPlus className="text-sm" />
                </div>
                <div className="">Add coworkers</div>
            </button>
            <CustomedDialog isOpen={isOpen} onClose={() => setIsOpen(false)}>
                <CustomedDialog.Title>
                    {`Invite people to ${workspace.name}`}
                </CustomedDialog.Title>
                <TextArea
                    id="name"
                    rows="2"
                    label="To:"
                    placeholder="name@gmail.com"
                    value={getValues().emailList}
                    onChange={(e) => {
                        setValues("emailList", e.target.value);
                    }}
                />
                <div className="flex justify-between items-end">
                    <div className="flex gap-x-2 items-center">
                        <button
                            className="flex gap-x-2 items-center text-link font-bold"
                            onClick={generateInviteLink}
                        >
                            <FaLink className="text-lg" /> Copy invite link
                        </button>
                        {generatingLink && (
                            <div className="ml-4 relative">
                                <LoadingSpinner />
                            </div>
                        )}
                        {invitationLink && (
                            <div className="text-sm text-color-medium-emphasis">
                                Link copied
                            </div>
                        )}
                    </div>
                    <CustomedDialog.ActionButtons
                        btnName2="Send Invitation"
                        onClickBtn2={onSubmit}
                        loading={loading}
                    />
                </div>
            </CustomedDialog>
        </div>
    );
}
