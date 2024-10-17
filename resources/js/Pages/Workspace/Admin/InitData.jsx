import LoadingSpinner from "@/Components/LoadingSpinner";

import { setWorkspaceData } from "@/Store/workspaceSlice";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";

export default function InitData({ loaded, setLoaded }) {
    const { workspaceId } = useParams();
    const dispatch = useDispatch();
    function loadWorkspaceRelatedData() {
        return Promise.all([loadWorkspaceData()]);
    }

    function loadWorkspaceData() {
        return axios
            .get(route("workspaces.initWorkspaceData", workspaceId))
            .then((response) => {
                dispatch(setWorkspaceData(response.data));
            });
    }

    useEffect(() => {
        if (!workspaceId) return;
        setLoaded(false);
        loadWorkspaceRelatedData()
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
