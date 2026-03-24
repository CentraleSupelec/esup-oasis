<?php

namespace App\Tests\Behat;

use App\Entity\Campus;
use App\Entity\Evenement;
use App\Entity\PeriodeRH;
use App\Entity\TypeEvenement;
use App\Entity\Utilisateur;
use App\Repository\PeriodeRHRepository;
use Behat\Behat\Context\Context;
use Behat\Behat\Context\Environment\InitializedContextEnvironment;
use Behat\Behat\Hook\Scope\BeforeScenarioScope;
use Behat\Gherkin\Node\PyStringNode;
use Behat\Step\Given;
use Behatch\Context\RestContext;
use DateTime;
use DateTimeImmutable;
use DateTimeInterface;
use Doctrine\Persistence\ManagerRegistry;
use Doctrine\Persistence\ObjectManager;
use Exception;
use Symfony\Component\Clock\Clock;
use Symfony\Component\Clock\ClockAwareTrait;
use Symfony\Component\Clock\DatePoint;
use Symfony\Component\Clock\Test\ClockSensitiveTrait;

class EvenementContext implements Context
{
    use ClockAwareTrait;
    use ClockSensitiveTrait;

    private RestContext $restContext;
    private ObjectManager $manager;

    function __construct(ManagerRegistry $doctrine)
    {
        $this->manager = $doctrine->getManager();
    }

    #[Given('today is :strDate')]
    function setCurrentDate($strDate)
    {
        $clock = static::mockTime(new DateTimeImmutable($strDate));
        Clock::set($clock);
    }

    #[Given('there is an event for user :username :when')]
    #[Given('there is an event for user :username :when with :intervenant')]
    function createEventForUser($username, $when, $intervenant = null): Evenement
    {
        $user = $this->manager
            ->getRepository(Utilisateur::class)
            ->findOneBy([
                'uid' => $username,
            ]);
        if (null !== $intervenant) {
            $intervenant = $this->manager
                ->getRepository(Utilisateur::class)
                ->findOneBy([
                    'uid' => $intervenant,
                ]);
        }
        $typeid = match ($username) {
            'renfort' => TypeEvenement::TYPE_RENFORT,
            default => 1,
        };
        $type = $this->manager->getRepository(TypeEvenement::class)->find($typeid);
        $campus = $this->manager->getRepository(Campus::class)->find(1);

        $debut = new DatePoint($when);
        $fin = (clone $debut)->modify('+ 1 hour');

        $this->createValidPeriodeIfNeeded($debut);

        $evenement = new Evenement();

        $evenement->setDebut($debut);
        $evenement->setFin($fin);
        $evenement->setLibelle('whatever');
        $evenement->setType($type);
        $evenement->setCampus($campus);
        $evenement->setDateCreation(new DateTime());
        $evenement->setUtilisateurCreation($user);
        $evenement->setIntervenant($intervenant?->getIntervenant());
        if ($username !== 'renfort') {
            $benef = $user->getBeneficiairesGeres()[0];
            $evenement->addBeneficiaire($benef);
        }
        $this->manager->persist($evenement);
        $this->manager->flush();

        return $evenement;
    }

    #[Given('there is an event on a locked period for user :username')]
    function thereIsAnEventOnLockedPeriod($username): void
    {
        $this->createEventForUser($username, 'today');
        $today = new DatePoint('today');
        $periode = $this->createValidPeriodeIfNeeded($today);
        $periode->setButoir((clone $today)->modify('-1 day'));
        $this->manager->persist($periode);
        $this->manager->flush();
    }

    #[Given('there is a valid PeriodeRH for :forDate')]
    function createValidPeriodeIfNeeded(DateTimeInterface|string $forDate): PeriodeRH
    {
        if (!$forDate instanceof DateTimeInterface) {
            $forDate = new DatePoint($forDate);
        }
        /**
         * @var PeriodeRHRepository $periodeRepo
         */
        $periodeRepo = $this->manager->getRepository(PeriodeRH::class);

        $periodeRH = $periodeRepo->findPeriodePourDate($forDate);
        if (null === $periodeRH) {
            $periode = new PeriodeRH();
            $periode->setDebut((clone $forDate)->modify('-1 day'));
            $periode->setFin((clone $forDate)->modify('+1 day'));
            $periode->setButoir($periode->getFin());
            $this->manager->persist($periode);
            $this->manager->flush();
            return $periode;
        }
        return $periodeRH;
    }

    /**
     * @Given there is a periode that locks today
     * @return void
     * @throws Exception
     */
    function thereIsAPeriodEndingToday(): void
    {
        $now = $this->now();
        $periode = $this->createValidPeriodeIfNeeded($now);
        $periode->setButoir(new DatePoint($now->format('Y-m-d')));
    }

    /**
     * @When I try to create an event for today
     * @return void
     */
    function createEventToday(): void
    {
        $today = $this->now()->format('Y-m-d');
        $body = '
        {
            "debut": "' . $today . 'T08:00",
            "fin": "' . $today . 'T12:00",
            "libelle": "",
            "type":"/types_evenements/-1",
            "campus": "/campus/1"
        }
        ';
        $body = new PyStringNode([$body], 0);
        $this->restContext->iSendARequestToWithBody('POST', '/evenements', $body);
    }

    /**
     * Gives access to the Behatch context - needed to force auth header
     *
     * @BeforeScenario
     */
    public function gatherContexts(BeforeScenarioScope $scope): void
    {
        /**
         * @var InitializedContextEnvironment $environment
         */
        $environment = $scope->getEnvironment();
        /**
         * @var RestContext $restContext
         */
        $restContext = $environment->getContext(RestContext::class);
        $this->restContext = $restContext;
    }
}
