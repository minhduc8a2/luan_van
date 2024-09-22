import Button from "@/Components/Button";
import React, { useEffect, useMemo, useRef, useState } from "react";

import { PiShareFat } from "react-icons/pi";
import { FaRegUser } from "react-icons/fa6";
import { TbStack2 } from "react-icons/tb";
import SearchInput from "@/Components/Input/SearchInput";
import { router, usePage } from "@inertiajs/react";
import { getDocumentType, isImage, isVideo } from "@/helpers/fileHelpers";
import { FaImage } from "react-icons/fa6";
import { FaFile } from "react-icons/fa";
import { MdOutlineVideoLibrary } from "react-icons/md";

import {
    compareDateTime,
    formatDDMMYYY,
    groupListByDate,
} from "@/helpers/dateTimeHelper";

import Item from "./Item";
import OverlayLoadingSpinner from "@/Components/Overlay/OverlayLoadingSpinner";
import Video from "@/Components/Video";
import { InView } from "react-intersection-observer";
export default function BrowseFiles() {
    const { auth, flash, workspace } = usePage().props;
    const [files, setFiles] = useState(new Map());
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState("all");
    const localFoundRef = useRef(false);
    const [searchValue, setSearchValue] = useState("");
    const [showVideo, setShowVideo] = useState(false);
    const prevScrollHeightRef = useRef(null);
    const containerRef = useRef(null);
    const nextPageUrlRef = useRef(null);
    function getIcon(type) {
        if (isImage(type)) return <FaImage />;
        if (isVideo(type)) return <MdOutlineVideoLibrary />;
        return <FaFile />;
    }
    function mutateFiles(pre, list) {
        const temp = new Map(pre);
        if (!list) return temp;
        list.forEach((file) => temp.set(file.id, file));
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
    const filesList = useMemo(() => [...files.values()], [files]);
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
        [filesList, filter]
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
    }, [filesList, searchValue]);
    useEffect(() => {
        // if (!searchValue) {
        //     return;
        // }
        if (localFoundRef.current) return;
        const controller = new AbortController();
        const delayDebounceFn = setTimeout(() => {
            setLoading(true);

            axios
                .get(route("files.index", workspace.id), {
                    params: { filter, name: searchValue, page: 1 },
                    signal: controller.signal,
                })
                .then((response) => {
                    // console.log(response.data?.data);
                    nextPageUrlRef.current = response.data?.next_page_url;
                    setFiles((pre) => mutateFiles(pre, response.data?.data));
                    setLoading(false);
                })
                .catch((error) => {
                    console.log(error);

                    setLoading(false);
                });
        }, 500);

        return () => {
            controller.abort();
            clearTimeout(delayDebounceFn);
        };
    }, [searchValue, filter]);

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

    return (
        <div className=" w-full h-full grid grid-cols-5">
            {showVideo && (
                <Video
                    src={showVideo.url}
                    fullScreenMode
                    onFullScreenClose={() => setShowVideo(null)}
                />
            )}

            <div className="h-full col-span-1 bg-black/35 px-2">
                <h3 className="text-xl font-semibold p-4">Files</h3>
                <div className="">
                    <Button className=" bg-transparent">
                        <div
                            className="flex gap-x-2 items-center"
                            onClick={() => {
                                setFilter("shared");
                                localFoundRef.current = false;
                                nextPageUrlRef.current = null;
                            }}
                        >
                            <PiShareFat />
                            Share with you
                        </div>
                    </Button>
                    <Button
                        className=" bg-transparent"
                        onClick={() => {
                            setFilter("self");
                            localFoundRef.current = false;
                            nextPageUrlRef.current = null;
                        }}
                    >
                        <div className="flex gap-x-2 items-center">
                            <FaRegUser />
                            Created by you
                        </div>
                    </Button>
                    <hr className="my-2" />

                    <Button
                        className=" bg-transparent"
                        onClick={() => {
                            setFilter("all");
                            localFoundRef.current = false;
                            nextPageUrlRef.current = null;
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
                        list={filesList}
                        onItemClick={() => {}}
                        filterFunction={(searchValue, list) => {
                            return list.filter((item) =>
                                item.name.toLowerCase().includes(searchValue)
                            );
                        }}
                        onChange={(e) => {
                            setSearchValue(e.target.value);
                            localFoundRef.current = false;
                        }}
                        renderItemNode={(item) => {
                            return (
                                <button
                                    onClick={() => {
                                        if (isVideo(item.type)) {
                                            setShowVideo(item);
                                        }
                                    }}
                                    className="flex items-center gap-x-4 w-full  "
                                >
                                    <div className="flex-1 items-center flex gap-x-4 min-w-0 max-w-full overflow-hidden">
                                        <div className="text-link">
                                            {getIcon(item.type)}
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
                    <ul
                        ref={containerRef}
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
                                        <div key={file.id}>
                                            <Item file={file} />
                                            {pIndex ==
                                                groupedFiles.length - 1 &&
                                                cIndex == fis.length - 1 && (
                                                    <InView
                                                        onChange={(inView) => {
                                                            console.log(inView);
                                                            if (
                                                                inView &&
                                                                nextPageUrlRef.current
                                                            ) {
                                                                prevScrollHeightRef.current =
                                                                    containerRef.current.scrollHeight;

                                                                axios
                                                                    .get(
                                                                        nextPageUrlRef.current
                                                                    )
                                                                    .then(
                                                                        (
                                                                            response
                                                                        ) => {
                                                                            // console.log(response.data?.data);
                                                                            nextPageUrlRef.current =
                                                                                response.data?.next_page_url;
                                                                            setFiles(
                                                                                (
                                                                                    pre
                                                                                ) =>
                                                                                    mutateFiles(
                                                                                        pre,
                                                                                        response
                                                                                            .data
                                                                                            ?.data
                                                                                    )
                                                                            );
                                                                            setLoading(
                                                                                false
                                                                            );
                                                                        }
                                                                    )
                                                                    .catch(
                                                                        (
                                                                            error
                                                                        ) => {
                                                                            console.log(
                                                                                error
                                                                            );

                                                                            setLoading(
                                                                                false
                                                                            );
                                                                        }
                                                                    );
                                                            }
                                                        }}
                                                    ></InView>
                                                )}
                                        </div>
                                    ))}
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
        </div>
    );
}
