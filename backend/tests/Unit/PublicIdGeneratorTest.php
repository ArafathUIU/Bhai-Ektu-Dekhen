<?php

namespace Tests\Unit;

use App\Services\PublicIdGenerator;
use PHPUnit\Framework\TestCase;

class PublicIdGeneratorTest extends TestCase
{
    private PublicIdGenerator $ids;

    protected function setUp(): void
    {
        parent::setUp();
        $this->ids = new PublicIdGenerator();
    }

    public function test_report_id_is_zero_padded(): void
    {
        $this->assertSame('BEK-00001', $this->ids->reportId(1));
        $this->assertSame('BEK-12345', $this->ids->reportId(12345));
        $this->assertSame('BEK-99999', $this->ids->reportId(99999));
    }

    public function test_issue_id_is_zero_padded(): void
    {
        $this->assertSame('BEK-00007', $this->ids->issueId(7));
    }
}