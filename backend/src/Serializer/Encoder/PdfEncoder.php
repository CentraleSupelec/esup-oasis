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
        #[Autowire('%env(default:decision.logo_fichier:LOGO_DECISION_FILENAME)%')]
        private readonly string $logoDecisionFilename = 'logo_ub.svg',
        #[Autowire('%env(default:decision.bandeau_fichier:TRIANGLE_DECISION_FILENAME)%')]
        private readonly string $triangleDecisionFilename = 'triangle-ub.svg',
    ) {
        $this->projectRoot = $appKernel->getProjectDir();
    }

    /**
     * Résout une image de la décision, avec repli sur celle livrée si le fichier
     * configuré par l'établissement est absent : une configuration incomplète ne
     * casse pas la génération du document.
     */
    private function imageAsset(string $fichier, string $repli): string
    {
        $chemin = $this->projectRoot . '/public/images/' . $fichier;
        if (!is_file($chemin)) {
            $chemin = $this->projectRoot . '/public/images/' . $repli;
        }

        return base64_encode(file_get_contents($chemin));
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
            $builder = $this->pdf->html()->processor(new TempfileProcessor());
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
            throw new RuntimeException('Erreur à la génération du PDF');
        }
    }

    public function supportsEncoding(string $format): bool
    {
        return 'pdf' === $format;
    }
}
