<?php

namespace App\Http\Controllers;

use Tiptap\Editor;
use App\Models\Channel;
use App\Models\Message;
use App\Models\Workspace;
use App\Models\Attachment;
use App\Events\MessageEvent;
use Illuminate\Http\Request;
use App\Broadcasting\MessageChannel;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Broadcast;

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
    public function store(Request $request, Workspace $workspace, Channel $channel)
    {
        if ($request->user()->cannot('create', [Message::class, $channel])) return abort(403);
        $content = $request->content;
        // dd($request->fileObjects);
        if (isset($content)) {
            $editor = new Editor();
            $content = $editor->sanitize($content);
            $JSONContent = $editor->setContent($content)->getJSON();
            $message = Message::create(['content' => $JSONContent, 'channel_id' => $channel->id, 'user_id' => $request->user()->id]);
            $message->attachments()->saveMany($this->createAttachments($request->fileObjects));
            if (isset($message)) {

                broadcast(new MessageEvent($channel, $message))->toOthers();
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
