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
use App\Events\ThreadCreatedEvent;
use Illuminate\Http\Request;
use App\Events\ThreadMessageEvent;
use Illuminate\Support\Facades\DB;
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
    function createAttachments($fileObjects, $user)
    {
        $attachments = [];
        foreach ($fileObjects as $fileObject) {
            array_push($attachments, ['name' => $fileObject['name'], 'path' => $fileObject['path'], 'type' => $fileObject['type'], 'url' => Storage::url($fileObject['path']), 'user_id' => $user->id]);
        }
        return $attachments;
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
            $attachments = $this->createAttachments($fileObjects, $request->user());

            $message->attachments()->createMany($attachments);


            if (isset($message)) {
                //handle mentions list
                $mentionsList = $request->mentionsList;

                foreach ($mentionsList as $u) {
                    $mentionedUser = User::find($u['id']);
                    $mentionedUser->notify(new MentionNotification($channel, $channel->workspace, $request->user(), $mentionedUser, $message));
                }
                //notify others about new message
                broadcast(new MessageEvent($channel, $message->load([
                    'attachments',
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
            // dd($th);
            return back()->withErrors(['server' => "Something went wrong, please try later!"]);
        }
    }

    public function storeThreadMessage(Request $request, Channel $channel, Message $message)
    {
        if ($request->user()->cannot('create', [Thread::class, $channel])) return abort(403);
        try {
            $validated = $request->validate(['content' => 'string', 'fileObjects' => 'array']);
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

            $attachments = $this->createAttachments($fileObjects, $request->user());

            $newMessage->attachments()->createMany($attachments);

            if (isset($newMessage)) {

                //handle mentions list
                $mentionsList = $request->mentionsList;

                foreach ($mentionsList as $u) {
                    $mentionedUser = User::find($u['id']);
                    $mentionedUser->notify(new MentionNotification($channel, $channel->workspace, $request->user(), $mentionedUser, $message));
                }
                //notify others about new message

                broadcast(new ThreadMessageEvent($message, $newMessage->load(['attachments', 'reactions']), $isNewThread ? $thread : null));
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
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Message $message)
    {
        //
    }
}
