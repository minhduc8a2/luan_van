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
    function getSharedFiles($user, $name, $perPage = 10, $page = 1)
    {

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


        $files = collect();
        foreach ($messages as $message) {
            $files = $files->merge($message->files);
            if ($message->thread) {
                foreach ($message->thread->messages as $threadMessage) {
                    $files = $files->merge($threadMessage->files);
                }
            }
        }


        $uniqueFiles = $files->unique('id')->values();


        $total = $uniqueFiles->count();
        $filesForCurrentPage = $uniqueFiles->slice(($page - 1) * $perPage, $perPage)->values();


        return new LengthAwarePaginator(
            $filesForCurrentPage,
            $total,
            $perPage,
            $page,
            ['path' => request()->url(), 'query' => request()->query()]
        );
    }
    function selfFiles($user, $name, $perPage = 10, $page = 1)
    {
        return $user->files()->where('name', 'like', "%" . $name . "%")->simplePaginate($perPage, ['*'], 'page', $page);
    }

    function all($user, $name, $perPage = 10, $page = 1)
    {
        $messages = Message::where('messagable_type', Channel::class)
            ->whereIn('messagable_id', $user->channels()->pluck('channels.id'))
            ->with([
                'files' => function ($query) use ($user, $name) {
                    $query
                        ->where('files.name', 'like', "%" . $name . "%");
                },
                'thread.messages.files' => function ($query) use ($user, $name) {
                    $query
                        ->where('files.name', 'like', "%" . $name . "%");
                }
            ])
            ->get();


        $files = collect();
        foreach ($messages as $message) {
            $files = $files->merge($message->files);
            if ($message->thread) {
                foreach ($message->thread->messages as $threadMessage) {
                    $files = $files->merge($threadMessage->files);
                }
            }
        }


        $uniqueFiles = $files->unique('id')->values();


        $total = $uniqueFiles->count();
        $filesForCurrentPage = $uniqueFiles->slice(($page - 1) * $perPage, $perPage)->values();


        return new LengthAwarePaginator(
            $filesForCurrentPage,
            $total,
            $perPage,
            $page,
            ['path' => request()->url(), 'query' => request()->query()]
        );
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
                    return  $files;
                default:
                    $files = $this->all($user, $name, $perPage, $page);
                    return $files;
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
