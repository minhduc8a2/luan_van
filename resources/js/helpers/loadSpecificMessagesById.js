export function loadSpecificMessagesById(
    messageId,
    channelId,
    threaded_message_id = null,
    token = null
) {
    return axios
        .get(
            route("messages.getSpecificMessagesById", {
                channel: channelId,
                messageId: messageId,
                threaded_message_id,
            }),
            {
                signal: token?.signal,
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
