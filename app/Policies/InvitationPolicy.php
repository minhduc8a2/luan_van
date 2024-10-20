<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Workspace;
use App\Models\Invitation;
use App\Helpers\PermissionTypes;
use Illuminate\Auth\Access\Response;

class InvitationPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        //
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Invitation $invitation): bool
    {
        //
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user, Workspace $workspace): bool
    {
        return
            $user->workspacePermissionCheck($workspace, PermissionTypes::WORKSPACE_ALL->name)
            ||
            $user->workspacePermissionCheck($workspace, PermissionTypes::WORKSPACE_INVITATION->name)
            ||
            $user->workspacePermissionCheck($workspace, PermissionTypes::WORKSPACE_INVITATION_WITH_ADMIN_APPROVAL_REQUIRED->name);
    }
    public function resendInvitation(User $user, Workspace $workspace): bool
    {
        return
            $user->workspacePermissionCheck($workspace, PermissionTypes::WORKSPACE_ALL->name);
    }



    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Invitation $invitation): bool
    {
        //
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user,  Workspace $workspace): bool
    {
        return
            $user->workspacePermissionCheck($workspace, PermissionTypes::WORKSPACE_ALL->name);
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Invitation $invitation): bool
    {
        //
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Invitation $invitation): bool
    {
        //
    }
}
