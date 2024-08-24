export function isImage(type) {
    return type.startsWith("image/");
}
export function isDocument(type) {
    return [
        "application/msword", // .doc
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
        "application/vnd.ms-excel", // .xls
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
        "application/pdf", // .pdf
        "text/plain", // .txt
    ].includes(type);
}
