<?php

/*
 * Copyright (c) 2024-2026. Esup - Université de Bordeaux.
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 *  For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 *  @author Manuel Rossard <manuel.rossard@u-bordeaux.fr>
 *
 */

namespace App\Serializer\Encoder;

use App\ApiResource\DecisionAmenagementExamens;
use App\ApiResource\ServicesFaits;
use App\Serializer\Encoder\Gotenberg\TempfileProcessor;
use Exception;
use Psr\Log\LoggerInterface;
use RuntimeException;
use Sensiolabs\GotenbergBundle\Enumeration\PaperSize;
use Sensiolabs\GotenbergBundle\GotenbergPdfInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpKernel\KernelInterface;
use Symfony\Component\Serializer\Encoder\EncoderInterface;

class PdfEncoder implements EncoderInterface
{
    private string $projectRoot;

    public function __construct(
        private readonly GotenbergPdfInterface $pdf,
        private readonly LoggerInterface $logger,
        KernelInterface $appKernel,
        #[Autowire('%env(LOGO_DECISION_FILENAME)%')]
        private readonly string $logoDecisionFilename = 'logo_ub.svg',
        #[Autowire('%env(TRIANGLE_DECISION_FILENAME)%')]
        private readonly string $triangleDecisionFilename = 'triangle-ub.svg',
    ) {
        $this->projectRoot = $appKernel->getProjectDir();
    }

    /**
     * Résout un asset d'images de décision, avec repli sur l'asset upstream
     * si le fichier configuré (personnalisation établissement) est absent.
     */
    private function imageAsset(string $filename, string $fallback): string
    {
        $path = $this->projectRoot . '/public/images/' . $filename;
        if (!is_file($path)) {
            $path = $this->projectRoot . '/public/images/' . $fallback;
        }

        return base64_encode(file_get_contents($path));
    }

    public function encode(mixed $data, string $format, array $context = []): string
    {
        $template = match (true) {
            $data[0] instanceof ServicesFaits => 'ServicesFaits/index.html.twig',
            $data[0] instanceof DecisionAmenagementExamens => 'Decisions/index.html.twig',
            default => new Exception('type non supporté'),
        };

        //si inconnu on sort...impossible en théorie
        if (!is_string($template)) {
            return $template->getMessage();
        }

        $headerTemplate = match (true) {
            //$data[0] instanceof DecisionAmenagementExamens => 'Decisions/header.html.twig',
            default => null,
        };

        $footerTemplate = match (true) {
            $data[0] instanceof DecisionAmenagementExamens => 'Decisions/footer.html.twig',
            default => null,
        };

        if ($data[0] instanceof DecisionAmenagementExamens) {
            $data['triangle_base64'] = $this->imageAsset($this->triangleDecisionFilename, 'triangle-ub.svg');
            $data['logo_base64'] = $this->imageAsset($this->logoDecisionFilename, 'logo_ub.svg');
        }

        if ($data[0] instanceof ServicesFaits) {
            $data = $data[0];
        }

        try {
            $builder = $this->pdf->html()
                ->processor(new TempfileProcessor())
                ->paperStandardSize(PaperSize::A4);
            if (null !== $headerTemplate) {
                $builder->header($headerTemplate, ['data' => $data]);
            }
            if (null !== $footerTemplate) {
                $builder->footer($footerTemplate, ['data' => $data]);
            }

            $resource = $builder->content($template, ['data' => $data])->generate()->process();
            return stream_get_contents($resource);
        } catch (Exception $e) {
            $this->logger->error($e->getMessage());
            $this->logger->error($e->getTraceAsString());
            throw new RuntimeException("Erreur PDF: " . $e->getMessage(), 0, $e);
        }
    }

    public function supportsEncoding(string $format): bool
    {
        return 'pdf' === $format;
    }
}
