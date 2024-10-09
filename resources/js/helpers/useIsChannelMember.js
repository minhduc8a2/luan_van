import { useSelector } from "react-redux";

const useIsChannelMember = (channelId) => {
    const { joinedChannelIds } = useSelector((state) => state.joinedChannelIds);
    return joinedChannelIds.hasOwnProperty(channelId) && joinedChannelIds[channelId]==true;
};

export default useIsChannelMember;
