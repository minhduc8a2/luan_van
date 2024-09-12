//huddle ------------------------------------
export function isHuddleInvitationNotificationType(givenType) {
    const huddleInvitationNotificationType = [
        "App\\Notifications\\HuddleInvitationNotification",
        "HUDDLE_INVITATION_NOTIFICATION",
    ];
    return (
        huddleInvitationNotificationType.findIndex((i) => i == givenType) >= 0
    );
}
export function isHuddleInvitationNotificationBroadcast(givenType) {
    return givenType == "App\\Notifications\\HuddleInvitationNotification";
}
//mention ------------------------------------
export function isMentionNotification(givenType) {
    const mentionNotificationType = [
        "App\\Notifications\\MentionNotification",
        "MENTION_NOTIFICATION",
    ];
    return (
        mentionNotificationType.findIndex((i) => i == givenType) >= 0
    );
}

export function isMentionNotificationBroadcast(givenType) {
    return givenType == "App\\Notifications\\MentionNotification";
}

//added to new channel ------------------------------------
export function isChannelsNotification(givenType) {
    const channelsNotificationType = [
        "App\\Notifications\\ChannelsNotification",
        "CHANNELS_NOTIFICATION",
    ];
    return (
        channelsNotificationType.findIndex((i) => i == givenType) >= 0
    );
}

export function isChannelsNotificationBroadcast(givenType) {
    return givenType == "App\\Notifications\\ChannelsNotification";
}