<?php

namespace App\Http\Controllers;

use App\Models\Role;
use Inertia\Inertia;
use App\Models\Channel;
use App\Models\Workspace;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\Builder;



class WorkspaceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function initWorkspaceData(Request $request, Workspace $workspace)
    {
        $user = $request->user();
        $workspaces =  $user->workspaces;
        $newNotificationsCount =  $user->notifications()->where("read_at", null)->count();
        $workspacePermissions =  ['createChannel' => $user->can('create', [Channel::class, $workspace]),];

        return [
            'default_avatar_url' => env('DEFAULT_AVATAR_URL'),
            'publicAppUrl' => env('PUBLIC_APP_URL', ''),
            'workspaces' => $workspaces,
            'newNotificationsCount' => $newNotificationsCount,
            'workspacePermissions' => $workspacePermissions,
            'workspace' => $workspace
        ];
    }
    public function index()
    {
        //
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

        return Inertia::render("Workspace/Index");
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
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Workspace $workspace)
    {
        //
    }
}
