<?php

namespace App\Http\Middleware;

use App\Models\Channel;
use App\Models\Message;
use Inertia\Middleware;
use Illuminate\Http\Request;
use App\Helpers\ChannelTypes;
use App\Models\Workspace;
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
        $user = $request->user();
        /**
         * @var Workspace $workspace
         */
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
          

           
            $selfChannel = fn() => $workspace->channels()->where("type", "=", "SELF")->where("user_id", "=", $request->user()->id)->first();
            $workspaces = fn() => $request->user()->workspaces;

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
            
            'channels' => $channels,
            'directChannels' => $directChannels,
            'selfChannel' => $selfChannel,
            'workspaces' => $workspaces,

            'newNotificationsCount' => $newNotificationsCount,
            'workspacePermissions' => $workspacePermissions,

        ];
    }
}
