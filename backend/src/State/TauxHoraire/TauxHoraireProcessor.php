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

namespace App\State\TauxHoraire;

use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\ApiResource\TauxHoraire;
use App\Message\RessourceCollectionModifieeMessage;
use App\Message\RessourceModifieeMessage;
use App\Repository\TauxHoraireRepository;
use App\Repository\TypeEvenementRepository;
use Exception;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;
use Symfony\Component\Messenger\MessageBusInterface;

readonly class TauxHoraireProcessor implements ProcessorInterface
{
    public function __construct(
        private TypeEvenementRepository $typeEvenementRepository,
        private TauxHoraireRepository $tauxHoraireRepository,
        private MessageBusInterface $messageBus,
    ) {}

    /**
     * @param TauxHoraire $data
     * @param Operation   $operation
     * @param array       $uriVariables
     * @param array       $context
     * @return TauxHoraire|null
     * @throws Exception
     */
    public function process(
        mixed $data,
        Operation $operation,
        array $uriVariables = [],
        array $context = [],
    ): ?TauxHoraire {
        $type = $this->typeEvenementRepository->find($uriVariables['typeId']);
        //DELETE
        if ($operation instanceof Delete) {
            foreach ($type->getTauxHoraires() as $tauxHoraire) {
                if ($tauxHoraire->getId() === $data->id) {
                    //                    $type->removeTauxHoraire($tauxHoraire);
                    $this->tauxHoraireRepository->remove($tauxHoraire, true);
                    $this->messageBus->dispatch(new RessourceCollectionModifieeMessage($data));
                    return null;
                }
            }
        }

        //POST/PATCH
        if (null !== $data->id) {
            $tauxHoraire = $this->tauxHoraireRepository->find($data->id);
        } else {
            $tauxHoraire = new \App\Entity\TauxHoraire();
            $type->addTauxHoraire($tauxHoraire);
        }

        $tauxHoraire->setDebut($data->debut);
        $tauxHoraire->setFin($data->fin);
        $tauxHoraire->setMontant($data->montant);

        if (!$this->tauxCoherents($type->getTauxHoraires()->toArray())) {
            throw new UnprocessableEntityHttpException('Un seul taux actif à la fois');
        }

        $this->tauxHoraireRepository->save($tauxHoraire, true);

        return new TauxHoraire($tauxHoraire);
    }

    /**
     * @param \App\Entity\TauxHoraire[] $tauxHoraires
     * @return bool
     */
    private function tauxCoherents(array $tauxHoraires): bool
    {
        for ($i = 0; $i < (count($tauxHoraires) - 1); $i++) {
            for ($j = $i + 1; $j < count($tauxHoraires); $j++) {
                if ($this->chevauchement($tauxHoraires[$i], $tauxHoraires[$j])) {
                    return false;
                }
            }
        }
        return true;
    }

    private function chevauchement(\App\Entity\TauxHoraire $t1, \App\Entity\TauxHoraire $t2): bool
    {
        return (
            $t1->getDebut() >= $t2->getDebut()
            && ($t1->getDebut() < $t2->getFin() || null === $t2->getFin())
            || $t2->getDebut() >= $t1->getDebut()
            && ($t2->getDebut() < $t1->getFin() || null === $t1->getFin())
        );
    }
}
