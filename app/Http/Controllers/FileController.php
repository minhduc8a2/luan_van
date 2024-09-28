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
    function getSharedFiles($user, $name, $workspace, $perPage = 10, $page = 1)
    {

        $hiddenUserIds = $user->hiddenUsers()->wherePivot('workspace_id', $workspace->id)->pluck('hidden_user_id')->toArray();
        return File::whereNotIn('user_id', $hiddenUserIds)->whereHas('messages', function ($query) use ($user, $workspace) {
            $query->whereIn('channel_id', $user->channels()->where('workspace_id', $workspace->id)->pluck('channels.id'));
        })->where('name', 'like', "%" . $name . "%")->where('user_id', "<>", $user->id)->latest()->simplePaginate($perPage, ['*'], 'page', $page)->withQueryString();
    }
    function selfFiles($user, $name, $workspace, $perPage = 10, $page = 1)
    {
        return $user->files()->where('name', 'like', "%" . $name . "%")->where('workspace_id', $workspace->id)->latest()->simplePaginate($perPage, ['*'], 'page', $page)->withQueryString();
    }

    function all($user, $name, $workspace, $perPage = 10, $page = 1)
    {
        $hiddenUserIds = $user->hiddenUsers()->wherePivot('workspace_id', $workspace->id)->pluck('hidden_user_id')->toArray();
        return File::whereNotIn('user_id', $hiddenUserIds)->whereHas('messages', function ($query) use ($user, $workspace) {
            $query->where(function ($query) use ($workspace) {

                $query->whereIn('channel_id', $workspace->channels()->where('type', ChannelTypes::PUBLIC->name)->pluck('channels.id'));
            })
                ->orWhere(function ($query) use ($user, $workspace) {

                    $query->whereIn('channel_id', $user->channels()->where('type', ChannelTypes::PRIVATE->name)
                        ->where('workspace_id', $workspace->id)
                        ->pluck('channels.id'));
                });
        })

            ->where('name', 'like', "%" . $name . "%")
            ->latest()

            ->simplePaginate($perPage, ['*'], 'page', $page)->withQueryString();
    }
    public function index(Request $request, Workspace $workspace)
    {
        $perPage = 3;
        $filter = $request->query('filter');
        $name = $request->query('name') ?? "";
        $page = $request->query('page') ?? 1;
        // $page = 2;
        $user = $request->user();
        $files = [];

        try {
            if ($request->expectsJson()) {

                switch ($filter) {
                    case "shared":
                        $files = $this->getSharedFiles($user, $name, $workspace, $perPage, $page);

                        return $files;



                    case "self":
                        $files = $this->selfFiles($user, $name, $workspace, $perPage, $page);

                        return $files;


                    default:
                        $files = $this->all($user, $name, $workspace, $perPage, $page);

                        return $files;
                }
            }
            return Inertia::render("Workspace/BrowseFiles/BrowseFiles");
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
        // return back()->withErrors(['server' => "Something went wrong! Please try later."]);
        if ($request->user()->cannot('delete', [File::class, $file])) return abort(403);
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
            return back();
        } catch (\Throwable $th) {
            DB::rollBack();
            dd($th);
            return back()->withErrors(['server' => "Something went wrong! Please try later."]);
        }
    }
}
