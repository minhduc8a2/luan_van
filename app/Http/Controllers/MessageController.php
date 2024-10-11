<?php

namespace App\Http\Controllers;


use App\Models\User;

use App\Helpers\Helper;
use App\Models\Channel;
use App\Models\Message;

use App\Models\Workspace;
use App\Events\MessageEvent;

use Illuminate\Http\Request;

use App\Events\WorkspaceEvent;
use App\Events\ThreadMessageEvent;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use App\Notifications\MentionNotification;
use Carbon\Carbon;

class MessageController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function infiniteMessages(Request $request,  Channel $channel)
    {
        $perPage = 10;

        $content = $request->query('content') ?? "";
        // $page = $request->query('page') ?? 1;
        $last_id = $request->query('last_id');
        $direction = $request->query('direction') ?? "bottom";
        $threaded_message_id = $request->query('threaded_message_id');

        // $page = 2;
        $user = $request->user();
        $hiddenUserIds =  $user->hiddenUsers()->wherePivot('workspace_id', $channel->workspace->id)->pluck('hidden_user_id')->toArray();
        $messagesQuery = $channel->messages()->whereNotIn('user_id', $hiddenUserIds)->withTrashed()->with([
            'files' => function ($query) {
                $query->withTrashed();
            },
            'reactions',

            'forwardedMessage.files' => function ($query) {

                $query->withTrashed();
            },
        ])->withCount([
            'threadMessages' => function ($query) use ($hiddenUserIds) {

                $query->whereNotIn('user_id', $hiddenUserIds);
            }
        ])->where('content', 'like', '%' . $content . '%');

        if ($threaded_message_id) {
            $messagesQuery->where('threaded_message_id', $threaded_message_id);
        } else {
            $messagesQuery->where('threaded_message_id', null);
        }


        if ($last_id) {
            if ($direction === 'bottom') {
                $messagesQuery->where('id', '<', $last_id)->orderBy('id', 'desc');
            } else {
                $messagesQuery->where('id', '>', $last_id)->orderBy('id', 'asc');
            }
        } else {
            $messagesQuery->orderBy('id', 'desc');
        }

        return $messagesQuery->limit($perPage)->get();
    }

    public function getSpecificMessagesById(Request $request,  Channel $channel)
    {
        $messageId = $request->query('messageId');
        $threaded_message_id = $request->query('thread_message_id');
        $user = $request->user();
        $hiddenUserIds =  $user->hiddenUsers()->wherePivot('workspace_id', $channel->workspace->id)->pluck('hidden_user_id')->toArray();
        $specificMessage = Message::where('id', $messageId)->withTrashed()->with([
            'files' => function ($query) {
                $query->withTrashed();
            },
            'reactions',

            'forwardedMessage.files' => function ($query) {

                $query->withTrashed();
            },
        ])->withCount([
            'threadMessages' => function ($query) use ($hiddenUserIds) {

                $query->whereNotIn('user_id', $hiddenUserIds);
            }
        ])->first();
        if (!$specificMessage) {
            return abort(404, 'Message was deleted!');
        }

        $beforeMessagesQuery = Message::where('id', '<', $specificMessage->id)->where('channel_id', '=', $channel->id)
            ->withTrashed()->with([
                'files' => function ($query) {
                    $query->withTrashed();
                },
                'reactions',

                'forwardedMessage.files' => function ($query) {

                    $query->withTrashed();
                },
            ])->withCount([
                'threadMessages' => function ($query) use ($hiddenUserIds) {

                    $query->whereNotIn('user_id', $hiddenUserIds);
                }
            ])
            ->orderBy('id', 'desc')
            ->limit(5);
        $afterMessagesQuery = Message::where('id', '>', $specificMessage->id)->where('channel_id', '=', $channel->id)
            ->withTrashed()->with([
                'files' => function ($query) {
                    $query->withTrashed();
                },
                'reactions',

                'forwardedMessage.files' => function ($query) {

                    $query->withTrashed();
                },
            ])->withCount([
                'threadMessages' => function ($query) use ($hiddenUserIds) {

                    $query->whereNotIn('user_id', $hiddenUserIds);
                }
            ])
            ->orderBy('id', 'asc')
            ->limit(5);

        if ($threaded_message_id) {
            $beforeMessagesQuery =  $beforeMessagesQuery->where('threaded_message_id', $threaded_message_id);
            $afterMessagesQuery = $afterMessagesQuery->where('threaded_message_id', $threaded_message_id);
        }

        $beforeMessages = $beforeMessagesQuery->get();
        $afterMessages = $afterMessagesQuery->get();

        $messages = $afterMessages->concat([$specificMessage])->concat($beforeMessages);





        return $messages;
    }

    public function getMessage(Request $request)
    {

        $messageId = $request->query('messageId');
        $message = Message::withTrashed()->find($messageId);
        if ($request->user()->cannot('view', [Channel::class, $message->channel])) abort(403);
        return $message->load([
            'files' => function ($query) {
                $query->withTrashed();
            },
            'reactions',

            'forwardedMessage.files' => function ($query) {

                $query->withTrashed();
            },
        ])->loadCount('threadMessages');
    }
    public function getThreadMessages(Request $request,  Message $message)
    {
        $perPage = 10;
        $channel = $message->channel;
        if ($request->user()->cannot('viewThread', [Message::class, $channel])) return abort(403);
        $hiddenUserIds = $request->user()->hiddenUsers()->wherePivot('workspace_id', $channel->workspace->id)->pluck('hidden_user_id')->toArray();
        try {
            $messageId = $request->query('message_id');

            $pageNumber = null;
            if ($messageId) {
                $threadMessage = Message::find($messageId);
                if ($threadMessage) {

                    $threadMessagePosition = $message->threadMessages()->whereNotIn('user_id', $hiddenUserIds)
                        ->latest()
                        ->where('id', '>=', $threadMessage->id)
                        ->count();
                    $pageNumber = ceil($threadMessagePosition / $perPage);
                }
            }


            // return back()->with('data', [
            //     'messages' => $messageId ?
            //         $message->threadMessages()
            //         ->withTrashed()
            //         ->with(['files', 'reactions'])
            //         ->latest()
            //         ->simplePaginate($perPage, ['*'], 'page', $pageNumber)
            //         :
            //         $message->threadMessages()
            //         ->withTrashed()
            //         ->with(['files', 'reactions'])
            //         ->latest()
            //         ->simplePaginate($perPage)
            // ]);
            return [
                'messages' => $messageId ?
                    $message->threadMessages()
                    ->whereNotIn('user_id', $hiddenUserIds)
                    ->withTrashed()
                    ->with(['files', 'reactions'])
                    ->latest()
                    ->simplePaginate($perPage, ['*'], 'page', $pageNumber)
                    :
                    $message->threadMessages()
                    ->whereNotIn('user_id', $hiddenUserIds)
                    ->withTrashed()
                    ->with(['files', 'reactions'])
                    ->latest()
                    ->simplePaginate($perPage)
            ];
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
    function createFiles($fileObjects, $user, $workspace)
    {
        $files = [];
        foreach ($fileObjects as $fileObject) {
            array_push($files, ['name' => $fileObject['name'], 'path' => $fileObject['path'], 'type' => $fileObject['type'], 'url' => Storage::url($fileObject['path']), 'user_id' => $user->id, 'workspace_id' => $workspace->id]);
        }
        return $files;
    }
    public function store(Request $request,  Channel $channel)
    {
        if ($request->user()->cannot('create', [Message::class, $channel])) return abort(403);
        $forwardMode = false;
        $forwardChannel = null;
        if (isset($request->forwardedMessageId)) {
            $forwardMode = true;
        }

        $validated = $forwardMode ?
            $request->validate(['content' => 'string', 'forwardedMessageId' => 'integer', 'channelId' => 'integer'])
            :  $request->validate(['content' => 'string', 'fileObjects' => 'array', 'created_at' => 'required|date']);
        $content = $validated['content'];
        $created_at = isset($validated['created_at']) ? Carbon::createFromFormat('D, d M Y H:i:s T', $validated['created_at'])->format('Y-m-d H:i:s') : Carbon::now();
        if ($forwardMode) {
            $forwardChannel = Channel::find($validated['channelId']);
        }
        // dd($request->fileObjects);
        try {
            DB::beginTransaction();

            $content = Helper::sanitizeContent($content);
            $message = $request->user()->messages()->create([
                'content' => $content,
                'channel_id' => $forwardMode ? $forwardChannel->id : $channel->id,
                "forwarded_message_id" => $forwardMode ? $validated['forwardedMessageId'] : null,
                'created_at' => $forwardMode ? Carbon::now() : $created_at,
                'updated_at' => $forwardMode ? Carbon::now() : $created_at,
            ]);

            if (!$forwardMode) {
                $fileObjects = [];
                foreach ($validated['fileObjects'] as $i => $fileObject) {
                    array_push($fileObjects, $fileObject);
                }
                if (count($fileObjects) > 0) {
                    $files = $this->createFiles($fileObjects, $request->user(), $channel->workspace);

                    $fileInstances = $message->files()->createMany($files);

                    try {
                        //code...
                        broadcast(new WorkspaceEvent(workspace: $channel->workspace, type: "ChannelMessage_fileCreated", fromUserId: "", data: ['channelId' => $channel->id, 'files' => $fileInstances]));
                    } catch (\Throwable $th) {
                        // throw $th;
                    }
                }
            }




            //handle mentions list
            $mentionsList = $request->mentionsList;
            $hiddenByUserIds = $request->user()->hiddenByUsers()->wherePivot('workspace_id', $channel->workspace->id)->pluck('user_id')->toArray();
            foreach ($mentionsList as $u) {
                $mentionedUser = User::find($u['id']);
                if (in_array($mentionedUser->id, $hiddenByUserIds)) {
                    continue;
                }
                $mentionedUser->notify(new MentionNotification($forwardMode ? $forwardChannel : $channel, $channel->workspace, $request->user(), $mentionedUser, $message));
            }
            //notify others about new message

            try {
                //code...
                if ($forwardMode) {
                    broadcast(new MessageEvent($message->channel, $message->load([
                        'files' => function ($query) {
                            $query->withTrashed();
                        },
                        'reactions',

                        'forwardedMessage.files' => function ($query) {

                            $query->withTrashed();
                        },
                    ])->loadCount('threadMessages')));
                } else {
                    broadcast(new MessageEvent($message->channel, $message->load([
                        'files' => function ($query) {
                            $query->withTrashed();
                        },
                        'reactions',

                    ],)->loadCount('threadMessages')))->toOthers();
                }
            } catch (\Throwable $th) {
                // throw $th;
            }
            DB::commit();
            if ($forwardMode) return Helper::createSuccessResponse();
            return ['message' => $message->load([
                'files' => function ($query) {
                    $query->withTrashed();
                },
                'reactions',

            ],)->loadCount('threadMessages')];
        } catch (\Throwable $th) {
            DB::rollBack();
            dd($th);
            return Helper::createErrorResponse();
        }
    }

    public function storeThreadMessage(Request $request, Channel $channel, Message $message)
    {
        if ($request->user()->cannot('createThread', [Message::class, $channel])) return abort(403);
        if ($message->is_auto_generated) return abort(403);
        try {
            $validated = $request->validate(['content' => 'string', 'fileObjects' => 'array', 'mentionsList' => 'array', 'created_at' => 'required|date']);
            $content = $validated['content'];
            $created_at =  Carbon::createFromFormat('D, d M Y H:i:s T', $validated['created_at'])->format('Y-m-d H:i:s');
            DB::beginTransaction();
            $content = Helper::sanitizeContent($content);
            //check thread is created already

            $newMessage = $message->threadMessages()->create([
                'content' =>  $content,
                'channel_id' => $channel->id,
                'user_id' => $request->user()->id,
                'created_at' => $created_at,
                'updated_at' => $created_at,
            ]);
            $fileObjects = [];
            foreach ($validated['fileObjects'] as $i => $fileObject) {

                array_push($fileObjects, $fileObject);
            }
            if (count($fileObjects) > 0) {
                $files = $this->createFiles($fileObjects, $request->user(), $channel->workspace);

                $fileInstances = $newMessage->files()->createMany($files);
                try {
                    //code...
                    broadcast(new WorkspaceEvent(workspace: $channel->workspace, type: "ThreadMessage_fileCreated", fromUserId: "", data: ['channelId' => $channel->id, 'files' => $fileInstances]));
                } catch (\Throwable $th) {
                    throw $th;
                }
            }
            try {
                //code...
                broadcast(new ThreadMessageEvent($message, $newMessage->load(['files' => function ($query) {
                    $query->withTrashed();
                }, 'reactions']),))->toOthers();
            } catch (\Throwable $th) {
                throw $th;
            }

            if (isset($newMessage)) {

                //handle mentions list
                $mentionsList = $validated['mentionsList'] ?? [];
                $hiddenByUserIds = $request->user()->hiddenByUsers()->wherePivot('workspace_id', $channel->workspace->id)->pluck('user_id')->toArray();
                foreach ($mentionsList as $u) {
                    $mentionedUser = User::find($u['id']);
                    if (in_array($mentionedUser->id, $hiddenByUserIds)) {
                        continue;
                    }
                    $mentionedUser->notify(new MentionNotification($channel, $channel->workspace, $request->user(), $mentionedUser, $message->load(['files' => function ($query) {
                        $query->withTrashed();
                    }, 'reactions']), $newMessage));
                }
            }
            DB::commit();
            return ['message' => $newMessage->load(['files' => function ($query) {
                $query->withTrashed();
            }, 'reactions'])];
        } catch (\Throwable $th) {
            DB::rollBack();
            dd($th);
            return Helper::createErrorResponse();
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Message $message)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Message $message)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Message $message)
    {
        if ($request->user()->cannot('update', [Message::class, $message])) return abort(403);
        if ($message->is_auto_generated) return abort(403);
        $validated = $request->validate(['content' => 'string']);
        $content = $validated['content'];

        try {
            DB::beginTransaction();


            $channel = $message->channel;
            $content = Helper::sanitizeContent($content);
            $message->content = $content;
            $message->is_edited = true;
            $message->save();
            //mentions
            $mentionsList = $request->mentionsList;
            $hiddenByUserIds = $request->user()->hiddenByUsers()->wherePivot('workspace_id', $channel->workspace->id)->pluck('user_id')->toArray();
            foreach ($mentionsList as $u) {
                $mentionedUser = User::find($u['id']);
                if (in_array($mentionedUser->id, $hiddenByUserIds)) {
                    continue;
                }
                $mentionedUser->notify(new MentionNotification($channel, $channel->workspace, $request->user(), $mentionedUser, $message));
            }
            //notify others about new message


            DB::commit();
            back();
        } catch (\Throwable $th) {
            DB::rollBack();
            dd($th);
            return back()->withErrors(['server' => "Something went wrong, please try later!"]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Message $message)
    {
        if ($request->user()->cannot('delete', [Message::class, $message])) return abort(403);
        try {
            DB::beginTransaction();
            $isChannelMessage = $message->thread_message_id == null;;
            $copiedMessage = $message->replicate();
            $copiedMessage->id = $message->id;
            if ($isChannelMessage) {

                $message->threadMessages()->forceDelete();

                //no need to delete files, not depend on message

            }
            $message->reactions()->delete();
            $message->files()->detach();
            $message->delete();


            DB::commit();
            back();
        } catch (\Throwable $th) {
            DB::rollBack();
            dd($th);
            return back()->withErrors(['server' => "Something went wrong, please try later!"]);
        }
    }
}
