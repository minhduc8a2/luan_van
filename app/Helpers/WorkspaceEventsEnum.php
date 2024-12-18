<?php

namespace App\Helpers;

enum WorkspaceEventsEnum
{
   case STORE_CHANNEL;
   case WORKSPACE_UPDATED;
   case INVITATION_PERMISSIONS_UPDATED;
   case DEACTIVATE_USER_UPDATED;
   case ACCEPT_JOINING_REQUEST;
   case USER_ROLE_UPDATED;
   case USER_UPDATED;
   case NEW_USER_JOIN_WORKSPACE;
   case NEW_USER_REQUEST_TO_JOIN_WORKSPACE;
   case INVITATION_LINK_CREATED;
   case INVITATION_LINK_UPDATED;
   case INVITATION_LINK_DELETED;
   case INVITATION_TYPE_EMAIL_CREATED;
   case INVITATION_TYPE_EMAIL_UPDATED;
   case INVITATION_TYPE_EMAIL_DELETED;
   case WORKSPACE_DELETED;
}
