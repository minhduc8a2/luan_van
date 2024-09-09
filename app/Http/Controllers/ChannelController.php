<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Channel;
use App\Models\Message;
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
    public function store(Request $request, Workspace $workspace)
    {

        if ($request->user()->cannot('create', [Channel::class, $workspace])) abort(403);
        $validated = $request->validate(["name" => "required|string|max:255", "type" => "required|in:PUBLIC,PRIVATE"]);
        try {
            $channel = $request->user()->ownChannels()->create(['name' => $validated['name'], 'type' => $validated['type'], 'workspace_id' => $workspace->id]);
            $request->user()->channels()->attach($channel->id);
            return redirect(route('channel.show', $channel->id));
        } catch (\Throwable $th) {

            return back()->withErrors(['server' => "Something went wrong, please try later!"]);
        }
    }

    /**
     * Display the specified resource.
     */

    public function show(Request $request,  Channel $channel)
    {
        $perPage = 10;

        if ($request->user()->cannot('view', $channel)) {
            return  abort(403);
        }

        $messageId = $request->query('message_id');
        $pageNumber = null;
        if ($messageId) {
            $message = Message::find($messageId);
            if ($message) {

                $messagePosition = $channel->messages()
                    ->latest() // Order by latest first
                    ->where('created_at', '>=', $message->created_at) // Messages that are newer or equal to the mentioned one
                    ->count();
                $pageNumber = ceil($messagePosition / $perPage);
            }
        }

        if ($request->expectsJson()) {
            return ['messages' => $channel->messages()->with([
                'attachments',
                'reactions',
                'thread' => function ($query) {
                    $query->withCount('messages');
                }
            ])->latest()->simplePaginate($perPage, ['*'], 'page', $pageNumber)];
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
            'channel' => $channel->load('user'),
            'workspaces' => $workspaces,
            "directChannels" => $directChannels->load("users"),
            'selfChannel' => $selfChannel,
            'messages' => $channel->messages()->with([
                'attachments',
                'reactions',
                'thread' => function ($query) {
                    $query->withCount('messages');
                }
            ])->latest()->simplePaginate($perPage, ['*'], 'page', $pageNumber),
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
        if ($request->user()->cannot('updateDescription', $channel)) {
            return  abort(403);
        }

        $validated = $request->validate(['description' => "string|nullable"]);

        try {
            $channel->description = $validated['description'] ?? "";
            $channel->save();
            return back();
        } catch (\Throwable $th) {
            return back()->withErrors(["server" => "Something went wrong! Please try later"]);
        }
    }
    public function editName(Request $request, Channel $channel)
    {
        if ($request->user()->cannot('updateName', $channel)) {
            return  abort(403);
        }
        $validated = $request->validate(['name' => "required|string"]);
        try {
            $channel->name = $validated['name'];
            $channel->save();
            return back();
        } catch (\Throwable $th) {
            return back()->withErrors(["server" => "Something went wrong! Please try later"]);
        }
    }

    public function changeType(Request $request, Channel $channel)
    {
        if ($request->user()->cannot('changeType', $channel)) {
            return  abort(403);
        }
        $validated = $request->validate(['type' => "required|in:PUBLIC,PRIVATE"]);
        try {
            $channel->type = $validated['type'];
            $channel->save();
            return back();
        } catch (\Throwable $th) {
            return back()->withErrors(["server" => "Something went wrong! Please try later"]);
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
