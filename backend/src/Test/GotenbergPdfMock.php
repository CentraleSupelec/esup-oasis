<?php

namespace App\Test;

use Exception;
use Sensiolabs\GotenbergBundle\Builder\BuilderInterface;
use Sensiolabs\GotenbergBundle\Builder\Pdf\ConvertPdfBuilder;
use Sensiolabs\GotenbergBundle\Builder\Pdf\FlattenPdfBuilder;
use Sensiolabs\GotenbergBundle\Builder\Pdf\HtmlPdfBuilder;
use Sensiolabs\GotenbergBundle\Builder\Pdf\LibreOfficePdfBuilder;
use Sensiolabs\GotenbergBundle\Builder\Pdf\MarkdownPdfBuilder;
use Sensiolabs\GotenbergBundle\Builder\Pdf\MergePdfBuilder;
use Sensiolabs\GotenbergBundle\Builder\Pdf\SplitPdfBuilder;
use Sensiolabs\GotenbergBundle\Builder\Pdf\UrlPdfBuilder;
use Sensiolabs\GotenbergBundle\GotenbergPdfInterface;

class GotenbergPdfMock implements GotenbergPdfInterface
{
    public function get(string $builder): BuilderInterface
    {
        throw new Exception('Not implemented');
    }

    public function html(): BuilderInterface
    {
        return new class implements BuilderInterface {
            public function processor($processor): BuilderInterface
            {
                return $this;
            }

            public function content($template, $context = []): BuilderInterface
            {
                return $this;
            }

            public function header($template, $context = []): BuilderInterface
            {
                return $this;
            }

            public function footer($template, $context = []): BuilderInterface
            {
                return $this;
            }

            public function generate(): BuilderInterface
            {
                return $this;
            }

            public function process()
            {
                $fp = fopen('php://memory', 'r+');
                fwrite($fp, 'DUMMY PDF CONTENT');
                rewind($fp);
                return $fp;
            }

            public function getConfigurations(): array
            {
                return [];
            }
        };
    }

    public function url(): BuilderInterface
    {
        throw new Exception('Not implemented');
    }

    public function markdown(): BuilderInterface
    {
        throw new Exception('Not implemented');
    }

    public function office(): BuilderInterface
    {
        throw new Exception('Not implemented');
    }

    public function merge(): BuilderInterface
    {
        throw new Exception('Not implemented');
    }

    public function convert(): BuilderInterface
    {
        throw new Exception('Not implemented');
    }

    public function split(): BuilderInterface
    {
        throw new Exception('Not implemented');
    }

    public function flatten(): BuilderInterface
    {
        throw new Exception('Not implemented');
    }

    public function encrypt(): BuilderInterface
    {
        throw new Exception('Not implemented');
    }

    public function embed(): BuilderInterface
    {
        throw new Exception('Not implemented');
    }
}
