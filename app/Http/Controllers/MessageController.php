<?php

namespace App\Http\Controllers;


use App\Models\User;
use App\Models\Thread;
use App\Helpers\Helper;
use App\Models\Channel;
use App\Models\Message;
use App\Models\Workspace;
use App\Models\Attachment;
use App\Events\MessageEvent;
use Illuminate\Http\Request;
use App\Events\ThreadCreatedEvent;
use App\Events\ThreadMessageEvent;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use App\Notifications\MentionNotification;


class MessageController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
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
    function createFiles($fileObjects, $user)
    {
        $files = [];
        foreach ($fileObjects as $fileObject) {
            array_push($files, ['name' => $fileObject['name'], 'path' => $fileObject['path'], 'type' => $fileObject['type'], 'url' => Storage::url($fileObject['path']), 'user_id' => $user->id]);
        }
        return $files;
    }
    public function store(Request $request,  Channel $channel)
    {
        if ($request->user()->cannot('create', [Message::class, $channel])) return abort(403);
        $validated = $request->validate(['content' => 'string', 'fileObjects' => 'array']);
        $content = $validated['content'];
        // dd($request->fileObjects);
        try {
            DB::beginTransaction();

            $content = Helper::sanitizeContent($content);
            $message = Message::create([
                'content' => $content,
                'messagable_id' => $channel->id,
                'messagable_type' => Channel::class,
                'user_id' => $request->user()->id
            ]);
            $fileObjects = [];
            foreach ($validated['fileObjects'] as $i => $fileObject) {
                $newPath = str_replace("temporary", "public", $fileObject['path']);
                Storage::move($fileObject['path'], $newPath);
                $fileObject['path'] = $newPath;
                array_push($fileObjects, $fileObject);
            }
            $files = $this->createFiles($fileObjects, $request->user());

            $message->files()->createMany($files);


            if (isset($message)) {
                //handle mentions list
                $mentionsList = $request->mentionsList;

                foreach ($mentionsList as $u) {
                    $mentionedUser = User::find($u['id']);
                    $mentionedUser->notify(new MentionNotification($channel, $channel->workspace, $request->user(), $mentionedUser, $message));
                }
                //notify others about new message
                broadcast(new MessageEvent($channel, $message->load([
                    'files',
                    'reactions',
                    'thread' => function ($query) {
                        $query->withCount('messages');
                    }
                ])));
            }
            DB::commit();
            back();
        } catch (\Throwable $th) {
            DB::rollBack();
            dd($th);
            return back()->withErrors(['server' => "Something went wrong, please try later!"]);
        }
    }

    public function storeThreadMessage(Request $request, Channel $channel, Message $message)
    {
        if ($request->user()->cannot('create', [Thread::class, $channel])) return abort(403);
        if ($message->is_auto_generated) return abort(403);
        try {
            $validated = $request->validate(['content' => 'string', 'fileObjects' => 'array', 'mentionsList' => 'array']);
            $content = $validated['content'];
            DB::beginTransaction();
            $content = Helper::sanitizeContent($content);
            //check thread is created already
            $thread = $message->thread;
            $isNewThread = false;
            if (!$thread) {
                $thread = $message->thread()->create([]);
                $isNewThread = true;
            }
            $newMessage = Message::create([
                'content' =>  $content,
                'messagable_id' => $thread->id,
                'messagable_type' => Thread::class,
                'user_id' => $request->user()->id
            ]);
            $fileObjects = [];
            foreach ($validated['fileObjects'] as $i => $fileObject) {
                $newPath = str_replace("temporary", "public", $fileObject['path']);
                Storage::move($fileObject['path'], $newPath);
                $fileObject['path'] = $newPath;
                array_push($fileObjects, $fileObject);
            }

            $files = $this->createFiles($fileObjects, $request->user());

            $newMessage->files()->createMany($files);

            if (isset($newMessage)) {

                //handle mentions list
                $mentionsList = $validated['mentionsList'] ?? [];

                foreach ($mentionsList as $u) {
                    $mentionedUser = User::find($u['id']);
                    $mentionedUser->notify(new MentionNotification($channel, $channel->workspace, $request->user(), $mentionedUser, $message->load(['files', 'reactions']), $newMessage));
                }
                //notify others about new message

                broadcast(new ThreadMessageEvent($message, $newMessage->load(['files', 'reactions']), $isNewThread ? $thread : null));
            }
            DB::commit();
            return back();
        } catch (\Throwable $th) {
            DB::rollBack();
            dd($th);
            return back()->withErrors(['server' => 'Something went wrong! Please try later.']);
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
            $isThreadMessage = $message->messagable_type == Thread::class;
            // thread message
            $masterMessage = $isThreadMessage ? $message->messagable->message : null;
            //
            $channel = $isThreadMessage ? $masterMessage->messagable : Channel::find($message->messagable_id);
            $content = Helper::sanitizeContent($content);
            $message->content = $content;
            $message->is_edited = true;
            $message->save();
            //mentions
            $mentionsList = $request->mentionsList;

            foreach ($mentionsList as $u) {
                $mentionedUser = User::find($u['id']);
                $mentionedUser->notify(new MentionNotification($channel, $channel->workspace, $request->user(), $mentionedUser, $message));
            }
            //notify others about new message
            if (!$isThreadMessage) { //channel Message
                broadcast(new MessageEvent($channel, $message->load([
                    'files',
                    'reactions',
                    'thread' => function ($query) {
                        $query->withCount('messages');
                    }
                ]), "messageEdited"));
            } else {
                broadcast(new ThreadMessageEvent($masterMessage, $message->load(['files', 'reactions']), null, "messageEdited"));
            }

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
            $isChannelMessage = $message->messagable_type == Channel::class;
            $copiedMessage = $message->replicate();
            $copiedMessage->id = $message->id;
            if ($isChannelMessage) {
                $message->thread?->messages()->forceDelete();
                $message->thread?->delete();

                //no need to delete files, not depend on message

            }
            $message->reactions()->delete();
            $message->files()->detach();
            $message->delete();

            if ($isChannelMessage) {
                broadcast(new MessageEvent($message->messagable, $copiedMessage, "messageDeleted"));
            } else {
                broadcast(new ThreadMessageEvent(Thread::find($message->messagable_id)->message, $copiedMessage, null, "messageDeleted"));
            }
            DB::commit();
            back();
        } catch (\Throwable $th) {
            DB::rollBack();
            dd($th);
            return back()->withErrors(['server' => "Something went wrong, please try later!"]);
        }
    }
}
