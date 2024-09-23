import React, { useMemo } from "react";
import { LuFileVideo } from "react-icons/lu";
import {
    FaFile,
    FaRegFileExcel,
    FaRegFilePdf,
    FaRegFilePowerpoint,
    FaRegFileVideo,
    FaRegFileWord,
} from "react-icons/fa";
import {
   
    isImage,
    isVideo,
    isWord,
    isExcel,
    isPowerPoint,
    isPdf,
    isPlainText,
    
} from "@/helpers/fileHelpers";
import { IoDocumentTextOutline } from "react-icons/io5";
export default function FileIcon({ type }) {
    function getIcon(type) {
        if (isWord(type)) return <FaRegFileWord />;
        if (isExcel(type)) return <FaRegFileExcel />;
        if (isPowerPoint(type)) return <FaRegFilePowerpoint />;
        if (isPdf(type)) return <FaRegFilePdf />;
        if (isPlainText(type)) return <IoDocumentTextOutline />;
        if (isImage(type)) return <FaRegFileImage />;
        if (isVideo(type)) return <FaRegFileVideo />;
        
        return <FaFile />;
    }
    const Icon = useMemo(() => {
        return getIcon(type);
    }, [type]);
    return Icon;
}
