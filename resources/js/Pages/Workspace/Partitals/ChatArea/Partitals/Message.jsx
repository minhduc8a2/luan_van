import React from "react";
import { UTCToTime } from "@/helpers/dateTimeHelper";
import { generateHTML } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Avatar from "@/Components/Avatar";
import { isDocument, isImage } from "@/helpers/fileHelpers";
import "react-photo-view/dist/react-photo-view.css";
import { PhotoProvider, PhotoView } from "react-photo-view";
export default function Message({ message, user, hasChanged, index }) {
    const attachments = message.attachments;
    return (
        <div
            className={`message-container pl-8 pb-2  break-all hover:bg-white/10 ${
                hasChanged || index == 0 ? "pt-4" : "mt-0"
            }`}
        >
            {hasChanged || index == 0 ? (
                <Avatar src={user.avatar_url} noStatus={true} />
            ) : (
                <div></div>
            )}
            <div className="mx-3">
                {hasChanged || index == 0 ? (
                    <div className="flex gap-x-2">
                        <div className="text-sm font-bold">{user.name}</div>
                        <div className="text-xs">
                            {UTCToTime(message.updated_at)}
                        </div>
                    </div>
                ) : (
                    ""
                )}

                <div
                    className="prose prose-invert "
                    dangerouslySetInnerHTML={{
                        __html: generateHTML(JSON.parse(message.content), [
                            StarterKit,
                        ]),
                    }}
                ></div>
                <div className="flex  gap-x-4 flex-wrap">
                    <PhotoProvider
                        toolbarRender={({ onScale, scale }) => {
                            return (
                                <>
                                    <svg
                                        className="PhotoView-Slider__toolbarIcon"
                                        onClick={() => onScale(scale + 1)}
                                    />
                                    <svg
                                        className="PhotoView-Slider__toolbarIcon"
                                        onClick={() => onScale(scale - 1)}
                                    />
                                </>
                            );
                        }}
                    >
                        {attachments.map((attachment) => {
                            if (isImage(attachment.type)) {
                                return (
                                    <div className="h-64">
                                        <PhotoView
                                            key={index}
                                            src={attachment.url}
                                        >
                                            <img
                                                src={attachment.url}
                                                alt=""
                                                className="max-h-full rounded-lg"
                                            />
                                        </PhotoView>
                                    </div>
                                );
                            } else if (isDocument(attachment.type)) {
                                return (
                                    <div className="" key={attachment.id}>
                                        {attachment.name}
                                    </div>
                                );
                            }
                        })}
                    </PhotoProvider>
                </div>
            </div>
        </div>
    );
}
