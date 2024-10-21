<?php

namespace App\Helpers;

enum ChannelEventsEnum
{
   case ADDED_TO_NEW_CHANNEL;
   case REMOVED_FROM_CHANNEL;
   case CHANGE_CHANNEL_TYPE;
   case REMOVE_USER_FROM_CHANNEL;
   case ADDED_AS_MANAGER;
   case REMOVED_MANAGER_ROLE;
   case ARCHIVE_CHANNEL;
   case UNARCHIVE_CHANNEL;
   case DELETE_CHANNEL;
}
