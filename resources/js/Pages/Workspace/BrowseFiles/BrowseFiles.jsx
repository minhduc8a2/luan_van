import Button from "@/Components/Button";
import React, {
    memo,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { debounce } from "lodash";
import { PiShareFat } from "react-icons/pi";
import { FaRegUser } from "react-icons/fa6";
import { TbStack2 } from "react-icons/tb";
import SearchInput from "@/Components/Input/SearchInput";
import { router, usePage } from "@inertiajs/react";
import {
    downloadFile,
    getDocumentType,
    isDocument,
    isImage,
    isVideo,
} from "@/helpers/fileHelpers";

import { MdOutlineRotate90DegreesCcw } from "react-icons/md";

import {
    compareDateTime,
    formatDDMMYYY,
    groupListByDate,
} from "@/helpers/dateTimeHelper";

import Item from "./Item";
import OverlayLoadingSpinner from "@/Components/Overlay/OverlayLoadingSpinner";
import Video from "@/Components/Video";
import { InView, useInView } from "react-intersection-observer";
import { PhotoProvider, PhotoView } from "react-photo-view";
import { IoMdCloudDownload } from "react-icons/io";
import { AiOutlineZoomIn, AiOutlineZoomOut } from "react-icons/ai";
import DocumentInSearch from "./DocumentInSearch";
import FileIcon from "@/Components/FileIcon";
import { useDispatch } from "react-redux";
import { setMedia } from "@/Store/mediaSlice";
export default function BrowseFiles() {
    const { auth, flash, workspace, channels } = usePage().props;
    const dispatch = useDispatch();
    const [files, setFiles] = useState({});
    const [searchFiles, setSearchFiles] = useState([]);
    const [sharedFiles, setSharedFiles] = useState({});
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState("shared");
    const localFoundRef = useRef(false);
    const filterSwitchRef = useRef(false);
    const [searchValue, setSearchValue] = useState("");
    const [showVideo, setShowVideo] = useState(false);

    const nextPageUrlRef = useRef(null);
    const loadingRef = useRef(null);
    useEffect(() => {
        Echo.private(`private_workspaces.${workspace.id}`).listen(
            "WorkspaceEvent",
            (e) => {
                switch (e.type) {
                    case "FileObserver_fileDeleted":
                        setSharedFiles((pre) => {
                            const temp = new Map(pre);
                            temp.delete(e.data);
                            return temp;
                        });
                        setFiles((pre) => {
                            const temp = new Map(pre);
                            temp.delete(e.data);
                            return temp;
                        });
                        break;
                    case "ThreadMessage_fileCreated":
                    case "ChannelMessage_fileCreated":
                        if (channels.find((cn) => cn.id === e.data.channelId)) {
                            setSharedFiles((pre) => {
                                const temp = new Map(pre);
                                e.data.files.forEach((f) => {
                                    temp.set(f.id, f);
                                });
                                return temp;
                            });
                        } else {
                            setFiles((pre) => {
                                const temp = new Map(pre);
                                e.data.files.forEach((f) => {
                                    temp.set(f.id, f);
                                });
                                return temp;
                            });
                        }
                        break;
                    default:
                        break;
                }
            }
        );
    }, []);

    function mutateFiles(pre, list) {
        const temp = { ...pre };
        if (!list) return temp;
        list.forEach((file) => (temp[file.id] = file));
        return temp;
    }
    // useEffect(() => {
    //     router.get(
    //         route("files.index", workspace.id),
    //         { filter, name: searchValue, page: 1 },
    //         {
    //             preserveState: true,
    //             only: [],
    //         }
    //     );
    //     // const controller = new AbortController();
    //     // setLoading(true);
    //     // axios
    //     //     .get(route("files.index"), {
    //     //         signal: controller.signal,
    //     //         params: { filter, name: searchValue, page: 1 },
    //     //     })
    //     //     .then((response) => {
    //     //         console.log(response);
    //     //         setFiles((pre) => mutateFiles(pre, response.data?.data));
    //     //         setLoading(false);
    //     //     })
    //     //     .catch((err) => {
    //     //         console.log(err);
    //     //     });

    //     // return () => {
    //     //     controller.abort();
    //     // };
    // }, []);
    // useEffect(() => {
    //     console.log(flash);
    // }, [flash]);
    const filesList = useMemo(() => {
        if (filter == "shared") return Object.values(sharedFiles);
        return Object.values(files);
    }, [files, sharedFiles, filter]);
    const filteredFilesList = useMemo(
        () =>
            filesList.filter((file) => {
                switch (filter) {
                    case "shared":
                        return file.user_id != auth.user.id;
                    case "self":
                        return file.user_id == auth.user.id;
                    default:
                        return true;
                }
            }),
        [filesList, filter, searchValue]
    );
    useEffect(() => {
        if (
            filteredFilesList.some((file) => {
                return file.name
                    .toLowerCase()
                    .includes(searchValue.toLowerCase());
            })
        )
            localFoundRef.current = true;
        if (localFoundRef.current) {
            setSearchFiles(
                filteredFilesList.filter((file) => {
                    return file.name
                        .toLowerCase()
                        .includes(searchValue.toLowerCase());
                })
            );
        }
    }, [filesList, searchValue]);
    const loadFiles = useCallback(
        (controller) => {
            setLoading(true);

            axios
                .get(route("files.index", workspace.id), {
                    params: { filter, name: searchValue, page: 1 },
                    headers: {
                        "Cache-Control": "public",
                    },
                    signal: controller.signal,
                })
                .then((response) => {
                    // console.log(response.data?.data);
                    setSearchFiles(response.data.data);
                    setLoading(false);
                })
                .catch((error) => {
                    setLoading(false);
                });
        },
        [filter, searchValue]
    );
    useEffect(() => {
        // if (!searchValue) {
        //     return;
        // }

        if (localFoundRef.current && !filterSwitchRef.current) return;
        if (filterSwitchRef.current) filterSwitchRef.current = false;
        const controller = new AbortController();
        const delayDebounceFn = setTimeout(() => loadFiles(controller), 500);

        return () => {
            controller.abort();
            clearTimeout(delayDebounceFn);
        };
    }, [searchValue, filter]);
    useEffect(() => {
        // if (!searchValue) {
        //     return;
        // }

        const controller = new AbortController();

        setLoading(true);

        axios
            .get(route("files.index", workspace.id), {
                params: { filter, name: "", page: 1 },
                headers: {
                    "Cache-Control": "public",
                },
                signal: controller.signal,
            })
            .then((response) => {
                if (filter === "shared") {
                    setSharedFiles((prev) =>
                        mutateFiles(prev, response.data?.data)
                    );
                }
                nextPageUrlRef.current = response.data?.next_page_url;
                setFiles((pre) => mutateFiles(pre, response.data?.data));
                setLoading(false);
            })
            .catch((error) => {
                setLoading(false);
            });

        return () => {
            controller.abort();
        };
    }, [filter]);
    const groupedFiles = useMemo(() => {
        const gFiles = groupListByDate(filteredFilesList);
        const currentDate = formatDDMMYYY(new Date());

        const result = Object.keys(gFiles)
            .sort((a, b) => {
                return compareDateTime(a, b);
            })
            .map((key) => {
                const formatedDate = formatDDMMYYY(new Date(key));
                return {
                    date: formatedDate == currentDate ? "Today" : formatedDate,
                    fis: gFiles[key],
                };
            });

        return result;
    }, [filteredFilesList]);
    const loadMore = useCallback(() => {
        if (nextPageUrlRef.current && !loadingRef.current) {
            setLoading(true);
            loadingRef.current = true;
            const localFilter = filter;
            axios
                .get(nextPageUrlRef.current)
                .then((response) => {
                    nextPageUrlRef.current = response.data?.next_page_url;
                    if (localFilter === "shared") {
                        setSharedFiles((prev) =>
                            mutateFiles(prev, response.data?.data)
                        );
                    }
                    setFiles((prev) => mutateFiles(prev, response.data?.data));
                    setLoading(false);
                    loadingRef.current = false;
                })
                .catch((error) => {
                    console.error(error);
                    setLoading(false);
                    loadingRef.current = false;
                });
        }
    }, [filter]);
    return (
        <div className=" w-full h-full grid grid-cols-5">
            <div className="h-full col-span-1 bg-black/35 px-2">
                <h3 className="text-xl font-semibold p-4">Files</h3>
                <div className="">
                    <Button
                        className={` bg-transparent border-none !justify-start ${
                            filter == "shared" ? "bg-white/15" : ""
                        }`}
                        onClick={() => {
                            filterSwitchRef.current = true;
                            nextPageUrlRef.current = false;
                            setFilter("shared");
                        }}
                    >
                        <div
                            className="flex gap-x-2 items-center"
                           
                        >
                            <PiShareFat />
                            Share with you
                        </div>
                    </Button>
                    <Button
                        className={` bg-transparent border-none !justify-start ${
                            filter == "self" ? "bg-white/15" : ""
                        }`}
                        onClick={() => {
                            filterSwitchRef.current = true;
                            nextPageUrlRef.current = false;
                            setFilter("self");
                        }}
                    >
                        <div className="flex gap-x-2 items-center">
                            <FaRegUser />
                            Created by you
                        </div>
                    </Button>
                    <hr className="my-2" />

                    <Button
                        className={` bg-transparent border-none !justify-start ${
                            filter == "all" ? "bg-white/15" : ""
                        }`}
                        onClick={() => {
                            filterSwitchRef.current = true;
                            nextPageUrlRef.current = false;
                            setFilter("all");
                        }}
                    >
                        <div className="flex gap-x-2 items-center">
                            <TbStack2 />
                            All files
                        </div>
                    </Button>
                </div>
            </div>
            <div className=" col-span-4 bg-background  max-h-full min-h-0">
                <div className="w-[67%] mx-auto flex flex-col max-h-full min-h-0  pb-4">
                    <div className="flex gap-x-4 my-4 items-center">
                        <h1 className="text-xl font-bold  text-white/85">
                            {filter == "shared"
                                ? "Share with you"
                                : filter == "self"
                                ? "Created by you"
                                : "All files"}
                        </h1>
                        {loading && (
                            <div className="flex gap-x-2 items-center">
                                <div className="h-6 w-6 relative">
                                    <OverlayLoadingSpinner />
                                </div>
                                <div className="text-xs">Loading files...</div>
                            </div>
                        )}
                    </div>
                    <SearchInput
                        list={searchFiles}
                        placeholder="Search files"
                        filterFunction={(searchValue, list) => {
                            return [...list];
                        }}
                        onChange={(e) => {
                            setSearchValue(e.target.value);
                            localFoundRef.current = false;
                        }}
                        renderItemNode={(item) => {
                            if (isImage(item.type)) {
                                return (
                                    <button
                                        className="flex items-center gap-x-4 w-full  "
                                        onClick={() =>
                                            dispatch(
                                                setMedia({
                                                    type: "image",
                                                    url: item.url,
                                                    name: item.name,
                                                })
                                            )
                                        }
                                    >
                                        <div className="flex-1 items-center flex gap-x-4 min-w-0 max-w-full overflow-hidden">
                                            <div className="text-link">
                                                <FileIcon type={item.type} />
                                            </div>
                                            <div className="text-left flex-1 min-w-0 max-w-full truncate overflow-hidden">
                                                {item.name}
                                            </div>
                                        </div>
                                        <div className="text-xs text-white/75">
                                            {getDocumentType(item.type)}
                                        </div>
                                    </button>
                                );
                            }
                            if (isDocument(item.type)) {
                                return (
                                    <DocumentInSearch
                                        file={item}
                                        Icon={<FileIcon type={item.type} />}
                                    />
                                );
                            }

                            return (
                                <button
                                    onClick={() => {
                                        if (isVideo(item.type)) {
                                            dispatch(
                                                setMedia({
                                                    type: "video",
                                                    url: item.url,
                                                    name: item.name,
                                                })
                                            );
                                        } else if (
                                            getDocumentType(item.type) ==
                                            "Unknown file type"
                                        )
                                            downloadFile(item.url, item.name);
                                    }}
                                    className="flex items-center gap-x-4 w-full  "
                                >
                                    <div className="flex-1 items-center flex gap-x-4 min-w-0 max-w-full overflow-hidden">
                                        <div className="text-link">
                                            <FileIcon type={item.type} />
                                        </div>
                                        <div className="text-left flex-1 min-w-0 max-w-full truncate overflow-hidden">
                                            {item.name}
                                        </div>
                                    </div>
                                    <div className="text-xs text-white/75">
                                        {getDocumentType(item.type)}
                                    </div>
                                </button>
                            );
                        }}
                    />
                    <FilesList
                        groupedFiles={groupedFiles}
                        loadMore={loadMore}
                    />
                </div>
            </div>
        </div>
    );
}

const FilesList = memo(function ({ groupedFiles, loadMore }) {
    const containerRef = useRef(null);
    const preScrollPositionRef = useRef(null);
    const infiniteScrollRef = useRef(null);
    const { ref: bottom_ref, inView: bottom_inView } = useInView({
        /* Optional options */
        threshold: 0,
    });
    useEffect(() => {
        console.log("bottom_inView", bottom_inView);
        if (!bottom_inView) return;
        preScrollPositionRef.current = containerRef.current.scrollTop;
        infiniteScrollRef.current = true;
        loadMore();
    }, [bottom_inView]); //hande scroll bottom

    useEffect(() => {
        if (infiniteScrollRef.current) {
            containerRef.current.scrollTop = preScrollPositionRef.current;
            infiniteScrollRef.current = false;
        }
    }, [groupedFiles]);
    return (
        <ul
            className="flex flex-col  gap-y-4 mt-12  overflow-y-auto scrollbar flex-1"
            ref={containerRef}
        >
            {groupedFiles.map(({ date, fis }, pIndex) => {
                if (!fis) return "";
                return (
                    <li key={date}>
                        <div className="font-bold text-white/75">{date}</div>
                        {fis.map((file, cIndex) => (
                            <div key={file.id} className="">
                                <Item file={file} />
                                {/* {file.name} */}
                            </div>
                        ))}
                    </li>
                );
            })}
            <div ref={bottom_ref} className="h-4  "></div>
        </ul>
    );
});
