export function getMentionsFromContent(content) {
    const mentions = [];

    const findMentions = (node) => {
        if (node.type === "mention") {
            mentions.push(node.attrs);
        }

        if (node.content) {
            node.content.forEach(findMentions);
        }
    };

    findMentions(content);
    return mentions;
}
