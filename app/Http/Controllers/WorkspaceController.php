<?php

namespace App\Http\Controllers;

use App\Events\WorkspaceEvent;
use App\Helpers\BaseRoles;
use App\Models\Role;
use Inertia\Inertia;
use App\Helpers\Helper;
use App\Helpers\PermissionTypes;
use App\Helpers\WorkspaceEventsEnum;
use App\Models\Channel;
use App\Models\Invitation;
use App\Models\Workspace;
use App\Notifications\WorkspaceNotification;
use Carbon\Carbon;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Cache;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

class WorkspaceController extends Controller
{
    /**
     * Display a listing of the resource.
     */

    function clientRouting(Request $request, Workspace $workspace)
    {


        return Inertia::render("Workspace/Index");
    }
    public function initWorkspaceData(Request $request, Workspace $workspace)
    {
        $only = $request->query('only');
        $user = $request->user();
        $workspaces = fn() => $user->workspaces;
        $newNotificationsCount = fn() =>  $user->notifications()
            ->whereNull('read_at')
            ->whereRaw("JSON_EXTRACT(data, '$.byUser.id') != ?", [$request->user()->id])
            ->count();
        $workspacePermissions = fn() =>  [
            'createChannel' => $user->can('create', [Channel::class, $workspace]),
            'update' => $user->can('update', [Workspace::class, $workspace]),
            'inviteToWorkspace' => $user->can('create', [Invitation::class, $workspace]),
            'isInvitationToWorkspaceWithAdminApprovalRequired' => $workspace->isInvitationToWorkspaceWithAdminApprovalRequired()
        ];
        switch ($only) {
            case 'workspacePermissions':
                return ['workspacePermissions' => $workspacePermissions(),];
            case 'workspaces':
                return ['workspaces' => $workspaces(),];
            case 'newNotificationsCount':
                return ['newNotificationsCount' => $newNotificationsCount(),];
            case 'workspace':
                return ['workspace' => $workspace];
        }
        return [
            'publicAppUrl' => env('PUBLIC_APP_URL', ''),
            'workspaces' => $workspaces(),
            'newNotificationsCount' => $newNotificationsCount(),
            'workspacePermissions' => $workspacePermissions(),
            'workspace' => $workspace
        ];
    }

