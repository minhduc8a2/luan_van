import Button from "@/Components/Button";
import React, {
    memo,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

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

import {
    compareDateTime,
    formatDDMMYYY,
    groupListByDate,
} from "@/helpers/dateTimeHelper";

import Item from "./Item";
import OverlayLoadingSpinner from "@/Components/Overlay/OverlayLoadingSpinner";

import { InView, useInView } from "react-intersection-observer";

import DocumentInSearch from "./DocumentInSearch";
import FileIcon from "@/Components/FileIcon";
import { useDispatch } from "react-redux";
import { setMedia } from "@/Store/mediaSlice";
import Layout from "../Layout";
import InfiniteScroll from "@/Components/InfiniteScroll";
function BrowseFiles() {
    const { auth, flash, workspace, channels, workspaceFiles } =
        usePage().props;

    const dispatch = useDispatch();
    const [files, setFiles] = useState([]);
    const [searchFilter, setSearchFilter] = useState("");

    const [filter, setFilter] = useState("shared");

    const [loadedPages, setLoadedPages] = useState({});
    const [topLoading, setTopLoading] = useState(false);
    const [bottomLoading, setBottomLoading] = useState(false);
    const [topHasMore, setTopHasMore] = useState();
    const [bottomHasMore, setBottomHasMore] = useState();

    useEffect(() => {
        Echo.private(`private_workspaces.${workspace.id}`).listen(
            "WorkspaceEvent",
            (e) => {
                switch (e.type) {
                    case "FileObserver_fileDeleted":
                        setSharedFiles((pre) => {
                            const temp = new Map(pre);
                            delete temp[e.data];
                            return temp;
                        });
                        setFiles((pre) => {
                            const temp = new Map(pre);
                            delete temp[e.data];
                            return temp;
                        });
                        break;
                    case "ThreadMessage_fileCreated":
                    case "ChannelMessage_fileCreated":
                        if (channels.find((cn) => cn.id === e.data.channelId)) {
                            setSharedFiles((pre) => {
                                const temp = new Map(pre);
                                e.data.files.forEach((f) => {
                                    temp[f.id] = f;
                                });
                                return temp;
                            });
                        } else {
                            setFiles((pre) => {
                                const temp = new Map(pre);
                                e.data.files.forEach((f) => {
                                    temp[f.id] = f;
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

    const filteredFilesList = useMemo(
        () =>
            files.filter((file) => {
                switch (filter) {
                    case "shared":
                        return (
                            file.user_id != auth.user.id &&
                            file.name
                                .toLowerCase()
                                .includes(searchFilter.toLowerCase())
                        );
                    case "self":
                        return (
                            file.user_id == auth.user.id &&
                            file.name
                                .toLowerCase()
                                .includes(searchFilter.toLowerCase())
                        );
                    default:
                        return file.name
                            .toLowerCase()
                            .includes(searchFilter.toLowerCase());
                }
            }),
        [files, filter, searchFilter]
    );

    useEffect(() => {
        const controller = new AbortController();
        axios
            .get(route("files.index", workspace.id), {
                params: {
                    filter,
                    name: "",
                },
                signal: controller.signal,
            })
            .then((response) => {
                if (response.status == 200) {
                    setLoadedPages({ [response.data.current_page]: true });

                    setTopHasMore(response.data.prev_page_url);
                    setFiles([...response.data.data]);

                    setBottomHasMore(response.data.next_page_url);
                }
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
                gFiles[key].sort((a, b) => b.id - a.id);
                return {
                    date: formatedDate == currentDate ? "Today" : formatedDate,
                    fis: gFiles[key],
                };
            });

        return result;
    }, [filteredFilesList]);
    const loadMore = (position) => {
        let url;
        if (position == "top") {
            url = topHasMore;
        } else {
            url = bottomHasMore;
        }
        if (url) {
            if (position == "top") {
                setTopLoading(true);
            } else {
                setBottomLoading(true);
            }
            return axios
                .get(url)
                .then((response) => {
                    if (response.status == 200) {
                        setLoadedPages((pre) => {
                            const temp = { ...pre };
                            temp[response.data.current_page] = true;
                            return temp;
                        });
                        if (position == "top") {
                            setTopHasMore(response.data.prev_page_url);
                            setFiles((pre) => [...response.data.data, ...pre]);
                        } else {
                            setBottomHasMore(response.data.next_page_url);
                            setFiles((pre) => [...pre, ...response.data.data]);
                        }
                    }
                })
                .finally(() => {
                    if (position == "top") {
                        setTopLoading(false);
                    } else {
                        setBottomLoading(false);
                    }
                });
        }
    };

    const token = useRef(null);
    function search(searchValue) {
        if (token.current != null) token.current.abort();
        setSearchFilter(searchValue);
        token.current = new AbortController();
        axios
            .get(route("files.index", workspace.id), {
                params: {
                    name: searchValue,
                    filter,
                },
                signal: token.current.signal,
            })
            .then((response) => {
                if (response.status == 200) {
                    setLoadedPages({ 1: true });

                    setTopHasMore(response.data.prev_page_url);
                    setFiles([...response.data.data]);

                    setBottomHasMore(response.data.next_page_url);
                }
            })
            .finally(() => {
                setTopLoading(false);
                setBottomLoading(false);
            });
    }
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
                            setFilter("shared");
                        }}
                    >
                        <div className="flex gap-x-2 items-center">
                            <PiShareFat />
                            Share with you
                        </div>
                    </Button>
                    <Button
                        className={` bg-transparent border-none !justify-start ${
                            filter == "self" ? "bg-white/15" : ""
                        }`}
                        onClick={() => {
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
                    </div>
                    <SearchInput
                        onSearch={(searchValue) => search(searchValue)}
                        list={filteredFilesList}
                        placeholder="Search files"
                        filterFunction={(searchValue, list) => {
                            return list.filter((file) => {
                                return file.name
                                    .toLowerCase()
                                    .includes(searchValue.toLowerCase());
                            });
                        }}
                        onChange={(e) => {
                            if (!e.target.value) {
                                setSearchFilter("");
                                search("");
                            }
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
                    <InfiniteScroll
                        loadMoreOnTop={() => loadMore("top")}
                        loadMoreOnBottom={() => loadMore("bottom")}
                        topHasMore={topHasMore}
                        bottomHasMore={bottomHasMore}
                        topLoading={topLoading}
                        bottomLoading={bottomLoading}
                        className="flex flex-col  gap-y-4 mt-12  overflow-y-auto scrollbar flex-1"
                    >
                        {groupedFiles.map(({ date, fis }, pIndex) => {
                            if (!fis) return "";
                            return (
                                <li key={date}>
                                    <div className="font-bold text-white/75">
                                        {date}
                                    </div>
                                    {fis.map((file, cIndex) => (
                                        <div key={file.id} className="">
                                            <Item file={file} />
                                        </div>
                                    ))}
                                </li>
                            );
                        })}
                    </InfiniteScroll>
                </div>
            </div>
        </div>
    );
}

BrowseFiles.layout = (page) => <Layout children={page} />;

export default BrowseFiles;
