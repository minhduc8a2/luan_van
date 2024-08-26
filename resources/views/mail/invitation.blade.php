<x-mail::message>
#You’re Invited to Join the Workspace'  {{ strtoupper($workspaceName) }}

Dear {{ $toUserName }},

We are excited to inform you that {{ $fromUserName }} has invited you to collaborate on the **{{ $workspaceName }}** workspace. This is a great opportunity to work together, share ideas, and achieve your goals as a team.

To get started, simply click the button below:

<x-mail::button :url="$invitationLink" color="primary">
{{ 'Join' }} {{ $workspaceName }}
</x-mail::button>

If you have any questions or need assistance, feel free to reach out. We’re here to help!

Thanks and welcome aboard,

{{ config('app.name') }}

<x-slot:subcopy>
If you’re having trouble clicking the "Join {{ $workspaceName }}" button, copy and paste the URL below into your web browser
[{{ $invitationLink }}]({{ $invitationLink }})
</x-slot:subcopy>
</x-mail::message>
