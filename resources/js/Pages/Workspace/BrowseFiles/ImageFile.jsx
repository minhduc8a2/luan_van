import FileItem from "@/Components/FileItem";
import React from "react";
import { AiOutlineZoomIn, AiOutlineZoomOut } from "react-icons/ai";
import { IoMdCloudDownload } from "react-icons/io";
import { MdOutlineRotate90DegreesCcw } from "react-icons/md";
import { PhotoProvider, PhotoView } from "react-photo-view";

export default function ImageFile({ file }) {
    return (
        <PhotoProvider
            toolbarRender={({
                onScale,
                scale,
                rotate,
                onRotate,
                images,
                index,
            }) => {
                return (
                    <>
                        <a
                            href={images[index].src}
                            className="PhotoView-Slider__toolbarIcon"
                            download={true}
                        >
                            <IoMdCloudDownload className="text-xl" />
                        </a>
                        <button
                            className="PhotoView-Slider__toolbarIcon"
                            onClick={() => onRotate(rotate + 90)}
                        >
                            <MdOutlineRotate90DegreesCcw className="text-xl" />
                        </button>
                        <button
                            className="PhotoView-Slider__toolbarIcon"
                            onClick={() => onScale(scale + 1)}
                        >
                            <AiOutlineZoomIn className="text-xl" />
                        </button>
                        <button
                            className="PhotoView-Slider__toolbarIcon"
                            onClick={() => onScale(scale - 1)}
                        >
                            <AiOutlineZoomOut className="text-xl" />
                        </button>
                    </>
                );
            }}
        >
            <PhotoView src={file.url}>
                <button className="w-full">
                    <FileItem file={file} maxWidth="w-full" />
                </button>
            </PhotoView>
        </PhotoProvider>
    );
}