    public function index(Request $request)
    {
        if ($request->expectsJson()) {
            return ['workspaces' => $request->user()->workspaces];
        }
        return Inertia::render("Workspace/Index");
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        if ($request->user()->cannot('create', Workspace::class)) {
            abort(403);
        }

        $validated = $request->validate(['name' => 'required|max:255|string', 'channel' => 'required|max:255|string']);

        $user = $request->user();
        try {
            DB::beginTransaction();

            /**
             * @var Workspace $workspace
             */
            $workspace = $user->ownWorkspaces()->create(['name' => $validated['name']]);
            $workspace->assignAdminRoleAndAdminPermissions($user);
            $workspace->createWorkspaceMemberPermissions();
            $workspace->createInitChannels($user, $validated['channel']);
            $workspace->createAndAssignSelfChannelForUser($user);
            DB::commit();
            return ['workspaceId' => $workspace->id, 'main_channel_id' => $workspace->mainChannel()->id];
        } catch (\Throwable $th) {
            DB::rollBack();

            abort(500, 'Something went wrong! Please try later!');
        }
        //create workspace

    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, Workspace $workspace)
    {
        if ($request->user()->cannot('view', [Workspace::class, $workspace])) abort(403);
        return $this->clientRouting($request, $workspace);
    }
    public function settings(Request $request, Workspace $workspace)
    {
        if ($request->user()->cannot('update', [Workspace::class, $workspace])) abort(403);
        return $this->clientRouting($request, $workspace);
    }
    public function accountAndProfile(Request $request, Workspace $workspace)
    {
        if ($request->user()->cannot('update', [Workspace::class, $workspace])) abort(403);
        return $this->clientRouting($request, $workspace);
    }
    public function settingsHome(Request $request, Workspace $workspace)
    {
        if ($request->user()->cannot('view', [Workspace::class, $workspace])) abort(403);
        return $this->clientRouting($request, $workspace);
    }
    public function manageMembers(Request $request, Workspace $workspace)
    {
        if ($request->user()->cannot('update', [Workspace::class, $workspace])) abort(403);

        return $this->clientRouting($request, $workspace);
    }
    public function aboutWorkspace(Request $request, Workspace $workspace)
    {
        if ($request->user()->cannot('view', [Workspace::class, $workspace])) abort(403);
        return $this->clientRouting($request, $workspace);
    }
    public function invitations(Request $request, Workspace $workspace)
    {
        if ($request->user()->cannot('viewInvitations', [Workspace::class, $workspace])) abort(403);

        if ($request->expectsJson()) {
            return ['invitations' => $workspace->invitations()->get()];
        }

        return $this->clientRouting($request, $workspace);
    }



    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Workspace $workspace)
    {
        //
    }

    public function updateInvitationPermission(Request $request, Workspace $workspace)
    {
        if ($request->user()->cannot('update', [Workspace::class, $workspace])) abort(401);
        $validated = $request->validate(['requiredAdminApproval' => 'boolean|required']);

        $requiredAdminApproval = $validated['requiredAdminApproval'];
        try {
            DB::beginTransaction();
            $permissionType = $requiredAdminApproval
                ? PermissionTypes::WORKSPACE_INVITATION_WITH_ADMIN_APPROVAL_REQUIRED->name
                : PermissionTypes::WORKSPACE_INVITATION->name;

            $workspace->permissions()->whereIn('permission_type', [
                PermissionTypes::WORKSPACE_INVITATION->name,
                PermissionTypes::WORKSPACE_INVITATION_WITH_ADMIN_APPROVAL_REQUIRED->name
            ])->delete();

            $memberRoleId = Role::getRoleIdByName(BaseRoles::MEMBER->name);
            $workspace->permissions()->create(['permission_type' => $permissionType, 'role_id' => $memberRoleId]);

            broadcast(new WorkspaceEvent($workspace->id, WorkspaceEventsEnum::INVITATION_PERMISSIONS_UPDATED->name));

            DB::commit();
            return Helper::createSuccessResponse();
        } catch (\Throwable $th) {
            DB::rollBack();
            dd($th);
            Helper::createErrorResponse();
        }
    }

    public function changeMemberRole(Request $request, Workspace $workspace)
    {
        if ($request->user()->cannot('changeMemberRole', [Workspace::class, $workspace])) abort(401);

        $validated = $request->validate(['userId' => 'required|integer', 'role' => 'required|string|in:OWNER,ADMIN,MEMBER']);
        $role = $validated['role'];
        $userId = $validated['userId'];
        if ($userId == $workspace->user_id) {
            return Helper::createErrorResponse();
        }
        try {
            DB::beginTransaction();
            if ($role == "OWNER") {
                $workspace->users()->updateExistingPivot($userId, ['role_id' => Role::getRoleIdByName(BaseRoles::ADMIN->name)]);
                $workspace->user_id = $userId;
                $workspace->save();
            } else {
                $workspace->users()->updateExistingPivot($userId, ['role_id' => Role::getRoleIdByName($role)]);
            }

            $user = $workspace->users()->where('users.id', $userId)->first();
            $user->workspaceRole = Role::find($user->pivot->role_id)->setVisible(["name"]);
            broadcast(new WorkspaceEvent($workspace->id, WorkspaceEventsEnum::USER_ROLE_UPDATED->name,  $user));
            DB::commit();
            return Helper::createSuccessResponse();
        } catch (\Throwable $th) {
            DB::rollBack();

            Helper::createErrorResponse();
        }
    }

    public function acceptJoiningRequest(Request $request, Workspace $workspace)
    {
        if ($request->user()->cannot('acceptJoiningRequest', [Workspace::class, $workspace])) abort(401);

        $validated = $request->validate(['userIds' => 'required|array', 'userIds.*' => 'integer']);

        $userIds = $validated['userIds'];

        try {
            DB::beginTransaction();
            $acceptedUsers = [];
            foreach ($userIds as $userId) {

                $user = $workspace->users()->where('users.id', $userId)->first();
                if (!$user) continue;
                if ($user->pivot->is_approved) {
                    continue;
                }

                $workspace->addUserToWorkspace($user);
                $user->pivot->is_approved = true;
                $user->workspaceRole = Role::find($user->pivot->role_id)->setVisible(["name"]);
                $workspace->pivot = $user->pivot;
                $user->notify(new WorkspaceNotification($workspace, "AcceptJoiningRequest"));
                array_push($acceptedUsers, $user);
            }
            broadcast(new WorkspaceEvent($workspace->id, WorkspaceEventsEnum::ACCEPT_JOINING_REQUEST->name,  data: $acceptedUsers));
            DB::commit();
            return Helper::createSuccessResponse();
        } catch (\Throwable $th) {
            DB::rollBack();

            Helper::createErrorResponse();
        }
    }
    public function deactivateUser(Request $request, Workspace $workspace)
    {
        if ($request->user()->cannot('deactivateUser', [Workspace::class, $workspace])) abort(401);

        $validated = $request->validate(['userId' => 'required|integer', 'wantDeactivate' => "required|boolean"]);

        $userId = $validated['userId'];
        $wantDeactivate = $validated['wantDeactivate'];
        if ($userId == $workspace->user_id) {
            return Helper::createErrorResponse();
        }
        try {
            DB::beginTransaction();
            $exists = $workspace->users()->where('users.id', $userId)->first();

            if ($exists) {
                $workspace->users()->updateExistingPivot($userId, ['is_deactivated' => $wantDeactivate]);
                broadcast(new WorkspaceEvent($workspace->id, WorkspaceEventsEnum::DEACTIVATE_USER_UPDATED->name, data: $workspace->users()->where('users.id', $userId)->first()));
            }
            DB::commit();
            return Helper::createSuccessResponse();
        } catch (\Throwable $th) {
            DB::rollBack();

            Helper::createErrorResponse();
        }
    }
    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Workspace $workspace)
    {
        if ($request->user()->cannot('update', [Workspace::class, $workspace])) abort(401);
        $validated = $request->validate(["name" => "required|string|max:255"]);
        try {
            DB::beginTransaction();
            $workspace->fill($validated);
            $workspace->save();
            DB::commit();
            return Helper::createSuccessResponse();
        } catch (\Throwable $th) {
            DB::rollBack();
            // dd($th);
            Helper::createErrorResponse();
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Workspace $workspace)
    {

        if ($request->user()->id != $workspace->user_id) abort(401, "Unauthorized actions");
        $validated = $request->validate([
            'current_password' => ['required', 'string', 'max:255', 'min:8'],

        ]);
        $attemptKey = 'delete-workspace-attempts-' . $request->user()->id;
        $maxAttempts = 3;


        if (RateLimiter::tooManyAttempts($attemptKey, $maxAttempts)) {
            $seconds = RateLimiter::availableIn($attemptKey);


            abort(429, 'Too many failed attempts. Please try again in ' . $seconds . ' ' . Str::plural('second', $seconds) . '.');
        }


        if (Hash::check($validated['current_password'], $request->user()->password)) {
            RateLimiter::clear($attemptKey);
            try {
                DB::beginTransaction();
                //delete user notifications belongs to workspace
                $request->user()->notifications()->whereJsonContains('data->workspace->id', $workspace->id)->delete();
                //
                //delete permissions because not cascading on delete
                $channelIds = $workspace->channels()->pluck('id');

                DB::table('permissions')->where('permissionable_type', Channel::class)->whereIn('permissionable_id', $channelIds)->delete();
                $workspace->permissions()->delete();
                //
                $workspace->delete();
                DB::commit();
            } catch (\Throwable $th) {
                DB::rollBack();
                Helper::createErrorResponse();
            }
        } else {
            RateLimiter::increment($attemptKey);
            throw ValidationException::withMessages([
                'current_password' => 'Password is incorrect.',
            ]);
        }
    }
}
