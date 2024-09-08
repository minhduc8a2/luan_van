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