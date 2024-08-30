<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Workspace;
use Illuminate\Http\Request;
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
        $workspace = $user->ownWorkspaces()->create(['name' => $validated['name']]);
        $user->workspaces()->attach($workspace->id);
        $workspace->channels()->createMany([
            ['name' => $validated['channel'], 'type' => 'PUBLIC', 'user_id' => $user->id],
            ['name' => "all-" . $workspace->name, 'type' => 'PUBLIC', 'user_id' => $user->id],
            ['name' => "social", 'type' => 'PUBLIC', 'user_id' => $user->id]
        ]);
        $workspace->assignUserToPublicChannels($user);
        $workspace->createAndAssignSelfChannelsForUser($user);

        return redirect(route('workspace.show', $workspace->id));
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, Workspace $workspace)
    {
        if ($request->user()->cannot('view', $workspace)) {
            abort(403);
        }



        $channels = $workspace->channels()->where(function (Builder $query) {
            return $query->where("type", "=", "PUBLIC")
                ->orWhere("type", "=", "PRIVATE");
        })
            ->get();
        $directChannels = $workspace->channels()->where("type", "=", "DIRECT")->get();
        $selfChannel = $workspace->channels()->where("type", "=", "SELF")->where("user_id", "=", $request->user()->id)->first();

        $workspaces = $request->user()->workspaces;
        $users = $workspace->users;

        return Inertia::render("Workspace/Index", [
            'workspace' => $workspace,
            'channels' => $channels,
            'users' => $users,
            'workspaces' => $workspaces,
            "directChannels" => $directChannels->load("users"),
            'selfChannel' => $selfChannel
        ]);
    }

    public function getDirectChannels(Request $request, Workspace $workspace)
    {
        if ($request->user()->cannot('view', $workspace)) {
            abort(403);
        }
        $directChannels = $workspace->channels()->where("type", "=", "DIRECT")->get();
        return $directChannels;
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
