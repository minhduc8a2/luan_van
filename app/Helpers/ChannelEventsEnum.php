<?php

namespace App\Helpers;

enum ChannelEventsEnum
{
      //user notification events
   case ADDED_TO_NEW_CHANNEL;
   case REMOVED_FROM_CHANNEL;
   case ADDED_AS_MANAGER;
   case REMOVED_MANAGER_ROLE;
      //Property updated
   case CHANNEL_UPDATED;
      //channel events
   case CHANGE_CHANNEL_TYPE;
   case REMOVE_USER_FROM_CHANNEL;
   case ARCHIVE_CHANNEL;
   case UNARCHIVE_CHANNEL;
   case DELETE_CHANNEL;
   case ADD_MANAGERS;
   case REMOVE_MANAGER;
   case ADD_USERS_TO_CHANNEL;
   case UPDATE_CHANNEL_PERMISSIONS;
   case NEW_USER_JOIN;
   case LEAVE;
      //File events
   case FILE_CREATED;
   case FILE_DELETED;
      //Message events
   case NEW_MESSAGE_CREATED;
   case MESSAGE_EDITED;
   case MESSAGE_DELETED;
   case REACTION_CREATED;
   case REACTION_DELETED;
}
