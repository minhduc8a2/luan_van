<?php

namespace App\Http\Controllers;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;


class NotificationController extends Controller
{
   public function markRead(Request $request)
   {
      $request->user()->unreadNotifications->markAsRead();
   }

   public function markView(Request $request, $notificationId)
   {
      $notification = $request->user()->notifications()->find($notificationId);
      $notification->view_at = Carbon::now();
      $notification->read_at = $notification->read_at ?? Carbon::now();
      $notification->save();
   }

   public function get(Request $request){
      return $request->user()->notifications()->simplePaginate(8);
   }
}
