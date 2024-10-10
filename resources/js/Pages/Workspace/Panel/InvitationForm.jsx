import { useState } from "react";
import copy from "copy-to-clipboard";
import TextArea from "@/Components/Input/TextArea";
import { FaLink } from "react-icons/fa6";
import Form1 from "@/Components/Form1";
import { Link, router, usePage } from "@inertiajs/react";
import { LuPlus } from "react-icons/lu";
import OverlayNotification from "@/Components/Overlay/OverlayNotification";
import { useCustomedForm } from "@/helpers/customHooks";
import { setNotificationPopup } from "@/Store/notificationPopupSlice";
import useErrorHandler from "@/helpers/useErrorHandler";
import useSuccessHandler from "@/helpers/useSuccessHandler";

export function InvitationForm({ workspace }) {
    const { flash } = usePage().props;
    const [invitationLink, setInvitationLink] = useState("");
    const [invitationSent, setInvitationSent] = useState("");
    const [refresh, setRefresh] = useState(0);
    const errorHandler = useErrorHandler();
    const successHandler = useSuccessHandler("Invitation sent successfully!");

    const {
        getValues,
        setValues,
        loading: processing,
        submit,
        reset,
    } = useCustomedForm(
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

        axios
            .post(route("invitation.store", workspace.id), {
                workspace_id: workspace.id,
            })
            .then((response) => {
                copy(response.data.invitation_link);
                setInvitationLink(response.data.invitation_link);
            })
            .catch(errorHandler);
    }

    return (
        <div className="">
            <Form1
                className="p-4"
                success={invitationSent}
                submit={onSubmit}
                buttonName="Send"
                submitting={processing}
                activateButtonNode={
                    <div
                        className="grid-item mt-2 px-4 w-fit"
                        onClick={() => reset()}
                    >
                        <div className="flex items-center ">
                            <LuPlus className="text-sm" />
                        </div>
                        <div className="">Add coworkers</div>
                    </div>
                }
                title={`Invite people to ${workspace.name}`}
                sameButtonRow={
                    <div className="flex gap-x-2 items-center">
                        <button
                            className="flex gap-x-2 items-center text-link font-bold"
                            onClick={generateInviteLink}
                        >
                            <FaLink className="text-lg" /> Copy invite link
                        </button>
                        {invitationLink && (
                            <div className="text-sm text-white/50">
                                Link copied
                            </div>
                        )}
                    </div>
                }
            >
                {" "}
                <TextArea
                    id="name"
                    rows="2"
                    label="To:"
                    placeholder="name@gmail.com"
                    value={getValues().emailList}
                    onChange={(e) => {
                        setRefresh((pre) => pre + 1);
                        setValues("emailList", e.target.value);
                    }}
                />
            </Form1>
        </div>
    );
}
