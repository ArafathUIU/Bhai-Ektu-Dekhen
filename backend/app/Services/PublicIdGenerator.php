<?php

namespace App\Services;

class PublicIdGenerator
{
    public function reportId(int $id): string
    {
        return 'BEK-'.str_pad((string) $id, 5, '0', STR_PAD_LEFT);
    }

    public function issueId(int $id): string
    {
        return 'BEK-'.str_pad((string) $id, 5, '0', STR_PAD_LEFT);
    }
}
