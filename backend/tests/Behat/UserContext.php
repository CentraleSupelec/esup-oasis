<?php

namespace App\Tests\Behat;

use App\Entity\ApplicationCliente;
use App\Entity\Intervenant;
use App\Entity\Service;
use App\Entity\TypeEvenement;
use App\Entity\Utilisateur;
use Behat\Behat\Context\Context;
use Behat\Step\Given;
use Doctrine\Persistence\ManagerRegistry;
use Doctrine\Persistence\ObjectManager;
use Exception;
use Symfony\Component\Clock\ClockAwareTrait;

class UserContext implements Context
{
    use ClockAwareTrait;

    private ObjectManager $manager;

    public function __construct(ManagerRegistry $doctrine)
    {
        $this->manager = $doctrine->getManager();
    }

    /**
     * @Given there are :number users with :role
     *
     * @param int    $number
     * @param string $role
     * @return void
     * @throws Exception
     */
    #[Given('il y a :number utilisateur(s) avec le rôle :role')]
    public function thereAreUsersWithRole(int $number, string $role): void
    {
        $utilisateurRepository = $this->manager->getRepository(Utilisateur::class);
        $currentUsers = $utilisateurRepository->findAll();

        $currentUsers = array_reduce($currentUsers, function ($carry, Utilisateur $user) use ($role) {
            if (in_array($role, $user->getRoles())) {
                $carry[] = $user;
            }
            return $carry ?? [];
        });

        for ($i = count($currentUsers); $i < $number; $i++) {
            $newUser = new Utilisateur();
            $newUser->setNom($role . '#' . $i);
            $newUser->setPrenom($role . '#' . $i);
            $newUser->setUid($role . '#' . $i);
            $newUser->setEmail($role . '#' . $i . '@app.fr');
            $newUser->setGestionnaire($role === Utilisateur::ROLE_GESTIONNAIRE);
            $newUser->setAdmin($role === Utilisateur::ROLE_ADMIN);
            $newUser = $this->addRole($role, $newUser);
            $utilisateurRepository->save($newUser);
        }
        $this->manager->flush();
    }

    /**
     * @Given there is a client app with identifier :identifier and apikey :apiKey
     * @Given il existe une application d'identifiant :identifier avec la clé d'api :apiKey
     */
    public function thereIsAClientApp($identifier, $apiKey): void
    {
        $app = new ApplicationCliente();
        $app->setIdentifiant($identifier);
        $app->setApiKey($apiKey);
        $app->setDescription("une app d'identifiant " . $identifier . ' et de clé ' . $apiKey);

        $this->manager->persist($app);
        $this->manager->flush();
    }

    /**
     * @param string      $role
     * @param Utilisateur $newUser
     * @return Utilisateur
     * @throws Exception
     */
    private function addRole(string $role, Utilisateur $newUser): Utilisateur
    {
        switch ($role) {
            case Utilisateur::ROLE_GESTIONNAIRE:
                $newUser->addService($this->getRandomService());
                break;
            case Utilisateur::ROLE_RENFORT:
                $newUser->addService($this->getRandomService());
                $intervenant = new Intervenant();
                $intervenant->addTypesEvenement($this->getTypeRenfort());
                $debut = $this->now();
                $fin = (clone $debut)->modify('+1 year');
                $intervenant->setDebut($debut);
                $intervenant->setFin($fin);
                $newUser->setIntervenant($intervenant);
                break;
            case Utilisateur::ROLE_ADMIN:
                $newUser->setAdmin(true);
                break;
            case Utilisateur::ROLE_USER:
                break;
            default:
                throw new Exception('non géré ' . $role);
        }

        return $newUser;
    }

    private function getRandomService()
    {
        return $this->manager->getRepository(Service::class)->findAll()[0];
    }

    private function getTypeRenfort()
    {
        return $this->manager->getRepository(TypeEvenement::class)->find(TypeEvenement::TYPE_RENFORT);
    }
}
