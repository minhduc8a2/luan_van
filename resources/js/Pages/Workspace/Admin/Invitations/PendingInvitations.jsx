import Button from "@/Components/Button";
import { useCustomedForm } from "@/helpers/customHooks";
import {
    compareDateTime,
    formatDateWithOrdinalSuffix,
} from "@/helpers/dateTimeHelper";
import React, { useContext, useMemo, useState } from "react";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";
import { IoMdCheckmark } from "react-icons/io";
import { useParams } from "react-router-dom";
import { InvitationContext } from "./Invitations";

export default function PendingInvitations() {
    const { invitations } = useContext(InvitationContext);
    const [sortBy, setSortBy] = useState({ type: "email", direction: true });
    function handleSortClick(type) {
        if (sortBy.type === type) {
            setSortBy((prev) => ({ ...prev, direction: !prev.direction }));
        } else {
            setSortBy({ type, direction: true });
        }
    }
    const filteredInvitations = useMemo(() => {
        const temp = invitations.filter(
            (invitation) => invitation.email && !invitation.is_fulfilled
        );

        switch (sortBy.type) {
            case "email":
                if (sortBy.direction) {
                    temp.sort((a, b) => a.email.localeCompare(b.email));
                } else {
                    temp.sort((a, b) => b.email.localeCompare(a.email));
                }
                break;
            case "date":
                temp.sort((a, b) => {
                    if (sortBy.direction) {
                        return compareDateTime(a.created_at, b.created_at);
                    } else {
                        return compareDateTime(b.created_at, a.created_at);
                    }
                });
                break;
            default:
                break;
        }
        return temp;
    }, [invitations, sortBy]);
    console.log(filteredInvitations);
    return (
        <div className="px-8">
            <div className="grid grid-cols-3 ">
                <button
                    className={`w-full  flex gap-x-2 items-baseline px-6 hover:bg-background pt-6 pb-2 ${
                        sortBy.type == "email"
                            ? "text-link"
                            : "text-color-low-emphasis"
                    }  text-sm font-semibold text-start`}
                    onClick={() => handleSortClick("email")}
                >
                    Email
                    {sortBy.type == "email" && sortBy.direction && (
                        <FaArrowDown className="text-link text-xs" />
                    )}
                    {sortBy.type == "email" && !sortBy.direction && (
                        <FaArrowUp className="text-link text-xs" />
                    )}
                </button>
                <button
                    className={`w-full  flex gap-x-2 items-baseline px-6 hover:bg-background pt-6 pb-2 ${
                        sortBy.type == "date"
                            ? "text-link"
                            : "text-color-low-emphasis"
                    }  text-sm font-semibold text-start`}
                    onClick={() => handleSortClick("date")}
                >
                    Date
                    {sortBy.type == "date" && sortBy.direction && (
                        <FaArrowDown className="text-link text-xs" />
                    )}
                    {sortBy.type == "date" && !sortBy.direction && (
                        <FaArrowUp className="text-link text-xs" />
                    )}
                </button>
            </div>
            <div className=" flex flex-col ">
                {filteredInvitations.map((invitation) => {
                    return (
                        <InvitationItem
                            key={invitation.id}
                            invitation={invitation}
                        />
                    );
                })}
            </div>
        </div>
    );
}

function InvitationItem({ invitation }) {
    const [alreadyResent, setAlreadyResent] = useState(false);
    const { workspaceId } = useParams();
    const { setInvitations } = useContext(InvitationContext);
    const { submit: resendInvitationSumbit, loading: resendInvitationLoading } =
        useCustomedForm(
            { id: invitation.id },
            { url: route("invitations.resendInvitation", workspaceId) }
        );
    const { submit: revokeSumbit, loading: revokeLoading } = useCustomedForm(
        { id: invitation.id },
        {
            url: route("invitations.delete", {
                workspace: workspaceId,
                invitation: invitation.id,
            }),
            method: "delete",
        }
    );

    function resend() {
        resendInvitationSumbit().then(() => {
            setAlreadyResent(true);
        });
    }
    function revoke() {
        revokeSumbit().then(() => {
            setInvitations((pre) => pre.filter((i) => i.id != invitation.id));
        });
    }
    return (
        <div className="grid grid-cols-3 px-6 border-t py-4">
            <div>
                <div className="font-bold">{invitation.email}</div>
                <div className="text-sm text-color-low-emphasis">
                    Invited by{" "}
                    <span className="text-link text-base">
                        {invitation.user.name}
                    </span>
                </div>
            </div>
            <div className="text-color-medium-emphasis ">
                Sent{" "}
                {formatDateWithOrdinalSuffix(
                    new Date(invitation.created_at),
                    true
                )}
            </div>
            <div className="flex gap-x-4 justify-end">
                <Button
                    size="small"
                    loading={resendInvitationLoading}
                    onClick={resend}
                    className="text-color-medium-emphasis"
                >
                    {alreadyResent ? (
                        <div className="flex gap-x-2 items-center">
                            <IoMdCheckmark className="text-sm" /> Invitation
                            resent
                        </div>
                    ) : (
                        " Resend invitation"
                    )}
                </Button>
                <Button
                    size="small"
                    className="text-color-medium-emphasis"
                    loading={revokeLoading}
                    onClick={revoke}
                >
                    Revoke
                </Button>
            </div>
        </div>
    );
}
