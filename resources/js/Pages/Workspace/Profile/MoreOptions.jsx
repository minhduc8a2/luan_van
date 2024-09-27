import Button from "@/Components/Button";
import CustomedPopover from "@/Components/CustomedPopover";
import React from "react";
import { FiMoreVertical } from "react-icons/fi";

export default function MoreOptions({ user }) {
    return (
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
            <CustomedPopover.ListItem className="!text-danger-400 hover:!bg-danger-500 hover:!text-white">
                Hide {user.name}
            </CustomedPopover.ListItem>
        </CustomedPopover>
    );
}
