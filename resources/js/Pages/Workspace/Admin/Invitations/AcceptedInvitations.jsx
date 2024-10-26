import {
    compareDateTime,
    formatDateWithOrdinalSuffix,
} from "@/helpers/dateTimeHelper";
import React, { useContext, useMemo, useState } from "react";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";
import { useParams } from "react-router-dom";
import { InvitationContext } from "./Invitations";
import { useSelector } from "react-redux";
import Avatar from "@/Components/Avatar";

export default function AcceptedInvitations() {
    const { invitationsMap } = useSelector((state) => state.invitations);
    const invitations = useMemo(
        () => Object.values(invitationsMap),
        [invitationsMap]
    );
    const { searchValue } = useContext(InvitationContext);
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
            (invitation) =>
                invitation.email &&
                invitation.is_fulfilled &&
                invitation.email
                    .toLowerCase()
                    .includes(searchValue.toLowerCase())
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
    }, [invitations, sortBy, searchValue]);

    return (
        <div className="px-8 w-full overflow-x-auto">
            <div className="grid grid-cols-2 gap-x-4 min-w-[800px]">
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

            {filteredInvitations.map((invitation) => {
                return (
                    <InvitationItem
                        key={invitation.id}
                        invitation={invitation}
                    />
                );
            })}
        </div>
    );
}

function InvitationItem({ invitation }) {
    const { workspaceUsers } = useSelector((state) => state.workspaceUsers);
    const user = useMemo(() => {
        return workspaceUsers.find((user) => user.email == invitation.email);
    }, [workspaceUsers]);
    const creator = useMemo(() => {
        return workspaceUsers.find((user) => user.id == invitation.user_id);
    }, [workspaceUsers, invitation]);
    return (
        <div className="grid grid-cols-2 px-6 border-t py-4 min-w-[800px]">
            <div className="flex gap-x-3 items-center">
                <Avatar src={user?.avatar_url} noStatus className="h-10 w-10" />
                <div>
                    <div className="font-bold">{invitation.email}</div>
                    <div className="text-sm text-color-low-emphasis">
                        Invited by{" "}
                        <span className="text-link text-base">
                            {creator.name}
                        </span>
                    </div>
                </div>
            </div>
            <div className="text-color-medium-emphasis ">
                Joined{" "}
                {formatDateWithOrdinalSuffix(
                    new Date(user?.pivot?.created_at),
                    true
                )}
            </div>
        </div>
    );
}
