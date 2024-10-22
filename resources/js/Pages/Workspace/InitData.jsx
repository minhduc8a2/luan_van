import LoadingSpinner from "@/Components/LoadingSpinner";
import useLoadChannels from "@/helpers/useLoadChannels";
import useLoadWorkspaceData from "@/helpers/useLoadWorkspaceData";
import useLoadWorkspaceUsers from "@/helpers/useLoadWorkspaceUsers";
import { setNotificationsCount } from "@/Store/activitySlice";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";

export default function InitData({ loaded, setLoaded }) {
    const { workspaceId } = useParams();

    const loadWorkspaceData = useLoadWorkspaceData();
    const loadWorkspaceUsers = useLoadWorkspaceUsers();
    const loadChannels = useLoadChannels(workspaceId);
    function loadWorkspaceRelatedData() {
        return Promise.all([
            loadWorkspaceUsers(),
            loadChannels(),
            loadWorkspaceData(),
        ]);
    }

    useEffect(() => {
        setLoaded(false);
        loadWorkspaceRelatedData()
            .then(() => {
                setLoaded(true);
            })
            .catch((error) => {
                console.log(error);
            });
    }, [workspaceId]);

    // useEffect(() => {
    //     function handleReconnect() {
    //         setLoaded(false);
    //         loadWorkspaceRelatedData()
    //             .then(() => {
    //                 dispatch(setNotificationsCount(newNotificationsCount));
    //             })
    //             .catch((error) => {
    //                 console.log(error);
    //             });
    //     }
    //     Echo.connector.pusher.connection.bind("connected", handleReconnect);
    //     return () => {
    //         Echo.connector.pusher.connection.unbind(
    //             "connected",
    //             handleReconnect
    //         );
    //     };
    // }, [workspaceId]);
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
