<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\User;
use Inertia\Inertia;

use App\Helpers\Helper;
use App\Models\Channel;
use App\Models\Message;
use App\Models\Reaction;
use App\Models\Workspace;
use App\Helpers\BaseRoles;
use App\Events\ChannelEvent;
use Illuminate\Http\Request;
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
    public function initChannelData(Request $request, Channel $channel)
    {
        if ($request->user()->cannot('view', $channel)) {
            return  abort(403, "You are not allowed to view this channel");
        }
        $user = $request->user();
        $only = $request->query("only");
        $permissions = fn() => [
            'join' => $user->can('join', [Channel::class, $channel]),
            'view' => $user->can('view', [Channel::class, $channel]),
            'archive' => $user->can('archive', [Channel::class, $channel]),
            'chat' => $user->can('create', [Message::class, $channel]),
            'thread' => $user->can('createThread', [Message::class, $channel]),
            'createReaction' => $user->can('create', [Reaction::class, $channel]),
            'deleteReaction' => $user->can('delete', [Reaction::class, $channel]),
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
            'deleteAnyMessage' => $user->can('deleteAnyMessageInChannel', [Message::class, $channel]),
            'channelPostPermission' => $channel->chatPermission(),
            'addChannelMembersPermission' => $channel->addChannelMembersPermission(),
            'allowHuddle' => $channel->allowHuddlePermission(),
            'allowThread' => $channel->allowThreadPermission(),
        ];




        $managerIds = fn() =>  $channel->users()->wherePivot('role_id', '=', Role::getRoleByName(BaseRoles::MANAGER->name)->id)->pluck('users.id');
        $channelUserIds = fn() => $channel->users->pluck('id');

        switch ($only) {

            case 'permissions':
                return ['permissions' => $permissions()];

            case 'manager_ids':
                return ['managerIds' => $managerIds()];

            case 'channel_user_ids':
                return ['channelUserIds' => $channelUserIds()];

            case 'channel':
                return ['channel' => $channel];
        }
        return [


            'permissions' => $permissions(),
            'managerIds' => $managerIds(),
            'channelUserIds' => $channelUserIds(),


        ];
    }

    public function getRegularChannels(Request $request, Workspace $workspace)
    {
        if ($request->user()->cannot('view', [Workspace::class, $workspace])) {
            abort(404);
        }
        $user = $request->user();
        $channelId = $request->query('channelId');
        $hiddenUserIds =  $user->hiddenUsers()->wherePivot('workspace_id', $workspace->id)->pluck('hidden_user_id')->toArray();
        $query =
            $user->channels()

            ->withCount([
                'messages as unread_messages_count' => function (Builder $query) use ($user, $hiddenUserIds) {
                    $query->whereNotIn('user_id', $hiddenUserIds)->where("created_at", ">", function ($query) use ($user) {
                        $query->select('last_read_at')
                            ->from('channel_user')
                            ->whereColumn('channel_user.channel_id', 'channels.id')
                            ->where('channel_user.user_id', $user->id)
                            ->limit(1);
                    })->orWhereNull('last_read_at');
                }
            ])->withCount('users');
        if ($channelId) {
            $channels = $query->where('channels.id', $channelId)->first();
        } else {
            $channels = $query->whereIn("type", [ChannelTypes::PUBLIC->name, ChannelTypes::PRIVATE->name])
                ->where("workspace_id", $workspace->id)
                ->where('is_archived', false)->get();
        }
        return $channels;
    }

    public function getWorkspaceChannels(Request $request, Workspace $workspace)
    {
        if ($request->user()->cannot('view', [Workspace::class, $workspace])) {
            abort(404);
        }
        try {
            $user = $request->user();
            $hiddenUserIds =  $user->hiddenUsers()->wherePivot('workspace_id', $workspace->id)->pluck('hidden_user_id')->toArray();
            $regularchannels =  $user->channels()
                ->whereIn("type", [ChannelTypes::PUBLIC->name, ChannelTypes::PRIVATE->name])
                ->where("workspace_id", $workspace->id)
                ->where('is_archived', false)
                ->withCount([
                    'messages as unread_messages_count' => function (Builder $query) use ($user, $hiddenUserIds) {
                        $query->whereNotIn('user_id', $hiddenUserIds)->where("created_at", ">", function ($query) use ($user) {
                            $query->select('last_read_at')
                                ->from('channel_user')
                                ->whereColumn('channel_user.channel_id', 'channels.id')
                                ->where('channel_user.user_id', $user->id)
                                ->limit(1);
                        })->orWhereNull('last_read_at');
                    }
                ])->withCount('users')->get();

            $directChannels = $user->channels()
                ->where("type",  ChannelTypes::DIRECT->name)
                ->where("workspace_id", $workspace->id)
                ->whereDoesntHave('users', function ($query) use ($hiddenUserIds) {
                    $query->whereIn('users.id', $hiddenUserIds);
                })
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
            $selfChannel =  $workspace->channels()->where("type", "=", "SELF")->where("user_id", "=", $request->user()->id)->first();
            $concatenated = $regularchannels->concat($directChannels)->concat([$selfChannel]);
            return $concatenated->all();
        } catch (\Throwable $th) {
            Helper::createErrorResponse();
        }
    }
    public function browseChannels(Request $request, Workspace $workspace)
    {
        $perPage = 10;
        $ownType = $request->query('ownType');
        $privacyType = $request->query('privacyType');
        $name = $request->query('name') ?? "";
        // $page = $request->query('page') ?? 1;
        $last_id = $request->query('last_id');
        $direction = $request->query('direction') ?? "bottom";
        $user = $request->user();

        if ($request->expectsJson()) {
            try {
                $query = null;
                switch ($ownType) {

                    case "my_channels": {
                            $query = $user->ownChannels()->where('workspace_id', $workspace->id)->where('name', 'like', '%' . $name . '%')->withCount('users');
                            switch ($privacyType) {
                                case "public":
                                    $query =  $query->where('type', ChannelTypes::PUBLIC->name);
                                    break;
                                case "private":
                                    $query =  $query->where('type', ChannelTypes::PRIVATE->name);
                                    break;

                                case "archived":
                                    $query =  $query->where('is_archived', true);
                                    break;

                                default:
                                    $query =  $query->whereIn('type', [ChannelTypes::PUBLIC->name, ChannelTypes::PRIVATE->name]);
                                    break;
                            }
                            break;
                        }
                    case "other_channels": {
                            $query = $workspace->channels()->where('user_id', '<>', $user->id)->where('name', 'like', '%' . $name . '%')->withCount('users');
                            switch ($privacyType) {

                                case "public":

                                    $query = $query->where('type', ChannelTypes::PUBLIC->name);
                                    break;
                                case "private":

                                    $query = $query
                                        ->where('type', ChannelTypes::PRIVATE->name)->whereHas('users', function ($query) use ($user) {
                                            $query->where('users.id', $user->id);
                                        });
                                    break;

                                case "archived":
                                    $query = $query->where('is_archived', true)->where(function ($query) use ($user) {
                                        $query->where('type', ChannelTypes::PRIVATE->name)->whereHas('users', function ($query) use ($user) {
                                            $query->where('users.id', $user->id);
                                        });
                                        $query->orWhere('type', ChannelTypes::PUBLIC->name);
                                    });

                                    break;
                                default:
                                    $query = $query->where(function ($query) use ($user) {
                                        $query->where('type', ChannelTypes::PRIVATE->name)->whereHas('users', function ($query) use ($user) {
                                            $query->where('users.id', $user->id);
                                        });
                                        $query->orWhere('type', ChannelTypes::PUBLIC->name);
                                    });
                                    break;
                            }
                        }
                    default: {
                            $query = $workspace->channels()->where('name', 'like', '%' . $name . '%')->withCount('users');
                            switch ($privacyType) {


                                case "public":
                                    $query = $query
                                        ->where('type', ChannelTypes::PUBLIC->name);
                                    break;
                                case "private":

                                    $query = $query
                                        ->where('type', ChannelTypes::PRIVATE->name)->whereHas('users', function ($query) use ($user) {
                                            $query->where('users.id', $user->id);
                                        });
                                    break;
                                case "archived":
                                    $query = $query->where('is_archived', true)
                                        ->where(function ($query) use ($user) {
                                            $query->where('type', ChannelTypes::PRIVATE->name)->whereHas('users', function ($query) use ($user) {
                                                $query->where('users.id', $user->id);
                                            });
                                            $query->orWhere('type', ChannelTypes::PUBLIC->name);
                                        });
                                    break;

                                default:
                                    $query = $query->where(function ($query) use ($user) {
                                        $query->where('type', ChannelTypes::PRIVATE->name)->whereHas('users', function ($query) use ($user) {
                                            $query->where('users.id', $user->id);
                                        });
                                        $query->orWhere('type', ChannelTypes::PUBLIC->name);
                                    });
                                    break;
                            }
                        }
                } //end switch
                if ($last_id) {
                    if ($direction === 'bottom') {
                        $query->where('id', '<', $last_id)->orderBy('id', 'desc');
                    } else {
                        $query->where('id', '>', $last_id)->orderBy('id', 'asc');
                    }
                } else {
                    $query->orderBy('id', 'desc');
                }

                return $query->limit($perPage)->get();
            } catch (\Throwable $th) {
                dd($th);
            }
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
                  abort(400, "Channel exists! Please choose a different name!");
            }
            //
            /**
             * @var Channel $channel
             */
            $channel = $request->user()->ownChannels()->create(['name' => $validated['name'], 'type' => $validated['type'], 'workspace_id' => $workspace->id]);
            $channel->assignManagerRoleAndManagerPermissions($request->user());
            $channel->initChannelPermissions();


            DB::commit();
            return Helper::createSuccessResponse();
        } catch (\Throwable $th) {
            DB::rollBack();
            Helper::createErrorResponse();
        }
    }

    /**
     * Display the specified resource.
     */

    public function show(Request $request, Workspace $workspace,  Channel $channel)
    {


        if ($request->user()->cannot('view', $channel)) {
            return  redirect(route('workspace.show', $channel->workspace->id));
        }
        return Inertia::render("Workspace/Index");
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
            broadcast(new ChannelEvent($channel, "editDescription"))->toOthers();
            DB::commit();

            return ['message' => 'successfull'];
        } catch (\Throwable $th) {
            DB::rollBack();

            Helper::createErrorResponse();
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
            broadcast(new ChannelEvent($channel, "editName"))->toOthers();
            DB::commit();

            return ['message' => 'successfull'];
        } catch (\Throwable $th) {
            DB::rollBack();

            Helper::createErrorResponse();
        }
    }

    public function changeType(Request $request, Channel $channel)
    {
        if ($request->user()->cannot('changeType', $channel)) {
            return  abort(403);
        }
        $validated = $request->validate(['type' => "required|in:PUBLIC,PRIVATE"]);
        $user = $request->user();
        try {
            DB::beginTransaction();
            $oldType = $channel->type;
            $channel->type = $validated['type'];
            $channel->save();
            Message::createStringMessageAndBroadcast($channel, $request->user(), $request->user()->name . " has changed channel privacy from " . $oldType . " to " . $channel->type . ".");
            broadcast(new ChannelEvent($channel, "changeType"))->toOthers();
            $channelUsers = $channel->users;
            foreach ($channelUsers as $channelUser) {
                $channelUser->notify(new ChannelsNotification(
                    fromUser: $user,
                    toUser: null,
                    channel: $channel,
                    workspace: $channel->workspace,
                    changesType: 'changeType',
                    data: ['oldType' => $oldType, 'newType' => $channel->type]
                ));
            }

            DB::commit();

            return ['message' => 'successfull'];
        } catch (\Throwable $th) {
            DB::rollBack();

            Helper::createErrorResponse();
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
            broadcast(new ChannelEvent($channel, "leave", $request->user()->id));
            DB::commit();

            return ['message' => 'successfull'];
        } catch (\Throwable $th) {
            DB::rollBack();

            Helper::createErrorResponse();
        }
    }
    public function join(Request $request, Channel $channel)
    {

        if ($request->user()->cannot('join', $channel)) {
            return  abort(403);
        }

        try {
            DB::beginTransaction();
            if (!$request->user()->channels()->where('channels.id', $channel->id)->exists()) {

                $request->user()->channels()->attach($channel->id, ['role_id' => Role::getRoleIdByName(BaseRoles::MEMBER->name)]);
            }
            broadcast(new ChannelEvent($channel, "join", $request->user()->id))->toOthers();
            DB::commit();

            return ['message' => 'successfull'];
        } catch (\Throwable $th) {
            DB::rollBack();

            Helper::createErrorResponse();
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
            Message::where('channel_id', $channel->id)
                ->where('user_id', $user->id)
                ->update(['user_name' => $user->name]);



            //notify
            broadcast(new ChannelEvent($channel, "removeUserFromChannel", $user->id))->toOthers();
            $user->notify(new ChannelsNotification($request->user(), $user, $channel, $channel->workspace, "removedFromChannel"));
            Message::createStringMessageAndBroadcast($channel, $request->user(), $request->user()->name . " has removed " . $user->name . " from channel");

            DB::commit();
            return ['message' => 'successfull'];
        } catch (\Throwable $th) {
            DB::rollBack();

            Helper::createErrorResponse();
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

                $user->notify(new ChannelsNotification($request->user(), $user, $channel->loadCount('messages as unread_messages_count')->loadCount('users'), $channel->workspace, "addedToNewChannel"));
                Message::createStringMessageAndBroadcast($channel, $request->user(), $request->user()->name . " has added " . $user->name . " to channel");
            }
            $userIds = collect($validated['users'])->pluck('id')->toArray();
            broadcast(new ChannelEvent($channel, "addUsersToChannel", $userIds));
            DB::commit();

            return ['message' => 'successfull'];
        } catch (\Throwable $th) {
            DB::rollBack();
            dd($th);
            Helper::createErrorResponse();
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
                $user->notify(new ChannelsNotification($request->user(), null, $channel, $channel->workspace, "addedAsManager"));
            }
            $managerIds = collect($validated['users'])->pluck('id')->toArray();
            broadcast(new ChannelEvent($channel, "addManagers", $managerIds));
            DB::commit();

            return ['message' => 'successfull'];
        } catch (\Throwable $th) {
            DB::rollBack();

            Helper::createErrorResponse();
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
            broadcast(new ChannelEvent($channel, "removeManager", $user->id));
            $user->notify(new ChannelsNotification(
                fromUser: $request->user(),
                toUser: null,
                channel: $channel,
                workspace: $channel->workspace,
                changesType: "removedManagerRole",

            ));
            DB::commit();

            return ['message' => 'successfull'];
        } catch (\Throwable $th) {
            DB::rollBack();

            Helper::createErrorResponse();
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

            return [];
        } catch (\Throwable $th) {
            DB::rollBack();

            Helper::createErrorResponse();
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
            broadcast(new ChannelEvent($channel, "updateChannelPermissions"));

            DB::commit();
            return [];
        } catch (\Throwable $th) {
            DB::rollBack();
            Helper::createErrorResponse();
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
            $user = $request->user();
            $channel->save();
            broadcast(new ChannelEvent($channel, "archiveChannel"))->toOthers();
            $channelUsers = $channel->users;
            foreach ($channelUsers as $channelUser) {
                $channelUser->notify(new ChannelsNotification(
                    fromUser: $user,
                    toUser: null,
                    channel: $channel,
                    workspace: $channel->workspace,
                    changesType: $validated['status'] ? 'archiveChannel' : "unarchiveChannel",

                ));
            }
            DB::commit();
            return back();
        } catch (\Throwable $th) {
            DB::rollBack();
            // dd($th);
            return back()->withErrors(['server' => "Something went wrong! Please try later."]);
        }
    }

    function checkChannelExists(Request $request)
    {
        $channelId = $request->query("channelId");
        $user = $request->user();
        if (!$channelId) return [
            'result' => false,
        ];
        try {
            $channel = Channel::where('id',  $channelId)->whereHas('workspace', function ($workspaceQuery) use ($user) {
                $workspaceQuery->whereHas('users', function ($userQuery) use ($user) {
                    $userQuery->where('users.id', $user->id);
                });
            })->first();

            if (!$channel) return ['result' => false];
            if ($channel->type == ChannelTypes::PUBLIC->name) {
                return [
                    'result' => true
                ];
            } else if ($channel->type == ChannelTypes::PRIVATE->name || $channel->type == ChannelTypes::DIRECT->name) {
                return [
                    'result' => $channel->users()->where('users.id', $user->id)->exists()
                ];
            }
        } catch (\Throwable $th) {
            dd($th);
        }

        return [
            'result' => false
        ];
    }
    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Channel $channel)
    {
        if ($request->user()->cannot('delete', $channel)) abort(403);
        try {
            DB::beginTransaction();
            $user = $request->user();
            $copiedChannel = $channel->replicate();
            $copiedChannel->id = $channel->id;
            $channelUsers = $channel->users;
            $workspace = $channel->workspace;
            $channel->messages()->forceDelete();
            $channel->permissions()->delete();
            $channel->delete();

            foreach ($channelUsers as $channelUser) {
                $channelUser->notify(new ChannelsNotification(
                    fromUser: $user,
                    toUser: null,
                    channel: $copiedChannel,
                    workspace: $workspace,
                    changesType: 'deleteChannel',

                ));
            }


            DB::commit();
            return ['message' => 'successfull'];
        } catch (\Throwable $th) {
            DB::rollBack();

            Helper::createErrorResponse();
        }
    }
}
