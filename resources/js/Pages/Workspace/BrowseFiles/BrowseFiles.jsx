import Button from "@/Components/Button";
import React, { useEffect, useRef, useState } from "react";
import { LuClock3 } from "react-icons/lu";
import { PiShareFat } from "react-icons/pi";
import { FaRegUser } from "react-icons/fa6";
import { TbStack2 } from "react-icons/tb";
import SearchInput from "@/Components/Input/SearchInput";
import { router, usePage } from "@inertiajs/react";
import {
    getDocumentType,
    isImage,
    isVideo,
    isWord,
} from "@/helpers/fileHelpers";
import { FaImage } from "react-icons/fa6";
import { FaFile } from "react-icons/fa";
import { MdOutlineVideoLibrary } from "react-icons/md";
export default function BrowseFiles() {
    const { auth, flash } = usePage().props;
    const [files, setFiles] = useState(new Map());
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState("shared");
    const [searchValue, setSearchValue] = useState("");
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
    useEffect(() => {
        // router.get(
        //     route("files.index"),
        //     { filter, name: searchValue, page: 1 },
        //     {
        //         preserveState: true,
        //         only: [],
        //     }
        // );
        const controller = new AbortController();

        axios
            .get(route("files.index"), {
                signal: controller.signal,
                params: { filter, name: searchValue, page: 1 },
            })
            .then((response) => {
                console.log(response);
                setFiles((pre) => mutateFiles(pre, response.data?.data));
                setLoading(false);
            })
            .catch((err) => {
                console.log(err);
            });

        return () => {
            controller.abort();
        };
    }, []);
    // useEffect(() => {
    //     console.log(flash);
    // }, [flash]);
    useEffect(() => {
        if (!searchValue) {
            return;
        }

        const controller = new AbortController();
        const delayDebounceFn = setTimeout(() => {
            setLoading(true);

            axios
                .get(route("files.index"), {
                    params: { filter, name: searchValue, page: 1 },
                    signal: controller.signal,
                })
                .then((response) => {
                    console.log(response.data?.data);
                    setFiles((pre) => mutateFiles(pre, response.data?.data));
                    setLoading(false);
                })
                .catch((error) => {
                    setLoading(false);
                });
        }, 500);

        return () => {
            controller.abort();
            clearTimeout(delayDebounceFn);
        };
    }, [searchValue]);
    return (
        <div className=" w-full h-full grid grid-cols-5">
            <div className="h-full col-span-1 bg-black/35 px-2">
                <h3 className="text-xl font-semibold p-4">Files</h3>
                <div className="">
                    <Button className=" bg-transparent">
                        <div className="flex gap-x-2 items-center">
                            <PiShareFat />
                            Share with you
                        </div>
                    </Button>
                    <Button className=" bg-transparent">
                        <div className="flex gap-x-2 items-center">
                            <FaRegUser />
                            Created by you
                        </div>
                    </Button>
                    <hr className="my-2" />

                    <Button className=" bg-transparent">
                        <div className="flex gap-x-2 items-center">
                            <TbStack2 />
                            All files
                        </div>
                    </Button>
                </div>
            </div>
            <div className="h-full col-span-4 bg-background">
                <div className="w-[67%] mx-auto">
                    <SearchInput
                        list={[...files.values()]}
                        onItemClick={() => {}}
                        filterFunction={(searchValue, list) => {
                            return list.filter((item) =>
                                item.name.toLowerCase().includes(searchValue)
                            );
                        }}
                        onChange={(e) => {
                            setSearchValue(e.target.value);
                        }}
                        renderItemNode={(item) => {
                            return (
                                <button
                                    onClick={() => {}}
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
                </div>
            </div>
        </div>
    );
}
