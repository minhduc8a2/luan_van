<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Workspace;
use App\Policies\WorkspacePolicy;
use Illuminate\Http\Request;

use function PHPSTORM_META\type;

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
        $workspace->channels()->createMany(['name' => $validated['channel'], 'type' => 'PUBLIC', 'user_id' => $user->id], ['name' => "all-" . $workspace->name, 'type' => 'PUBLIC', 'user_id' => $user->id], ['name' => "social", 'type' => 'PUBLIC', 'user_id' => $user->id]);
        return redirect();
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, Workspace $workspace)
    {
        if ($request->user()->cannot('view', $workspace)) {
            abort(403);
        }

        $firstChannel = $workspace->channels->first();

        return redirect(route('channel.show', [$workspace->id, $firstChannel->id]));
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
