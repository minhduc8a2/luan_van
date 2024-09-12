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

            $mainChannel = $workspace->channels->where('is_main_channel', '=', true)->first();
            return redirect()->route('channel.show', $mainChannel->id);
            DB::commit(); 

        } catch (\Throwable $th) {
            DB::rollBack(); 

            return back()->withErrors(['server' => 'Something went wrong! Please try later!']);
        }
        //create workspace

    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, Workspace $workspace)
    {
        if ($request->user()->cannot('view', [Workspace::class,$workspace])) abort(403);
        $mainChannel = $workspace->channels->where('is_main_channel', '=', true)->first();
        return redirect()->route('channel.show', $mainChannel->id);
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
