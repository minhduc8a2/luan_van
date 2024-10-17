<?php

namespace App\Http\Controllers;

use App\Models\Role;
use Inertia\Inertia;
use App\Helpers\Helper;
use App\Models\Channel;
use App\Models\Workspace;
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
        if ($request->user()->cannot('view', [Workspace::class, $workspace])) abort(403);

        return Inertia::render("Workspace/Index");
    }
    public function initWorkspaceData(Request $request, Workspace $workspace)
    {
        $user = $request->user();
        $workspaces =  $user->workspaces;
        $newNotificationsCount =  $user->notifications()->where("read_at", null)->count();
        $workspacePermissions =  ['createChannel' => $user->can('create', [Channel::class, $workspace]),];

        return [
            'publicAppUrl' => env('PUBLIC_APP_URL', ''),
            'workspaces' => $workspaces,
            'newNotificationsCount' => $newNotificationsCount,
            'workspacePermissions' => $workspacePermissions,
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

        return $this->clientRouting($request, $workspace);
    }
    public function settings(Request $request, Workspace $workspace)
    {
        return $this->clientRouting($request, $workspace);
    }
    public function accountAndProfile(Request $request, Workspace $workspace)
    {
        return $this->clientRouting($request, $workspace);
    }
    public function settingsHome(Request $request, Workspace $workspace)
    {
        return $this->clientRouting($request, $workspace);
    }
    public function manageMembers(Request $request, Workspace $workspace)
    {
        return $this->clientRouting($request, $workspace);
    }



    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Workspace $workspace)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Workspace $workspace)
    {
        $validated = $request->validate(["name" => "required|string|max:255"]);
        $workspace->fill($validated);
        $workspace->save();
        return Helper::createSuccessResponse();
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
