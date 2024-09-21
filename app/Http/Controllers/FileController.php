<?php

namespace App\Http\Controllers;

use App\Models\File;
use App\Models\Thread;
use App\Models\Channel;
use App\Models\Message;
use Illuminate\Http\Request;
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
    function getSharedFiles($user, $name, $perPage = 2, $page = 1)
    {
        // Get the messages that contain files
        $messages = Message::where('messagable_type', Channel::class)
            ->whereIn('messagable_id', $user->channels()->pluck('channels.id'))
            ->with([
                'files' => function ($query) use ($user, $name) {
                    $query->where('user_id', '<>', $user->id)
                        ->where('files.name', 'like', "%" . $name . "%");
                },
                'thread.messages.files' => function ($query) use ($user, $name) {
                    $query->where('user_id', '<>', $user->id)
                        ->where('files.name', 'like', "%" . $name . "%");
                }
            ])
            ->get();

        // Collect all files
        $files = collect();
        foreach ($messages as $message) {
            $files = $files->merge($message->files);
            if ($message->thread) {
                foreach ($message->thread->messages as $threadMessage) {
                    $files = $files->merge($threadMessage->files);
                }
            }
        }

        // Ensure files are unique by their ID
        $uniqueFiles = $files->unique('id')->values();

        // Manually create pagination
        $total = $uniqueFiles->count();
        $filesForCurrentPage = $uniqueFiles->slice(($page - 1) * $perPage, $perPage)->values();

        // Use LengthAwarePaginator for paginating the unique files
        return new LengthAwarePaginator(
            $filesForCurrentPage,
            $total,
            $perPage,
            $page,
            ['path' => request()->url(), 'query' => request()->query()]
        );
    }
    function selfFiles($user, $name)
    {
        return $user->files()->where('name', 'like', "%" . $name . "%")->get();
    }
    public function index(Request $request)
    {
        $perPage = 10;
        $filter = $request->query('filter');
        $name = $request->query('name') ?? "";
        $page = $request->query('page') ?? 1;
        // $page = 2;
        $user = $request->user();
        $files = [];

        try {
            switch ($filter) {
                case "shared":
                    $files = $this->getSharedFiles($user, $name, $perPage, $page);
                    return $files;
                    // return back()->with('data', $files);

                case "self":
                    $files = $this->selfFiles($user, $name);
                    return back()->with('data', $files);
                default:

                    break;
            }
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
    public function destroy(string $id)
    {
        //
    }
}
