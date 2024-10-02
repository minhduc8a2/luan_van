// channelDataLoader.js

const loadChannelDataTokens = { current: [] };

export function loadChannelRelatedData(types, channelId, dispatch, setChannelData) {
    if (loadChannelDataTokens.current.length > 0) {
        loadChannelDataTokens.current.forEach((token) => token.abort());
    }
    return Promise.all(
        types.map((type, index) => loadChannelData(type, index, channelId, dispatch, setChannelData))
    );
}

function loadChannelData(type, index, channelId, dispatch, setChannelData) {
    loadChannelDataTokens.current[index] = new AbortController();
    return axios
        .get(
            route("channels.initChannelData", {
                channel: channelId,
            }),
            {
                params: {
                    only: type,
                },
                signal: loadChannelDataTokens.current[index].signal,
            }
        )
        .then((response) => {
            dispatch(
                setChannelData({ id: channelId, data: response.data })
            );
        });
}
