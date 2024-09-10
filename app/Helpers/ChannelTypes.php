<?php

namespace App\Helpers;

enum ChannelTypes
{
    case PUBLIC;
    case PRIVATE;
    case DIRECT;
    case SELF;
}
