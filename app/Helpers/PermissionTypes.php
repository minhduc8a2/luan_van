<?php

namespace App\Helpers;

enum PermissionTypes
{
    case CHANNEL_ALL;
    case CHANNEL_VIEW;
    case CHANNEL_CHAT;
    case CHANNEL_HUDDLE;
    case CHANNEL_INVITATION;
    case CHANNEL_EDIT_DESCRIPTION;
    case CHANNEL_EDIT_NAME;
    case WORKSPACE_ALL;

    case CREATE_CHANNEL;
    case WORKSPACE_INVITATION;
    case SEARCH_CHANNEL;
}
