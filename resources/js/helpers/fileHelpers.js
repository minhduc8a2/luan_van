export function isImage(type) {
    return type.startsWith("image/");
}
export function isDocument(type) {
    return [
        "application/msword", // .doc
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
        "application/vnd.ms-excel", // .xls
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
        "application/vnd.ms-powerpoint", // .ppt
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "application/pdf", // .pdf
        "text/plain", // .txt
    ].includes(type);
}
export function isWord(type) {
    return [
        "application/msword", // .doc
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
    ].includes(type);
}
export function isExcel(type) {
    return [
        "application/vnd.ms-excel", // .xls
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
    ].includes(type);
}

export function isPowerPoint(type) {
    return [
        "application/vnd.ms-powerpoint", // .ppt
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ].includes(type);
}
export function isPdf(type) {
    return [
        "application/pdf", // .pdf
    ].includes(type);
}

export function isPlainText(type) {
    return [
        "text/plain", // .txt
    ].includes(type);
}
export function getDocumentType(type) {
    switch (type) {
        case "video/mp4":
            return "MP4 video";
        case "video/webm":
            return "WebM video";
        case "video/ogg":
            return "OGG video";
        case "video/x-msvideo":
            return "AVI video";
        case "video/mpeg":
            return "MPEG video";
        case "video/quicktime":
            return "QuickTime video";
        case "application/msword":
        case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            return "Word document";
        case "application/vnd.ms-excel":
        case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
            return "Excel spreadsheet";
        case "application/pdf":
            return "PDF document";
        case "text/plain":
            return "Text file";
        case "application/vnd.ms-powerpoint":
        case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
            return "PowerPoint presentation";
        case "image/jpeg":
        case "image/png":
        case "image/gif":
        case "image/svg+xml":
        case "image/webp":
        case "image/bmp":
        case "image/tiff":
            return "Image file";
        default:
            return "Unknown file type";
    }
}
export function isVideo(type) {
    return type.startsWith("video/");
}
export function getLogo(type) {
    if (isWord(type)) return "word_jpg.jpg";
    if (isExcel(type)) return "excel_jpg.jpg";
    if (isPowerPoint(type)) return "powerpoint_jpg.jpg";
    if (isPdf(type)) return "pdf.jpg";
    if (isPlainText(type)) return "plaintext.jpg";

    return "file.png";
}
export function downloadFile(url, filename) {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.style.display = "none";
    document.body.appendChild(a);

    a.click();

    document.body.removeChild(a);
}
