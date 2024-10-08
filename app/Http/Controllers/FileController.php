<?php

namespace App\Http\Controllers;

use App\Models\File;
use Inertia\Inertia;
use App\Models\Channel;
use App\Models\Message;
use App\Models\Workspace;
use Illuminate\Http\Request;
use App\Helpers\ChannelTypes;
use App\Events\WorkspaceEvent;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Pagination\LengthAwarePaginator;

class FileController extends Controller
{
    public static function middleware(): array
    {
        return [
            'auth',
        ];
    }
    /**
     * Display a listing of the resource.
     */
    function getSharedFiles($user, $name, $workspace, $perPage = 10, $last_created_at = null, $direction = 'bottom')
    {
        $hiddenUserIds = $user->hiddenUsers()->wherePivot('workspace_id', $workspace->id)->pluck('hidden_user_id')->toArray();

        $filesQuery = File::whereNotIn('user_id', $hiddenUserIds)
            ->whereHas('messages', function ($query) use ($user, $workspace) {
                $query->whereIn('channel_id', $user->channels()->where('workspace_id', $workspace->id)->pluck('channels.id'));
            })
            ->where('name', 'like', '%' . $name . '%')
            ->where('user_id', '<>', $user->id);

        if ($last_created_at) {
            if ($direction == 'bottom') {
                $filesQuery->where('created_at', '<', $last_created_at)->orderBy('created_at', 'desc');
            } else {
                $filesQuery->where('created_at', '>', $last_created_at)->orderBy('created_at', 'asc');
            }
        } else {
            $filesQuery->orderBy('created_at', 'desc');
        }

        return $filesQuery->limit($perPage)->get();
    }
    function selfFiles($user, $name, $workspace, $perPage = 10,  $last_created_at, $direction)
    {
        $filesQuery = $user->files()
            ->where('name', 'like', '%' . $name . '%')
            ->where('workspace_id', $workspace->id);

        if ($last_created_at) {
            if ($direction === 'bottom') {
                $filesQuery->where('created_at', '<', $last_created_at)->orderBy('created_at', 'desc');
            } else {
                $filesQuery->where('created_at', '>', $last_created_at)->orderBy('created_at', 'asc');
            }
        } else {

            $filesQuery->orderBy('created_at', 'desc');
        }
        $files = $filesQuery->limit($perPage)->get();

        return $files;
    }

    function all($user, $name, $workspace, $perPage = 10, $last_created_at = null, $direction = 'bottom')
    {
        $hiddenUserIds = $user->hiddenUsers()->wherePivot('workspace_id', $workspace->id)->pluck('hidden_user_id')->toArray();

        $filesQuery = File::whereNotIn('user_id', $hiddenUserIds)
            ->whereHas('messages', function ($query) use ($user, $workspace) {
                $query->where(function ($query) use ($workspace) {
                    $query->whereIn('channel_id', $workspace->channels()->where('type', ChannelTypes::PUBLIC->name)->pluck('channels.id'));
                })
                    ->orWhere(function ($query) use ($user, $workspace) {
                        $query->whereIn('channel_id', $user->channels()
                            ->where('type', ChannelTypes::PRIVATE->name)
                            ->where('workspace_id', $workspace->id)
                            ->pluck('channels.id'));
                    });
            })
            ->where('name', 'like', '%' . $name . '%');

        if ($last_created_at) {
            if ($direction === 'bottom') {
                $filesQuery->where('created_at', '<', $last_created_at)->orderBy('created_at', 'desc');
            } else {
                $filesQuery->where('created_at', '>', $last_created_at)->orderBy('created_at', 'asc');
            }
        } else {
            $filesQuery->orderBy('created_at', 'desc');
        }

        return $filesQuery->limit($perPage)->get();
    }

    public function index(Request $request, Workspace $workspace)
    {
        $perPage = 10;
        $filter = $request->query('filter');
        $name = $request->query('name') ?? "";
        // $page = $request->query('page') ?? 1;
        $last_created_at = $request->query('$last_created_at');
        $direction = $request->query('direction') ?? "bottom";
        // $page = 2;
        $user = $request->user();
        $files = [];

        try {
            if ($request->expectsJson()) {

                switch ($filter) {
                    case "shared":
                        $files = $this->getSharedFiles($user, $name, $workspace, $perPage,  $last_created_at, $direction);

                        return $files;

                    case "self":
                        $files = $this->selfFiles($user, $name, $workspace, $perPage, $last_created_at, $direction);

                        return $files;
                    default:
                        $files = $this->all($user, $name, $workspace, $perPage,  $last_created_at, $direction);

                        return $files;
                }
            }
            return Inertia::render("Workspace/Index");
        } catch (\Throwable $th) {
            dd($th);
        }
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
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request,  File $file)
    {
        // abort(500, "Something went wrong! Please try later.");

        if ($request->user()->cannot('delete', [File::class, $file])) return abort(403, "Unauthorized request! Please try later.");
        try {
            DB::beginTransaction();
            Storage::delete($file->path);
            $file->path = "";
            $file->url = "";
            $file->name = "";
            $file->type = "";
            $file->save();
            $file->delete();
            DB::commit();
            return response()->json([]);
        } catch (\Throwable $th) {
            DB::rollBack();
            dd($th);
            abort(500, "Something went wrong! Please try later.");
        }
    }
}
