import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { InvitationForm } from "../../Panel/InvitationForm";
import Button from "@/Components/Button";
import { useSelector } from "react-redux";
import SimpleSearchInput from "@/Components/Input/SimpleSearchInput";
const InvitationContext = createContext(null);
export default function Invitations() {
    const [isInvitationFormOpen, setIsInvitationFormOpen] = useState(false);
    const { workspaceUsers } = useSelector((state) => state.workspaceUsers);
    const [tabIndex, setTabIndex] = useState(0);
    const { workspace } = useSelector((state) => state.workspace);
    const inputRef = useRef(null);
    const tabNames = ["Pending", "Accepted", "Invite Links"];
    const searchPlaceholder = useMemo(() => {
        switch (tabIndex) {
            case 0:
                return "Search pending invitations by email";
            case 1:
                return "Search accepted invitations by email";
            case 2:
                return "Search invitation links by creator's name";
            default:
                return "";
        }
    }, [tabIndex]);
    useEffect(() => {
        inputRef.current.focus();
    }, [tabIndex]);
    return (
        <InvitationContext.Provider value={{ tabIndex, setTabIndex }}>
            <div className="bg-color-contrast h-full pt-8 px-8">
                <InvitationForm
                    workspace={workspace}
                    isOpen={isInvitationFormOpen}
                    onClose={() => setIsInvitationFormOpen(false)}
                />
                <div className="flex justify-between  items-start">
                    <h1 className="text-3xl font-bold text-color-high-emphasis ">
                        Invitations
                    </h1>
                    <Button
                        type="green"
                        onClick={() => setIsInvitationFormOpen(true)}
                    >
                        Invite People
                    </Button>
                </div>
                <p className="text-color-medium-emphasis ">
                    Invite others to join your workspace.
                </p>
                <div className="border-b  mt-8">
                    <div className="flex gap-x-4 translate-y-[1px]">
                        {tabNames.map((tabName, index) => {
                            return (
                                <TabItem index={index} key={index}>
                                    {tabName}
                                </TabItem>
                            );
                        })}
                    </div>
                </div>
                <SimpleSearchInput
                    ref={inputRef}
                    className=" mt-4"
                    placeholder={searchPlaceholder}
                />
            </div>
        </InvitationContext.Provider>
    );
}
function TabItem({ index, children }) {
    const { tabIndex, setTabIndex } = useContext(InvitationContext);
    return (
        <button
            onClick={() => setTabIndex(index)}
            className={`text-color-medium-emphasis font-semibold text-sm py-2 border-b-2 ${
                tabIndex == index ? " border-b-link" : "border-b-transparent"
            }`}
        >
            {children}
        </button>
    );
}
