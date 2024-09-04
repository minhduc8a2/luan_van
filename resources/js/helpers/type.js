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
