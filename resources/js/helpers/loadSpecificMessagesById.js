export function loadSpecificMessagesById(
    workspaceId,
    messageId,
    channelId,
    threaded_message_id = null,
    token = null
) {
    return axios
        .get(
            route("messages.getSpecificMessagesById", {
                workspace: workspaceId,
                channel: channelId,
            }),
            {
                params: { threaded_message_id, messageId },
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
