export function isHiddenUser(workspaceUsers, userId) {
    let user = workspaceUsers.find((u) => u.id == userId);
    if (user) {
        if (user.is_hidden) return true;
    }
    return false;
}
