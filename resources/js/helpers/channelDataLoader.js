// channelDataLoader.js

export function loadSomeChannelData(
    types,
    channelId,
    dispatch,
    setChannelData,
    tokens = []
) {
    if (tokens.length > 0) {
        tokens.forEach((token) => token.abort());
    }
    return Promise.all(
        types.map((type, index) =>
            loadChannelData(
                type,
                channelId,
                dispatch,
                setChannelData,
                tokens[index] || null
            )
        )
    );
}

export function loadChannelData(
    type,
    channelId,
    dispatch,
    setChannelData,
    token
) {
    return axios
        .get(
            route("channels.initChannelData", {
                channel: channelId,
            }),
            {
                params: {
                    only: type,
                },
                signal: token?.signal,
            }
        )
        .then((response) => {
            dispatch(setChannelData({ id: channelId, data: response.data }));
        });
}
export function loadChannelIfNotExists(
    channelId,
    channels,
    dispatch,
    addNewChannelToChannelsStore,
    token
) {
    if (channels.some((cn) => cn.id == channelId)) return Promise.resolve();

    return axios
        .get(
            route("channels.initChannelData", {
                channel: channelId,
            }),
            {
                params: {
                    only: "channel",
                },
                signal: token?.signal,
            }
        )
        .then((response) => {
            dispatch(addNewChannelToChannelsStore(response.data.channel));
        });
}
export function loadChannelMessages(
    channelId,
    dispatch,
    setChannelData,
    token
) {
    return axios
        .get(
            route("messages.infiniteMessages", {
                channel: channelId,
            }),
            {
                signal: token?.signal,
            }
        )
        .then((response) => {
            dispatch(
                setChannelData({
                    id: channelId,
                    data: { messages: response.data },
                })
            );
        });
}

export function loadChannelRelatedData(
    channelId,
    dispatch,
    setChannelData,
    addNewChannelToChannelsStore,
    channels,
    channelsData,
    tokens
) {
    if (channelsData[channelId]) {
        return Promise.resolve();
    }
    return Promise.all([
        loadChannelData(
            null,
            channelId,
            dispatch,
            setChannelData,
            tokens[0] || null
        ),
        loadChannelMessages(
            channelId,
            dispatch,
            setChannelData,
            tokens[1] || null
        ),
        loadChannelIfNotExists(
            channelId,
            channels,
            dispatch,
            addNewChannelToChannelsStore,
            tokens[2] || null
        ),
    ]);
}
