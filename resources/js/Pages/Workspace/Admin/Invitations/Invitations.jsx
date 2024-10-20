import React, {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { InvitationForm } from "../../Panel/InvitationForm";
import Button from "@/Components/Button";
import { useSelector } from "react-redux";
import SimpleSearchInput from "@/Components/Input/SimpleSearchInput";
import { useParams } from "react-router-dom";
import PendingInvitations from "./PendingInvitations";
import AcceptedInvitations from "./AcceptedInvitations";
import useLoadWorkspaceUsers from "@/helpers/useLoadWorkspaceUsers";
export const InvitationContext = createContext(null);
export default function Invitations() {
    const { workspaceId } = useParams();
    const [searchValue,setSearchValue] = useState("")
    const [isInvitationFormOpen, setIsInvitationFormOpen] = useState(false);
    const [invitations, setInvitations] = useState([]);
    const [tabIndex, setTabIndex] = useState(0);
    const { workspace } = useSelector((state) => state.workspace);
    const inputRef = useRef(null);
    const tabNames = ["Pending", "Accepted", "Invite Links"];
    const loadWorkspaceUsers = useLoadWorkspaceUsers();
    useEffect(() => {
        loadWorkspaceUsers();
    }, []);
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

    useEffect(() => {
        axios
            .get(route("workspaces.invitations", workspaceId))
            .then((response) => {
                setInvitations(response.data.invitations);
            });
    }, []);
    return (
        <InvitationContext.Provider
            value={{ tabIndex, setTabIndex, invitations, setInvitations, searchValue }}
        >
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
                    className=" my-4"
                    placeholder={searchPlaceholder}
                    onChange={(e)=>setSearchValue(e.target.value)}
                />
                <hr />
                {tabIndex == 0 && <PendingInvitations />}
                {tabIndex == 1 && <AcceptedInvitations />}
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
