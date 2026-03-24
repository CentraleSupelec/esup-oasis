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

namespace App\Scheduler\RappelInterventions;

use App\Entity\Evenement;
use App\Entity\Parametre;
use App\Entity\TypeEvenement;
use App\Entity\Utilisateur;
use App\Repository\EvenementRepository;
use App\Repository\ParametreRepository;
use App\Service\MailService;
use Psr\Log\LoggerInterface;
use Symfony\Component\Clock\ClockAwareTrait;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;

#[AsMessageHandler]
class RappelInterventionsHandler
{
    use ClockAwareTrait;

    public function __construct(
        private readonly EvenementRepository $evenementRepository,
        private readonly MailService $mailService,
        private readonly LoggerInterface $logger,
        private readonly ParametreRepository $parametreRepository,
    ) {}

    public function __invoke(RappelInterventionsMessage $message): void
    {
        /**
         * On doit envoyer à chaque intervenant un récap des événements à venir qui les concerne.
         *
         * @axdubroca le 28/06 à 18:11
         *
         * Ensuite, on peut partir sur l'envoi hebdo le dimanche aux intervenants/bénéficiaires d'un récap des événements sur la semaine à venir.
         * Si pas coûteux, on laisse l'option aux bénéficiaires/intervenants de cocher les envois à J-2 s'ils le veulent,
         * si trop couteux vu que ce n'est pas la priorité, on laisse tomber pour l'instant, car de toute façon ils auront la vue sur le calendrier.
         *
         */

        $sansIntervenants = $this->parametreRepository
            ->findOneBy([
                'cle' => Parametre::RAPPELS_SANS_INTERVENANTS,
            ])
            ->getValeurCourante()
            ->getValeur() === 'O';

        $depuis = $this->now();
        $jusqua = (clone $depuis)->modify('+ ' . RappelInterventionsScheduler::INTERVALLE);

        $evenementsAVenir = $this->evenementRepository->evenementsAVenir($depuis, $jusqua, $sansIntervenants);

        /**
         * @var Evenement[][] $intervenantsEvenements
         */
        $intervenantsEvenements = array_reduce(
            $evenementsAVenir,
            function ($carry, Evenement $evenement) {
                if ($evenement->getType()->getId() !== TypeEvenement::TYPE_RENFORT && $evenement->getIntervenant()) {
                    $carry[$evenement->getIntervenant()->getId()][] = $evenement;
                }
                return $carry;
            },
            [],
        );

        /**
         * @var Utilisateur[] $beneficiaires
         */
        $beneficiaires = [];

        /**
         * @var Evenement[][] $beneficiairesEvenements
         */
        $beneficiairesEvenements = array_reduce($evenementsAVenir, function ($carry, Evenement $evenement) use (
            &$beneficiaires,
        ) {
            foreach ($evenement->getBeneficiaires() as $beneficiaire) {
                $carry[$beneficiaire->getUtilisateur()->getId()][] = $evenement;
                $beneficiaires[$beneficiaire->getUtilisateur()->getId()] = $beneficiaire->getUtilisateur();
            }
            return $carry;
        });

        //pour chaque intervenant abonné on envoie un mail compilant les événements à venir
        foreach ($intervenantsEvenements ?? [] as $evenements) {
            $utilisateur = $evenements[0]->getIntervenant()->getUtilisateur();
            if ($utilisateur->isAbonneRecapHebdo()) {
                $this->logger->debug('Envoi de rappel hebdo à ' . $utilisateur->getUid());
                $this->mailService->envoyerRappelIntervenant($evenements);
            }
        }

        //pour chaque bénéficiaire, même topo
        foreach ($beneficiairesEvenements ?? [] as $benefId => $evenements) {
            $utilisateur = $beneficiaires[$benefId];
            if ($utilisateur->isAbonneRecapHebdo()) {
                $this->logger->debug('Envoi de rappel hebdo à ' . $utilisateur->getUid());
                $this->mailService->envoyerRappelBeneficiaire($beneficiaires[$benefId], $evenements);
            }
        }
    }
}
