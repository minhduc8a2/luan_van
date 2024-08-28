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
        $workspace = $channel->workspace;
        if ($request->user()->cannot('view', $workspace)) {
            return  abort(403);
        }
        $channels = $workspace->channels()->where(function (Builder $query) {
            return $query->where("type", "=", "PUBLIC")
                ->orWhere("type", "=", "PRIVATE");
        })
            ->get();
        $directChannels = $workspace->channels()->where("type", "=", "DIRECT")->get();
        $selfChannel = $workspace->channels()->where("type", "=", "SELF")->where("user_id", "=", $request->user()->id)->first();
        $messages = $channel->messages;
        $workspaces = $request->user()->workspaces;
        $users = $workspace->users;
        $channelUsers = $channel->users;
        return Inertia::render("Workspace/Index", [
            'workspace' => $workspace,
            'channel' => $channel,
            'channels' => $channels,
            'messages' => $messages->load('attachments'),
            'users' => $users,
            'channelUsers' => $channelUsers,
            'workspaces' => $workspaces,
            "directChannels" => $directChannels->load("users"),
            'selfChannel' => $selfChannel
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

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Channel $channel)
    {
        //
    }
}
