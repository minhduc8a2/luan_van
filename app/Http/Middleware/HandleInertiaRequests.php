<?php

namespace App\Http\Middleware;

use App\Models\Channel;
use App\Models\Message;
use Inertia\Middleware;
use Illuminate\Http\Request;
use App\Helpers\ChannelTypes;
use Illuminate\Database\Eloquent\Builder;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): string|null
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user() ;
        $workspace = $request->route('workspace');
        $hiddenUserIds = null;
        $channels = [];
        $directChannels = [];
        $selfChannel = [];
        $workspaces = [];
        $users = [];
        $newNotificationsCount = 0;
        $workspacePermissions = null;
        if ($user && $workspace) {
            $hiddenUserIds =  $user->hiddenUsers()->wherePivot('workspace_id', $workspace->id)->pluck('hidden_user_id')->toArray();

            $channels = fn() => $user->channels()
                ->whereIn("type", [ChannelTypes::PUBLIC->name, ChannelTypes::PRIVATE->name])
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

            $directChannels = fn() => $user->channels()
                ->where("type",  ChannelTypes::DIRECT->name)
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
            $selfChannel = fn() => $workspace->channels()->where("type", "=", "SELF")->where("user_id", "=", $request->user()->id)->first();
            $workspaces = fn() => $request->user()->workspaces;
            $users = fn() => $workspace->users->map(function ($user) use ($hiddenUserIds) {
                $user->is_hidden = in_array($user->id, $hiddenUserIds);
                return $user;
            });
            $newNotificationsCount = fn() => $user->notifications()->where("read_at", null)->count();
            $workspacePermissions = fn() => ['createChannel' => $user->can('create', [Channel::class, $workspace]),];
        }
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),

            ],
            'default_avatar_url' => env('DEFAULT_AVATAR_URL'),
            'publicAppUrl' => env('PUBLIC_APP_URL', ''),

            'flash' => [
                'message' => fn() => $request->session()->get('message'),
                'invitation_link' => fn() => $request->session()->get('invitation_link'),
                'invitation_sent' => fn() => $request->session()->get('invitation_sent'),
                'data' => fn() => $request->session()->get('data'),
            ],
            'workspace' => fn() => $request->route('workspace') ?? null,
            'mainChannelId' => fn() => $request->route('workspace')?->mainChannel()?->id ?? null,
            'channels' => $channels,
            'directChannels' => $directChannels,
            'selfChannel' => $selfChannel,
            'workspaces' => $workspaces,
            'users' => $users,
            'newNotificationsCount' => $newNotificationsCount,
            'workspacePermissions' => $workspacePermissions,

        ];
    }
}
