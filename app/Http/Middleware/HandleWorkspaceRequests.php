<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class HandleWorkspaceRequests
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        /**
         * @var User $user
         */
        $user = $request->user();
        /**
         * @var Workspace $workspace
         */
        $workspace = $request->route('workspace');
        // dd($workspace);
        if ($workspace && $user->isDeactivated($workspace)) {
            return abort(401);
        }
        return $next($request);
    }
}
