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

namespace App\Scheduler\MajInscriptions;

use App\Entity\Utilisateur;
use App\Repository\BeneficiaireRepository;
use App\Service\MailService;
use App\State\Utilisateur\UtilisateurManager;
use Exception;
use Psr\Log\LoggerInterface;
use Symfony\Component\Clock\ClockAwareTrait;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;
use Twig\Error\LoaderError;
use Twig\Error\RuntimeError;
use Twig\Error\SyntaxError;

#[AsMessageHandler]
class MajInscriptionsHandler
{
    use ClockAwareTrait;

    public function __construct(
        private readonly BeneficiaireRepository $beneficiaireRepository,
        private readonly UtilisateurManager $utilisateurManager,
        private readonly MailService $mailService,
        private readonly LoggerInterface $logger,
    ) {}

    /**
     * @param MajInscriptionsMessage $message
     * @return void
     * @throws LoaderError
     * @throws RuntimeError
     * @throws SyntaxError
     */
    public function __invoke(MajInscriptionsMessage $message): void
    {
        //bénéficiaires
        $this->logger->debug('MAJ des inscriptions des bénéficiaires');
        $beneficiairesTraites = [];
        $beneficiairesNonTraites = [];
        $now = $this->now();
        foreach ($this->beneficiaireRepository->findAll() as $beneficiaire) {
            if (
                $now > $beneficiaire->getDebut()
                && ($now < $beneficiaire->getFin() || null === $beneficiaire->getFin())
            ) {
                try {
                    $this->utilisateurManager->majInscriptionsEtIdentite(
                        $beneficiaire->getUtilisateur(),
                        $beneficiaire->getDebut(),
                        $beneficiaire->getFin(),
                    );
                    $beneficiairesTraites[] = $beneficiaire->getUtilisateur();
                } catch (Exception $e) {
                    $beneficiairesNonTraites[] = $beneficiaire->getUtilisateur();
                    $this->logger->error(
                        'MAJ impossible des inscriptions de ' . $beneficiaire->getUtilisateur()->getUid(),
                    );
                    $this->logger->error($e->getTraceAsString());
                }
            }
        }
        //intervenants
        $this->logger->debug('MAJ des inscriptions des intervenants');
        /**
         * @var Utilisateur[] $intervenantsTraites
         */
        $intervenantsTraites = [];
        /**
         * @var Utilisateur[] $intervenantsNonTraites
         */
        $intervenantsNonTraites = [];
        foreach ($this->utilisateurManager->parRole(Utilisateur::ROLE_INTERVENANT) as $intervenant) {
            try {
                $this->utilisateurManager->majInscriptionsEtIdentite(
                    $intervenant,
                    $intervenant->getIntervenant()->getDebut(),
                    $intervenant->getIntervenant()->getFin(),
                );
                $intervenantsTraites[] = $intervenant;
            } catch (Exception $e) {
                $intervenantsNonTraites[] = $intervenant;
                $this->logger->error('MAJ impossible des inscriptions de ' . $intervenant->getUid());
                $this->logger->error($e->getTraceAsString());
            }
        }

        //Envoyer un rapport aux admins techniques...
        $this->mailService->envoyerRapportMajInscriptions([...$beneficiairesTraites, ...$intervenantsTraites], [
            ...$beneficiairesNonTraites,
            ...$intervenantsNonTraites,
        ]);
    }
}
