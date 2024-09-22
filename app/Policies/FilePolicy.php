<?php

namespace App\Policies;

use App\Models\File;
use App\Models\User;
use App\Helpers\ChannelTypes;
use App\Helpers\PermissionTypes;
use App\Models\Workspace;

class FilePolicy
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
    public function view(User $user, File $file): bool {}

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        //
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, File $file): bool
    {
        //
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, File $file, Workspace $workspace): bool
    {
        if ($user->id == $file->id) return true;

        if ($user->workspacePermissionCheck($workspace, PermissionTypes::WORKSPACE_ALL->name)) {
            return $workspace->channels()->whereHas('users', function ($query) use ($user, $file) {
                $query->where('users.id', $user->id);
            })->whereHas('messages', function ($query) use ($file) {
                $query->whereHas('files', function ($query) use ($file) {
                    $query->where('files.id', $file->id);
                });
            })->orWhere(function ($query) use ($file) {
                $query->where('type', ChannelTypes::PUBLIC)->whereHas('messages', function ($query) use ($file) {
                    $query->whereHas('files', function ($query) use ($file) {
                        $query->where('files.id', $file->id);
                    });
                });
            })->exists();
        }
        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, File $file): bool
    {
        //
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, File $file): bool
    {
        //
    }
}
