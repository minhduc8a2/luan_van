import { useForm } from "@inertiajs/react";
import { v4 as uuidv4 } from "uuid";
import { useState, useEffect, useRef } from "react";
import copy from "copy-to-clipboard";
import TextArea from "@/Components/Input/TextArea";
import { FaLink } from "react-icons/fa6";
import Form1 from "@/Components/Form1";
import { Link, router, usePage } from "@inertiajs/react";
import { LuPlus } from "react-icons/lu";
import OverlayNotification from "@/Components/Overlay/OverlayNotification";

export function InvitationForm({ workspace }) {
    const { flash } = usePage().props;
    const uuid = uuidv4();
    const [invitationLink, setInvitationLink] = useState("");
    const [invitationSent, setInvitationSent] = useState("");
    const { data, setData, post, processing, transform } = useForm({
        emailList: "",
        code: uuid,
        workspace_id: workspace.id,
    });
    function onSubmit(e) {
        e.preventDefault();
        transform((data) => {
            const emailList = data.emailList.split(",");

            return {
                ...data,
                emailList: emailList
                    .map((em) => em.trim())
                    .filter((em) => em != ""),
            };
        });
        post(route("invitation.mail", { workspace: workspace.id }));
    }
    function generateInviteLink(e) {
        e.preventDefault();
        if (flash.invitation_link) {
            copy(flash.invitation_link);
            setInvitationLink(flash.invitation_link);
            return;
        }

        router.post(
            route("invitation.store", workspace.id),
            {
                code: uuid,
                workspace_id: workspace.id,
            },
            { preserveState: true, only: [], preserveScroll: true }
        );
    }
    useEffect(() => {
        if (flash.invitation_link) {
            copy(flash.invitation_link);
            setInvitationLink(flash.invitation_link);
        }
        // console.log(flash.invitation_link);
    }, [flash.invitation_link]);
    useEffect(() => {
        if (flash.invitation_sent) {
            setInvitationSent(flash.invitation_sent);
        }
    }, [flash.invitation_sent]);
    return (
        <div className="">
            {invitationSent && (
                <OverlayNotification
                    show={invitationSent}
                    close={() => setInvitationSent(null)}
                >
                    {flash.invitation_sent.length != 0 && (
                        <div className="">
                            <p className="text-lg">You've invited:</p>
                            <ol className="">
                                {flash.invitation_sent.map((em, index) => (
                                    <li key={em} className=" mt-2">
                                        {index + 1}.{" "}
                                        <span className="text-link">{em}</span>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    )}
                </OverlayNotification>
            )}
            <Form1
                className="p-4"
                success={flash.invitation_sent}
                submit={onSubmit}
                buttonName="Send"
                submitting={processing}
                activateButtonNode={
                    <div className="grid-item mt-2 px-4 w-fit">
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
                    value={data.email}
                    onChange={(e) => setData("emailList", e.target.value)}
                />
            </Form1>
        </div>
    );
}
