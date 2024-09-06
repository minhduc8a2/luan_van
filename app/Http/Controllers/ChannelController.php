<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Channel;
use App\Models\Workspace;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\Builder;


class ChannelController extends Controller
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
        //
    }

    /**
     * Display the specified resource.
     */

    public function show(Request $request,  Channel $channel)
    {

        if ($request->user()->cannot('view', $channel)) {
            return  abort(403);
        }

        if ($request->expectsJson()) {
            return ['messages' => $channel->messages()->with('attachments')->latest()->simplePaginate(10)];
        }

        $workspace = $channel->workspace;


        $channels = $workspace->channels()->where(function (Builder $query) {
            return $query->where("type", "=", "PUBLIC")
                ->orWhere("type", "=", "PRIVATE");
        })
            ->get();
        $user = $request->user();
        $directChannels = $workspace->channels()->where("type", "=", "DIRECT")->whereHas('users', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })->get();
        $selfChannel = $workspace->channels()->where("type", "=", "SELF")->where("user_id", "=", $request->user()->id)->first();

        $workspaces = $request->user()->workspaces;
        $users = $workspace->users;
        $notifications = $user->notifications;


        return Inertia::render("Workspace/Index", [
            'workspace' => $workspace,
            'channels' => $channels,
            'users' => $users,
            'channel' => $channel,
            'workspaces' => $workspaces,
            "directChannels" => $directChannels->load("users"),
            'selfChannel' => $selfChannel,
            'messages' => $channel->messages()->with('attachments')->latest()->simplePaginate(10),
            'channelUsers' => $channel->users,
            'notifications' => $notifications
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Channel $channel)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Channel $channel)
    {
        //
    }

    public function editDescription(Request $request, Channel $channel)
    {
        if ($request->user()->cannot('update', $channel)) {
            return  abort(403);
        }
        $validated = $request->validate(['description' => "string"]);
        try {
            $channel->description = $validated['description'];
            $channel->save();
            return back()->with('data', ['statusCode' => 201]);
        } catch (\Throwable $th) {
            return back()->with('data', ['statusCode' => 500]);
        }
    }
    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Channel $channel)
    {
        //
    }
}
