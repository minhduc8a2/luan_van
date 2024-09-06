import data from "@emoji-mart/data";
export function findNativeEmoji(emojiId){
    return data.emojis[emojiId].skins[0].native;
}