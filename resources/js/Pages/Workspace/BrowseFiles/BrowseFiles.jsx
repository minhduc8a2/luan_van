import Button from "@/Components/Button";
import React, {
    memo,
    useCallback,
    useContext,
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
import LoadingSpinner from "@/Components/LoadingSpinner";

import DocumentInSearch from "./DocumentInSearch";
import FileIcon from "@/Components/FileIcon";
import { useDispatch, useSelector } from "react-redux";
import { setMedia } from "@/Store/mediaSlice";

import InfiniteScroll from "@/Components/InfiniteScroll";
import ThemeContext from "@/ThemeProvider";
import { ChannelEventHandlersProviderContext } from "@/services/ChannelEventHandlersProvider";
import ChannelEventsEnum from "@/services/Enums/ChannelEventsEnum";
export default function BrowseFiles() {
    const { auth } = usePage().props;
    const { theme } = useContext(ThemeContext);
    const { event, setEvent } = useContext(ChannelEventHandlersProviderContext);
    const containerRef = useRef(null);
    const dispatch = useDispatch();
    const [files, setFiles] = useState([]);
    const [searchFilter, setSearchFilter] = useState("");
    const { workspace } = useSelector((state) => state.workspace);
    const [filter, setFilter] = useState("shared");
    const [filterLoading, setFilterLoading] = useState(false);

    const [topLoading, setTopLoading] = useState(false);
    const [bottomLoading, setBottomLoading] = useState(false);
    const [topHasMore, setTopHasMore] = useState();
    const [bottomHasMore, setBottomHasMore] = useState();

    useEffect(() => {
        if (!event) return;
        switch (event.type) {
            case ChannelEventsEnum.FILE_DELETED:
                setFiles((pre) => {
                    let temp = [...pre];

                    temp = temp.filter((f) => f.id != event.data);
                    if (temp.length > 0) {
                        setTopHasMore(temp[0].id);
                        setBottomHasMore(temp[temp.length - 1].id);
                    }
                    return temp;
                });
                break;
            case ChannelEventsEnum.FILE_CREATED:
                setFiles((pre) => {
                    const sorted = [...event.data];
                    sorted.sort((a, b) => b.id - a.id);

                    const temp = [...sorted, ...pre];
                    if (temp.length > 0) {
                        setTopHasMore(temp[0].id);
                        setBottomHasMore(temp[temp.length - 1].id);
                    }
                    return temp;
                });
            default:
                break;
        }
    }, [event]);

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
        setFilterLoading(true);
        search("").then(() => {
            setFilterLoading(false);
        });
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

    function mutateFiles(pre, data, position) {
        if (position == "top") {
            return [...data, ...pre];
        } else {
            return [...pre, ...data];
        }
    }
    const loadMore = (position) => {
        // return new Promise((resolve, reject) => {});
        let last_id;
        if (position == "top") {
            last_id = topHasMore;
        } else {
            last_id = bottomHasMore;
        }
        if (last_id) {
            if (position == "top") {
                setTopLoading(true);
            } else {
                setBottomLoading(true);
            }

            return axios
                .get(route("files.index", workspace.id), {
                    params: {
                        name: searchFilter,
                        filter,
                        last_id,
                        direction: position,
                    },
                    // signal: token.current.signal,
                })
                .then((response) => {
                    if (response.status == 200) {
                        console.log(position, response.data);
                        if (position == "top") {
                            if (response.data.length > 0) {
                                setTopHasMore(response.data[0].id);
                            } else {
                                setTopHasMore(null);
                            }
                            setFiles((pre) =>
                                mutateFiles(pre, response.data, "top")
                            );
                        } else {
                            if (response.data.length > 0) {
                                setBottomHasMore(
                                    response.data[response.data.length - 1].id
                                );
                            } else {
                                setBottomHasMore(null);
                            }
                            setFiles((pre) =>
                                mutateFiles(pre, response.data, "bottom")
                            );
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
        return axios
            .get(route("files.index", workspace.id), {
                params: {
                    name: searchValue,
                    filter,
                    last_id: null,
                    direction: "bottom",
                },
                signal: token.current.signal,
            })
            .then((response) => {
                if (response.status == 200) {
                    console.log(response.data);
                    if (response.data.length > 0) {
                        setTopHasMore(response.data[0].id);
                        setBottomHasMore(
                            response.data[response.data.length - 1].id
                        );
                    } else {
                        setTopHasMore(null);
                        setBottomHasMore(null);
                    }
                    setFiles(mutateFiles([], response.data, "bottom"));
                }
            })
            .finally(() => {
                setTopLoading(false);
                setBottomLoading(false);
            });
    }
    return (
        <div className=" w-full h-full grid grid-cols-5">
            <div
                className={`h-full col-span-1 ${
                    theme.mode ? "bg-black/35" : "bg-white/15"
                }  px-2`}
            >
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
                        <div className="flex gap-x-2 items-center text-white/85">
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
                        <div className="flex gap-x-2 items-center text-white/85">
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
                        <div className="flex gap-x-2 items-center text-white/85">
                            <TbStack2 />
                            All files
                        </div>
                    </Button>
                </div>
            </div>
            <div className=" col-span-4 bg-background  max-h-full min-h-0">
                <div className="w-[67%] mx-auto flex flex-col max-h-full min-h-0  pb-4">
                    <div className="flex gap-x-4 my-4 items-center">
                        <h1 className="text-xl font-bold  text-color-high-emphasis">
                            {filter == "shared"
                                ? "Share with you"
                                : filter == "self"
                                ? "Created by you"
                                : "All files"}
                        </h1>
                        {filterLoading && (
                            <div className="flex gap-x-2 items-center  ">
                                <div className="h-6 w-6 relative">
                                    <LoadingSpinner />
                                </div>
                                <div className="text-xs text-color-medium-emphasis">
                                    Loading ...
                                </div>
                            </div>
                        )}
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
                                        className="flex items-center gap-x-4 w-full  p-2"
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
                                        <div className="text-xs text-color-medium-emphasis">
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
                        ref={containerRef}
                        className="flex flex-col  gap-y-4 mt-12  overflow-y-auto scrollbar flex-1"
                    >
                        {groupedFiles.map(({ date, fis }, pIndex) => {
                            if (!fis) return "";
                            return (
                                <li key={date}>
                                    <div className="font-bold text-color-medium-emphasis">
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
