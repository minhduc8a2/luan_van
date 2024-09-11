<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\User;
use Inertia\Inertia;
use App\Models\Channel;
use App\Models\Message;
use App\Models\Workspace;
use App\Helpers\BaseRoles;
use Illuminate\Http\Request;
use App\Events\SettingsEvent;
use App\Helpers\ChannelTypes;
use App\Events\WorkspaceEvent;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Broadcast;

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
        // return back()->withErrors(['server' => "Something went wrong, please try later!"]);

        if ($request->user()->cannot('create', [Channel::class, $workspace])) abort(403);
        $validated = $request->validate(["name" => "required|string|max:255", "type" => "required|in:PUBLIC,PRIVATE"]);
        try {


            //check channel exists

            $channelExists = $workspace->channels()->where('name', '=', $validated['name'])->exists();
            if ($channelExists) {
                return back()->withErrors(['client' => "Channel exists! Please choose a different name!"]);
            }
            //
            /**
             * @var Channel $channel
             */
            $channel = $request->user()->ownChannels()->create(['name' => $validated['name'], 'type' => $validated['type'], 'workspace_id' => $workspace->id]);
            $channel->assignManagerRoleAndManagerPermissions($request->user());
            $channel->initChannelPermissions();
            broadcast(new WorkspaceEvent($workspace, "storeChannel", $request->user()->id))->toOthers();
            return back();
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
        $user = $request->user();
        $workspace = $channel->workspace;
        $availableChannels = $workspace->channels()->where("type", "=", ChannelTypes::PUBLIC->name)->get();

        $channels =  DB::table('channels')
            ->join('channel_user', 'channels.id', '=', 'channel_user.channel_id')
            ->leftJoin('messages', function ($join) {
                $join->on('messages.messagable_id', '=', 'channel_user.channel_id')
                    ->where('messages.messagable_type', '=', 'App\\Models\\Channel');
            })
            ->select(
                'channels.id',
                'channels.name',
                'channels.description',
                'channels.type',
                'channels.workspace_id',
                'channels.user_id',
                'channels.is_main_channel',
                DB::raw('COUNT(CASE WHEN messages.created_at > channel_user.last_read_at OR channel_user.last_read_at IS NULL THEN 1 END) as unread_messages_count')
            )
            ->where('channel_user.user_id', $user->id)
            ->where('channels.workspace_id', $workspace->id)
            ->where(function ($query) {
                $query->where('channels.type', 'PUBLIC')
                    ->orWhere('channels.type', 'PRIVATE');
            })
            ->groupBy(
                'channels.id',
                'channels.name',
                'channels.description',
                'channels.type',
                'channels.workspace_id',
                'channels.user_id',
                'channels.is_main_channel'
            )
            ->get();

        $directChannels = $workspace->channels()->where("type", "=", "DIRECT")->whereHas('users', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })->get();
        $selfChannel = $workspace->channels()->where("type", "=", "SELF")->where("user_id", "=", $request->user()->id)->first();

        $workspaces = $request->user()->workspaces;
        $users = $workspace->users;
        $notifications = $user->notifications;


        return Inertia::render("Workspace/Index", [
            'workspace' => $workspace,
            'availableChannels' => $availableChannels,
            'channels' => $channels,
            'users' => $users,
            'channel' => $channel->load('user'),
            'managers' => fn() => $channel->users()->wherePivot('role_id', '=', Role::getRoleByName(BaseRoles::MANAGER->name)->id)->get(),
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
            broadcast(new SettingsEvent($channel, "editDescription"))->toOthers();

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
            broadcast(new SettingsEvent($channel, "editName"))->toOthers();
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
            broadcast(new SettingsEvent($channel, "changeType"))->toOthers();
            return back();
        } catch (\Throwable $th) {
            return back()->withErrors(["server" => "Something went wrong! Please try later"]);
        }
    }

    public function leave(Request $request, Channel $channel)
    {
        if ($request->user()->cannot('leave', $channel)) {
            return  abort(403);
        }

        try {
            if ($channel->is_main_channel) {
                return back()->withErrors(["user_error" => "Cannot leave this channel!"]);
            }
            $request->user()->channels()->detach($channel->id);
            return redirect(route('workspace.show', $channel->workspace->id));
        } catch (\Throwable $th) {
            return back()->withErrors(["server" => "Something went wrong! Please try later"]);
        }
    }

    public function removeUserFromChannel(Request $request, Channel $channel)
    {
        if ($request->user()->cannot('removeUserFromChannel', $channel)) {
            return  abort(403);
        }

        try {
            if ($channel->is_main_channel) {
                return back()->withErrors(["user_error" => "Cannot remove user from this channel!"]);
            }

            $validated = $request->validate(['user_id' => ['required|integer']]);
            $user = User::find($validated['user_id']);
            $user->channels()->detach($channel->id);
            return back();
        } catch (\Throwable $th) {
            return back()->withErrors(["server" => "Something went wrong! Please try later"]);
        }
    }

    public function addManagers(Request $request, Channel $channel)
    {

        if ($request->user()->cannot('addManagers', $channel)) abort(403);

        try {
            //code...
            $validated = $request->validate(["users" => "required|array"]);
            $users = $validated['users'];
            foreach ($users as $u) {
                $user = User::find($u['id']);
                $user->channels()->updateExistingPivot($channel->id, [
                    'role_id' => Role::getRoleByName(BaseRoles::MANAGER->name)->id,
                ]);
            }
            broadcast(new SettingsEvent($channel, "addManagers"))->toOthers();
            return back();
        } catch (\Throwable $th) {

            return back()->withErrors(['server' => "Something went wrong! Please try later."]);
        }
    }
    public function removeManager(Request $request, Channel $channel)
    {


        if ($request->user()->cannot('removeManager', $channel)) abort(403);
        try {
            //code...
            $validated = $request->validate(["user" => "required"]);
            $user = $validated['user'];
            $user = User::find($user['id']);
            $user->channels()->updateExistingPivot($channel->id, [
                'role_id' => Role::getRoleByName(BaseRoles::MEMBER->name)->id,
            ]);
            broadcast(new SettingsEvent($channel, "removeManager"))->toOthers();
            return back();
        } catch (\Throwable $th) {

            return back()->withErrors(['server' => "Something went wrong! Please try later."]);
        }
    }
    public function lastRead(Request $request, Channel $channel)
    {


        if ($request->user()->cannot('view', $channel)) abort(403);
        try {
            $request->user()->channels()->updateExistingPivot($channel->id, [
                'last_read_at' => Carbon::now(),
            ]);
            return back();
        } catch (\Throwable $th) {

            return back()->withErrors(['server' => "Something went wrong! Please try later."]);
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
