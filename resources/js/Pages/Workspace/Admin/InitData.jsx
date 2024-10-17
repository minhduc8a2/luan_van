import LoadingSpinner from "@/Components/LoadingSpinner";
import useLoadWorkspaceData from "@/helpers/useLoadWorkspaceData";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
export default function InitData({ loaded, setLoaded }) {
    const { workspaceId } = useParams();
    const loadWorkspaceData = useLoadWorkspaceData();
    useEffect(() => {
        if (!workspaceId) return;
        setLoaded(false);
        loadWorkspaceData()
            .then(() => {
                setLoaded(true);
            })
            .catch((error) => {
                console.log(error);
            });
    }, [workspaceId]);
    if (loaded) {
        return <></>;
    } else {
        return (
            <div className="fixed top-0 bottom-0 left-0 right-0 flex items-center justify-center bg-background">
                <div className=" ">
                    <div className="relative h-48 w-48">
                        <LoadingSpinner
                            spinerStyle=" border-4  "
                            size="w-24 h-24"
                        />
                    </div>
                    <p className="animate-bounce text-color-high-emphasis">
                        Loading workspace data ...
                    </p>
                </div>
            </div>
        );
    }
}
