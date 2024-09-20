import React, { useMemo } from "react";
import { CreateChannelForm } from "../Panel/CreateChannelForm";
import SearchChannelInput from "./SearchChannelInput";
import Button from "@/Components/Button";
import { usePage } from "@inertiajs/react";
import Filter from "./Filter";

export default function BrowseChannels() {
    const { availableChannels, channels } = usePage().props;

    const allChannels = useMemo(() => {
        const result = [...availableChannels];
        channels.forEach((cn) => {
            if (!result.find((c) => c.id == cn.id)) result.push(cn);
        });
        return result;
    }, [availableChannels, channels]);
    return (
        <div className="bg-foreground w-full h-full">
            <div className="mx-auto w-1/2 py-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white">
                        All Channels
                    </h3>
                    <CreateChannelForm
                        activateButtonNode={
                            <Button className="text-white/100 font-bold border border-white/15 !bg-background">
                                Create Channel
                            </Button>
                        }
                    />
                </div>
                <SearchChannelInput allChannels={allChannels} />
                <Filter />
            </div>
        </div>
    );
}
