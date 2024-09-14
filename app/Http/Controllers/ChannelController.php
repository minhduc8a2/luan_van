<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\User;
use Inertia\Inertia;
use App\Models\Thread;
use App\Models\Channel;
use App\Models\Message;
use App\Models\Workspace;
use App\Helpers\BaseRoles;
use Illuminate\Http\Request;
use App\Events\SettingsEvent;
use App\Helpers\ChannelTypes;
use App\Events\WorkspaceEvent;
use Illuminate\Support\Carbon;
use App\Helpers\PermissionTypes;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Broadcast;
use App\Notifications\ChannelsNotification;

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
            DB::beginTransaction();

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

            DB::commit();
            return back();
        } catch (\Throwable $th) {
            DB::rollBack();
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
            return  redirect(route('workspace.show', $channel->workspace->id));
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
        $availableChannels = fn() => $workspace->channels()->where("type", "=", ChannelTypes::PUBLIC->name)->get();

        $channels = fn() => $user->channels()
            ->whereIn("type", [ChannelTypes::PUBLIC->name, ChannelTypes::PRIVATE->name])
            ->where('is_archived', false)
            ->withCount([
                'messages as unread_messages_count' => function (Builder $query) use ($user) {
                    $query->where("created_at", ">", function ($query) use ($user) {
                        $query->select('last_read_at')
                            ->from('channel_user')
                            ->whereColumn('channel_user.channel_id', 'channels.id')
                            ->where('channel_user.user_id', $user->id)
                            ->limit(1);
                    })->orWhereNull('last_read_at');
                }
            ])->get();

        $directChannels = fn() => $user->channels()
            ->where("type",  ChannelTypes::DIRECT->name)
            ->where('is_archived', false)
            ->withCount([
                'messages as unread_messages_count' => function (Builder $query) use ($user) {
                    $query->where("created_at", ">", function ($query) use ($user) {
                        $query->select('last_read_at')
                            ->from('channel_user')
                            ->whereColumn('channel_user.channel_id', 'channels.id')
                            ->where('channel_user.user_id', $user->id)
                            ->limit(1);
                    })->orWhereNull('last_read_at');
                }
            ])->get();
        $selfChannel = fn() => $workspace->channels()->where("type", "=", "SELF")->where("user_id", "=", $request->user()->id)->first();

        $workspaces = fn() => $request->user()->workspaces;
        $users = fn() => $workspace->users;
        $notifications = fn() => $user->notifications;

        $permissions = fn() => [
            'view' => $user->can('view', [Channel::class, $channel]),
            'archive' => $user->can('archive', [Channel::class, $channel]),
            'chat' => $user->can('create', [Message::class, $channel]),
            'thread' => $user->can('create', [Thread::class, $channel]),
            'createChannel' => $user->can('create', [Channel::class, $workspace]),
            'updateDescription' => $user->can('updateDescription', [Channel::class, $channel]),
            'updateName' => $user->can('updateName', [Channel::class, $channel]),
            'updatePermissions' => $user->can('updatePermissions', [Channel::class, $channel]),
            'changeType' => $user->can('changeType', [Channel::class, $channel]),
            'leave' => $user->can('leave', [Channel::class, $channel]),
            'addManagers' => $user->can('addManagers', [Channel::class, $channel]),
            'removeManager' => $user->can('removeManager', [Channel::class, $channel]),
            'removeUserFromChannel' => $user->can('removeUserFromChannel', [Channel::class, $channel]),
            'addUsersToChannel' => $user->can('addUsersToChannel', [Channel::class, $channel]),
            'deleteChannel' => $user->can('delete', [Channel::class, $channel]),
            'huddle' => $channel->allowHuddlePermission(),

        ];

        $channelPermissions = fn() => [
            'channelPostPermission' => $channel->chatPermission(),
            'addChannelMembersPermission' => $channel->addChannelMembersPermission(),
            'allowHuddle' => $channel->allowHuddlePermission(),
            'allowThread' => $channel->allowThreadPermission(),
        ];
        return Inertia::render("Workspace/Index", [
            'channelPermissions' => $channelPermissions,
            'workspace' => $workspace,
            'permissions' => $permissions,
            'availableChannels' => $availableChannels,
            'channels' => $channels,
            'users' => $users,
            'channel' => $channel->load('user'),
            'managers' => fn() => $channel->users()->wherePivot('role_id', '=', Role::getRoleByName(BaseRoles::MANAGER->name)->id)->get(),
            'workspaces' => $workspaces,
            "directChannels" => $directChannels,
            'selfChannel' => $selfChannel,
            'messages' => fn() => $channel->messages()->with([
                'attachments',
                'reactions',
                'thread' => function ($query) {
                    $query->withCount('messages');
                }
            ])->latest()->simplePaginate($perPage, ['*'], 'page', $pageNumber),
            'channelUsers' => fn() => $channel->users,
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
            DB::beginTransaction();

            $channel->description = $validated['description'] ?? "";
            $channel->save();
            broadcast(new SettingsEvent($channel, "editDescription"))->toOthers();
            DB::commit();

            return back();
        } catch (\Throwable $th) {
            DB::rollBack();
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
            DB::beginTransaction();

            $channel->name = $validated['name'];
            $channel->save();
            broadcast(new SettingsEvent($channel, "editName"))->toOthers();
            DB::commit();

            return back();
        } catch (\Throwable $th) {
            DB::rollBack();
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
            DB::beginTransaction();

            $channel->type = $validated['type'];
            $channel->save();
            broadcast(new SettingsEvent($channel, "changeType"))->toOthers();
            DB::commit();

            return back();
        } catch (\Throwable $th) {
            DB::rollBack();

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
            DB::beginTransaction();

            $request->user()->channels()->detach($channel->id);
            broadcast(new SettingsEvent($channel, "leave"))->toOthers();
            DB::commit();

            return redirect(route('workspace.show', $channel->workspace->id));
        } catch (\Throwable $th) {
            DB::rollBack();

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
            DB::beginTransaction();
            $validated = $request->validate(['user' => ['required']]);
            $user = User::find($validated['user']['id']);
            $user->channels()->detach($channel->id);

            //archive messages
            $messages = Message::where('messagable_id', $channel->id)
                ->where('messagable_type', Channel::class)
                ->where('user_id', $user->id)
                ->get();
            foreach ($messages as $message) {
                $message->user_name = $user->name;
                $message->save();
                $thread = $message->thread;
                if (isset($thread)) {

                    $thread->messages()->update(['user_name' => $user->name]);
                }
            }


            //notify
            broadcast(new SettingsEvent($channel, "removeUserFromChannel"))->toOthers();
            $user->notify(new ChannelsNotification($request->user(), $user, $channel, "removedFromChannel"));
            Message::createStringMessageAndBroadcast($channel, $request->user(), $request->user()->name . " has removed " . $user->name . " from channel");

            DB::commit();
            return back();
        } catch (\Throwable $th) {
            DB::rollBack();
            dd($th);
            return back()->withErrors(["server" => "Something went wrong! Please try later"]);
        }
    }
    public function addUsersToChannel(Request $request, Channel $channel)
    {
        if ($request->user()->cannot('addUsersToChannel', $channel)) {
            return  abort(403);
        }

        try {
            $validated = $request->validate(["users" => "required|array"]);
            DB::beginTransaction();

            $users = $validated['users'];
            foreach ($users as $u) {
                $user = User::find($u['id']);
                if ($user->channels()->where('channels.id', '=', $channel->id)->exists()) continue;
                $user->channels()->attach($channel->id, ['role_id' => Role::getRoleIdByName(BaseRoles::MEMBER->name)]);
                $user->notify(new ChannelsNotification($request->user(), $user, $channel, "addedToNewChannel"));
                Message::createStringMessageAndBroadcast($channel, $request->user(), $request->user()->name . " has added " . $user->name . " to channel");
            }
            broadcast(new SettingsEvent($channel, "addUsersToChannel"))->toOthers();
            DB::commit();

            return back();
        } catch (\Throwable $th) {
            DB::rollBack();

            // dd($th);
            return back()->withErrors(["server" => "Something went wrong! Please try later"]);
        }
    }

    public function addManagers(Request $request, Channel $channel)
    {

        if ($request->user()->cannot('addManagers', $channel)) abort(403);

        try {
            //code...
            $validated = $request->validate(["users" => "required|array"]);
            DB::beginTransaction();

            $users = $validated['users'];
            foreach ($users as $u) {
                $user = User::find($u['id']);
                $user->channels()->updateExistingPivot($channel->id, [
                    'role_id' => Role::getRoleIdByName(BaseRoles::MANAGER->name),
                ]);
            }
            broadcast(new SettingsEvent($channel, "addManagers"))->toOthers();
            DB::commit();

            return back();
        } catch (\Throwable $th) {
            DB::rollBack();

            return back()->withErrors(['server' => "Something went wrong! Please try later."]);
        }
    }
    public function removeManager(Request $request, Channel $channel)
    {


        if ($request->user()->cannot('removeManager', $channel)) abort(403);
        try {
            //code...
            $validated = $request->validate(["user" => "required"]);
            DB::beginTransaction();

            $user = $validated['user'];
            $user = User::find($user['id']);
            $user->channels()->updateExistingPivot($channel->id, [
                'role_id' => Role::getRoleIdByName(BaseRoles::MEMBER->name),
            ]);
            broadcast(new SettingsEvent($channel, "removeManager"))->toOthers();
            DB::commit();

            return back();
        } catch (\Throwable $th) {
            DB::rollBack();

            return back()->withErrors(['server' => "Something went wrong! Please try later."]);
        }
    }
    public function lastRead(Request $request, Channel $channel)
    {


        if ($request->user()->cannot('view', $channel)) abort(403);
        try {
            DB::beginTransaction();

            $request->user()->channels()->updateExistingPivot($channel->id, [
                'last_read_at' => Carbon::now(),
            ]);
            DB::commit();

            return back();
        } catch (\Throwable $th) {
            DB::rollBack();

            return back()->withErrors(['server' => "Something went wrong! Please try later."]);
        }
    }

    public function updatePermissions(Request $request, Channel $channel)
    {


        if ($request->user()->cannot('updatePermissions', $channel)) abort(403);
        try {
            DB::beginTransaction();

            $validated = $request->validate([
                'channelPostPermission' => 'required|string',
                'addChannelMembersPermission' => 'required|string',
                'allowHuddle' => 'required|boolean',
                'allowThread' => 'required|boolean',
            ]);

            //who can post
            $whoCanPost = $validated['channelPostPermission'];
            switch ($whoCanPost) {
                case 'everyone':
                    $channel->createChannelGuestPermissions(PermissionTypes::CHANNEL_CHAT->name);
                    $channel->createChannelMemberPermissions(PermissionTypes::CHANNEL_CHAT->name);
                    break;
                case 'everyone_except_guests':
                    $channel->createChannelMemberPermissions(PermissionTypes::CHANNEL_CHAT->name);
                    $channel->deleteGuestPermission(PermissionTypes::CHANNEL_CHAT->name);
                    break;
                case 'channel_managers_only':
                    $channel->deleteGuestPermission(PermissionTypes::CHANNEL_CHAT->name);
                    $channel->deleteMemberPermission(PermissionTypes::CHANNEL_CHAT->name);
                    break;
            }
            //who can add members
            $whoCanAddMembers = $validated['addChannelMembersPermission'];
            switch ($whoCanAddMembers) {
                case 'everyone_except_guests':
                    $channel->createChannelMemberPermissions(PermissionTypes::CHANNEL_INVITATION->name);
                    break;
                case 'channel_managers_only':
                    $channel->deleteMemberPermission(PermissionTypes::CHANNEL_INVITATION->name);

                    break;
            }
            //allow huddle
            $allowHuddle = $validated['allowHuddle'];
            if ($allowHuddle) {
                $channel->createChannelGuestPermissions(PermissionTypes::CHANNEL_HUDDLE->name);
                $channel->createChannelMemberPermissions(PermissionTypes::CHANNEL_HUDDLE->name);
            } else {
                $channel->deleteGuestPermission(PermissionTypes::CHANNEL_HUDDLE->name);
                $channel->deleteMemberPermission(PermissionTypes::CHANNEL_HUDDLE->name);
            }

            //allow thread
            $allowThread = $validated['allowThread'];
            if ($allowThread) {
                $channel->createChannelGuestPermissions(PermissionTypes::CHANNEL_THREAD->name);
                $channel->createChannelMemberPermissions(PermissionTypes::CHANNEL_THREAD->name);
            } else {
                $channel->deleteGuestPermission(PermissionTypes::CHANNEL_THREAD->name);
                $channel->deleteMemberPermission(PermissionTypes::CHANNEL_THREAD->name);
            }
            broadcast(new SettingsEvent($channel, "updateChannelPermissions"))->toOthers();

            DB::commit();
            return back();
        } catch (\Throwable $th) {
            DB::rollBack();
            return back()->withErrors(['server' => "Something went wrong! Please try later."]);
        }
    }


    public function archive(Request $request, Channel $channel)
    {
        // return back()->withErrors(['server' => "Something went wrong! Please try later."]);

        if ($request->user()->cannot('archive', $channel)) abort(403);
        $validated = $request->validate(['status' => 'required|boolean']);
        try {
            DB::beginTransaction();
            $channel->is_archived = $validated['status'];

            $channel->save();
            DB::commit();
            return back();
        } catch (\Throwable $th) {
            DB::rollBack();
            // dd($th);
            return back()->withErrors(['server' => "Something went wrong! Please try later."]);
        }
    }
    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Channel $channel)
    {
        if ($request->user()->cannot('delete', $channel)) abort(403);
        try {
            DB::beginTransaction();
            $workspace = $channel->workspace;
            $messages = $channel->messages()->with('thread')->get();
            $messages->each(function ($message) {
                if ($message->thread) {
                    $message->thread->messages()->delete();
                    // $message->thread->delete();  cascadeOnDelete
                }
            });
            $channel->messages()->delete();
            $channel->permissions()->delete();
            $channel->delete();
            DB::commit();
            return redirect(route('workspace.show', $workspace->id));
        } catch (\Throwable $th) {
            DB::rollBack();

            return back()->withErrors(['server' => "Something went wrong! Please try later."]);
        }
    }
}
