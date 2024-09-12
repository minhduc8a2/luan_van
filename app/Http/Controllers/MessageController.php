<?php

namespace App\Http\Controllers;


use App\Models\User;
use App\Models\Thread;
use App\Models\Channel;
use App\Models\Message;
use App\Models\Workspace;
use App\Models\Attachment;
use App\Events\MessageEvent;
use Illuminate\Http\Request;
use App\Events\ThreadMessageEvent;
use App\Helpers\Helper;
use App\Notifications\MentionNotification;
use Illuminate\Support\Facades\Storage;


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
    function createAttachments($fileObjects)
    {
        $attachments = [];
        foreach ($fileObjects as $fileObject) {
            array_push($attachments, new Attachment(['name' => $fileObject['name'], 'path' => $fileObject['path'], 'type' => $fileObject['type'], 'url' => Storage::url($fileObject['path'])]));
        }
        return $attachments;
    }
    public function store(Request $request,  Channel $channel)
    {
        if ($request->user()->cannot('create', [Message::class, $channel])) return abort(403);
        $content = $request->content;
        // dd($request->fileObjects);
        if (isset($content)) {
            try {
                $content = Helper::sanitizeContent($content);
                $message = Message::create([
                    'content' => $content,
                    'messagable_id' => $channel->id,
                    'messagable_type' => Channel::class,
                    'user_id' => $request->user()->id
                ]);
                $fileObjects = [];
                foreach ($request->fileObjects as $i => $fileObject) {
                    $newPath = str_replace("temporary", "public", $fileObject['path']);
                    Storage::move($fileObject['path'], $newPath);
                    $fileObject['path'] = $newPath;
                    array_push($fileObjects, $fileObject);
                }

                $message->attachments()->saveMany($this->createAttachments($fileObjects));


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
            } catch (\Throwable $th) {
                return back()->withErrors(['server' => "Something went wrong, please try later!"]);
            }
        }
    }

    public function storeThreadMessage(Request $request, Channel $channel, Message $message)
    {
        if ($request->user()->cannot('create', [Message::class, $channel])) return abort(403);
        $content = $request->content;
        if (isset($content)) {

            $content = Helper::sanitizeContent($content);
            //check thread is created already
            $thread = $message->thread;
            if (!$thread) {
                $thread = $message->thread()->create([]);
            }
            $newMessage = Message::create([
                'content' =>  $content,
                'messagable_id' => $thread->id,
                'messagable_type' => Thread::class,
                'user_id' => $request->user()->id
            ]);
            $fileObjects = [];
            foreach ($request->fileObjects as $i => $fileObject) {
                $newPath = str_replace("temporary", "public", $fileObject['path']);
                Storage::move($fileObject['path'], $newPath);
                $fileObject['path'] = $newPath;
                array_push($fileObjects, $fileObject);
            }

            $newMessage->attachments()->saveMany($this->createAttachments($fileObjects));
            if (isset($newMessage)) {

                //handle mentions list
                $mentionsList = $request->mentionsList;

                foreach ($mentionsList as $u) {
                    $mentionedUser = User::find($u['id']);
                    $mentionedUser->notify(new MentionNotification($channel, $channel->workspace, $request->user(), $mentionedUser, $message));
                }
                //notify others about new message

                broadcast(new ThreadMessageEvent($message, $newMessage->load(['attachments', 'reactions'])))->toOthers();
            }
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
