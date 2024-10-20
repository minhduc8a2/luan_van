import React, { useContext, useMemo } from "react";
import { InvitationContext } from "./Invitations";
import Button from "@/Components/Button";
import Avatar from "@/Components/Avatar";
import { useSelector } from "react-redux";
import {
    compareDateTime,
    formatDateWithOrdinalSuffix,
} from "@/helpers/dateTimeHelper";
import { useCustomedForm } from "@/helpers/customHooks";
import { useParams } from "react-router-dom";

export default function InviteLinks() {
    const { invitations, searchValue } = useContext(InvitationContext);

    const invitationsLinks = useMemo(() => {
        return invitations.filter((invitation) => !invitation.email);
    }, [invitations]);
    return (
        <div className="mt-4 px-12">
            <div className="flex justify-end">
                <Button type="danger" className="border-0">
                    Deactivate all
                </Button>
            </div>
            <div className=" overflow-x-auto">
                <div className="grid  grid-cols-[repeat(6,minmax(12rem,1fr))] mt-4 ">
                    <HeaderItem>Link creator</HeaderItem>
                    <HeaderItem>Invite code</HeaderItem>
                    <HeaderItem>Joiners</HeaderItem>
                    <HeaderItem>Date created</HeaderItem>
                    <HeaderItem>Expiration Date</HeaderItem>
                    <HeaderItem>Link management</HeaderItem>
                </div>

                {invitationsLinks.map((invitation) => {
                    return (
                        <InvitationItem
                            invitation={invitation}
                            key={invitation.id}
                        />
                    );
                })}
            </div>
        </div>
    );
}

function HeaderItem({ children }) {
    return (
        <div className="hover:bg-background pt-4 pb-2 px-4 text-color-low-emphasis font-semibold text-sm">
            {children}
        </div>
    );
}

function InvitationItem({ invitation }) {
    const { workspaceId } = useParams();
    const { workspaceUsers } = useSelector((state) => state.workspaceUsers);
    const { setInvitations, invitations } = useContext(InvitationContext);
    const numberOfJoiners = useMemo(() => {
        return workspaceUsers.reduce((acc, user) => {
            if (user.pivot.invitation_id == invitation.id) return acc + 1;
            return acc;
        }, 0);
    }, [workspaceUsers]);
    const creator = useMemo(() => {
        return workspaceUsers.find((user) => user.id == invitation.user_id);
    }, [workspaceUsers, invitation]);

    const { submit: deactivateSubmit, loading: deactivateLoading } =
        useCustomedForm(
            {},
            {
                url: route("invitations.delete", {
                    workspace: workspaceId,
                    invitation: invitation.id,
                }),
                method: "delete",
            }
        );
    function deactivate() {
        deactivateSubmit().then(() => {
            setInvitations((pre) => pre.filter((i) => i.id != invitation.id));
        });
    }
    const { submit: renewSubmit, loading: renewLoading } = useCustomedForm(
        {},
        {
            url: route("invitations.renew", {
                workspace: workspaceId,
                invitation: invitation.id,
            }),
            method: "post",
        }
    );
    function renew() {
        renewSubmit().then((response) => {
            setInvitations((pre) => {
                return pre.map((i) => {
                    if (i.id == invitation.id) {
                        return {
                            ...invitation,
                            expired_at: response.data?.invitation?.expired_at,
                        };
                    }
                    return i;
                });
            });
        });
    }

    return (
        <div className="grid grid-cols-[repeat(6,minmax(12rem,1fr))] border-t py-4 hover:bg-background  min-w-fit">
            <div className="flex items-center gap-x-3 px-4 ">
                <Avatar
                    src={creator?.avatar_url}
                    noStatus
                    className="h-10 w-10"
                />
                <div className="text-link hover:underline cursor-pointer px-4 text-wrap flex-1">
                    {creator?.name}
                </div>
            </div>
            <div className="text-link max-w-48 text-wrap px-4">
                {invitation.code}
            </div>
            <div className="text-color-medium-emphasis  px-4">
                {numberOfJoiners}
            </div>
            <div className="text-color-medium-emphasis  px-4">
                {formatDateWithOrdinalSuffix(
                    new Date(invitation.created_at),
                    true
                )}
            </div>
            <div className="text-color-medium-emphasis  px-4">
                {formatDateWithOrdinalSuffix(
                    new Date(invitation.expired_at),
                    true
                )}
            </div>
            <div className="px-4">
                {compareDateTime(
                    invitation.expired_at,
                    new Date().toUTCString()
                ) > 0 ? (
                    <Button
                        size="small"
                        className="w-fit "
                        loading={deactivateLoading}
                        onClick={deactivate}
                    >
                        Deactivate
                    </Button>
                ) : (
                    <Button
                        size="small"
                        className="w-fit "
                        onClick={renew}
                        loading={renewLoading}
                    >
                        Renew
                    </Button>
                )}
            </div>
        </div>
    );
}
