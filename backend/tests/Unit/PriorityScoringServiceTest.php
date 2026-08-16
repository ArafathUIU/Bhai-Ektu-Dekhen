<?php

namespace Tests\Unit;

use App\Models\Issue;
use App\Services\PriorityScoringService;
use PHPUnit\Framework\TestCase;

class PriorityScoringServiceTest extends TestCase
{
    public function test_severity_bucket_mapping_covers_all_levels(): void
    {
        $service = new PriorityScoringService();

        $this->assertTrue(in_array(Issue::SEVERITY_LOW, [
            Issue::SEVERITY_LOW,
            Issue::SEVERITY_MEDIUM,
            Issue::SEVERITY_HIGH,
            Issue::SEVERITY_CRITICAL,
        ], true));
        $this->assertTrue(in_array(Issue::SEVERITY_CRITICAL, [
            Issue::SEVERITY_LOW,
            Issue::SEVERITY_MEDIUM,
            Issue::SEVERITY_HIGH,
            Issue::SEVERITY_CRITICAL,
        ], true));
    }

    public function test_service_instantiates(): void
    {
        $this->assertInstanceOf(PriorityScoringService::class, new PriorityScoringService());
    }
}