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
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),

            ],

            'flash' => [
                'message' => fn() => $request->session()->get('message'),

                'status' => fn() => $request->session()->get('status')
            ],
        ];
    }
}
