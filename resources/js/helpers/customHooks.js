import { useSelector } from "react-redux";
import { useMemo, useRef, useState } from "react";
import axios from "axios";
import useErrorHandler from "./useErrorHandler";
const useChannelData = (channelId) => {
    const channelsData = useSelector((state) => state.channelsData);

    return (
        (channelsData.hasOwnProperty(channelId) && channelsData[channelId]) || {
            permissions: {},
            messages: [],
            channelPermissions: [],
            channelUserIds: [],
            managerIds: [],
        }
    );
};

const useManagers = (channelId) => {
    const { managerIds } = useChannelData(channelId);
    const { workspaceUsers } = useSelector((state) => state.workspaceUsers);

    const managers = useMemo(() => {
        if (!managerIds.length || !workspaceUsers.length) {
            return [];
        }

        return workspaceUsers.filter((user) =>
            managerIds.some((id) => user.id === id)
        );
    }, [managerIds, workspaceUsers]);
    return { managers };
};

const useChannelUsers = (channelId) => {
    const { channelUserIds } = useChannelData(channelId);
    const { workspaceUsers } = useSelector((state) => state.workspaceUsers);

    const channelUsers = useMemo(() => {
        if (!channelUserIds?.length || !workspaceUsers?.length) {
            return [];
        }
        return workspaceUsers.filter((user) =>
            channelUserIds.some((id) => user.id === id)
        );
    }, [channelUserIds, workspaceUsers]);
    return { channelUsers };
};
const useChannel = (channelId) => {
    const { channels } = useSelector((state) => state.channels);

    const channel = useMemo(() => {
        return channels.find((cn) => cn.id == channelId) || null; // Return null if not found
    }, [channels, channelId]);

    return {
        channel,
    };
};

const useCustomedForm = (
    initValues = {},
    {
        method = "POST",
        url = "",
        params = {},
        headers = {},
        hasEchoHeader = false,
    }
) => {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errors, setErrors] = useState(false);
    const errorHandler = useErrorHandler();
    const values = useRef(initValues);
    const token = useRef(null);
    function setValues(name, value) {
        values.current[name] = value;
    }

    function getValues() {
        return { ...values.current };
    }
    function cancel() {
        if (token.current) {
            token.current.abort();
        }
    }
    function reset() {
        setLoading(false);
        setSuccess(false);
        setErrors(null);
        values.current = initValues;
        token.current = null;
    }
    async function submit() {
        token.current = new AbortController();
        setLoading(true);
        return axios({
            method,
            url,
            headers: hasEchoHeader
                ? {
                      ...headers,
                      "X-Socket-Id": Echo.socketId(),
                  }
                : headers,
            data: getValues(),
            signal: token.current.signal,
            params,
        })
            .then((reponse) => {
                setSuccess(true);
                return reponse;
            })

            .finally(() => {
                setLoading(false);
            })
            .catch(errorHandler);
    }

    return {
        submit,
        cancel,
        getValues,
        errors,
        success,
        loading,
        setValues,
        reset,
    };
};

export {
    useChannelData,
    useManagers,
    useChannel,
    useChannelUsers,
    useCustomedForm,
};
