import Button from "@/Components/Button";
import CustomedPopover from "@/Components/CustomedPopover";
import React, { useState } from "react";
import { FiMoreVertical } from "react-icons/fi";
import HideUser from "./HideUser";

export default function MoreOptions({ user }) {
    const [hideUserOpen, setHideUserOpen] = useState(false);
    return (
        <>
            <CustomedPopover
                width="w-80"
                anchor="bottom end"
                className="mt-1 bg-foreground"
                triggerNode={
                    <Button>
                        <div className="flex items-center">
                            <FiMoreVertical className="text-lg" />
                        </div>
                    </Button>
                }
            >
                <CustomedPopover.ListItem
                    className="!text-danger-400 hover:!bg-danger-500 hover:!text-white"
                    onClick={() => {
                        setHideUserOpen(true);
                    }}
                >
                    Hide {user.displayName || user.name}
                </CustomedPopover.ListItem>
            </CustomedPopover>
            <HideUser user={user} isOpen={hideUserOpen} onClose={()=>setHideUserOpen(false)}/>
        </>
    );
}
