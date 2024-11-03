<?php

namespace App\Helpers;

enum PermissionTypes
{
    case CHANNEL_ALL;
    case CHANNEL_VIEW;
    case CHANNEL_CHAT;
    case CHANNEL_HUDDLE;
    case CHANNEL_INVITATION;
    case CHANNEL_THREAD;
        //workspace permissions
    case WORKSPACE_ALL;
    case WORKSPACE_INVITATION;
    case WORKSPACE_INVITATION_WITH_ADMIN_APPROVAL_REQUIRED;
    case CREATE_CHANNEL;
    case SEARCH_CHANNEL;
}
