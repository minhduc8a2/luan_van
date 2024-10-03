const loadChannelMessagesToken = { current: null };
export function loadSpecificMessagesById(
    messageId,
    channelId,

    threaded_message_id = null
) {
    if (loadChannelMessagesToken.current)
        loadChannelMessagesToken.current.abort();
    loadChannelMessagesToken.current = new AbortController();
    return axios
        .get(
            route("messages.getSpecificMessagesById", {
                channel: channelId,
                messageId: messageId,
                threaded_message_id,
            }),
            {
                signal: loadChannelMessagesToken.current.signal,
            }
        )
        .then((response) => {
            response.data.sort((a, b) => b.id - a.id);
            return response.data;
        })
        .finally(() => {
            // setLoadingMessageIdMessages(false);
        });
}
