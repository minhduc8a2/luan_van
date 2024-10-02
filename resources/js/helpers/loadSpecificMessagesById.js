const loadChannelMessagesToken = { current: null };
export function loadChannelMessages(
    messageId,
    channelId,
    dispatch,
    setChannelData
) {
    if (loadChannelMessagesToken.current)
        loadChannelMessagesToken.current.abort();
    loadChannelMessagesToken.current = new AbortController();
    return axios
        .get(
            route("messages.getSpecificMessagesById", {
                channel: channelId,
                messageId: messageId,
            }),
            {
                signal: loadChannelMessagesToken.current.signal,
            }
        )
        .then((response) => {
            response.data.sort((a, b) => b.id - a.id);
            console.log(response.data);
            dispatch(
                setChannelData({
                    id: channelId,
                    data: { messages: response.data },
                })
            );
        })
        .finally(() => {
            // setLoadingMessageIdMessages(false);
        });
}
