import data from "@emoji-mart/data";
export function findNativeEmoji(emojiId) {
    return data.emojis[emojiId].skins[0].native;
}

export function groupReactions(reactions, channelUsers, currentUser) {
    if (!reactions) reactions = [];
    return Object.values(
        reactions.reduce((pre, reaction) => {
            const user = channelUsers.find(
                (user) => user.id === reaction.user_id
            );
            const userHasReacted = reaction.user_id == currentUser.id;
            if (pre.hasOwnProperty(reaction.emoji_id)) {
                if (!pre[reaction.emoji_id].hasReacted)
                    pre[reaction.emoji_id].hasReacted = userHasReacted;
                pre[reaction.emoji_id].users.push({
                    id: reaction.user_id,
                    name: user?.name,
                });
            } else {
                pre[reaction.emoji_id] = {};
                pre[reaction.emoji_id].hasReacted = userHasReacted;
                pre[reaction.emoji_id].emoji_id = reaction.emoji_id;
                pre[reaction.emoji_id].nativeEmoji = findNativeEmoji(
                    reaction.emoji_id
                );
                pre[reaction.emoji_id].users = [
                    { id: reaction.user_id, name: user?.name },
                ];
            }
            return pre;
        }, {})
    );
}
