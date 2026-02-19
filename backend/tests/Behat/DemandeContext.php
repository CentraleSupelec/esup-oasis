<?php

namespace App\Tests\Behat;

use App\Entity\CampagneDemande;
use App\Entity\ClubSportif;
use App\Entity\Commission;
use App\Entity\Demande;
use App\Entity\EtatDemande;
use App\Entity\MembreCommission;
use App\Entity\OptionReponse;
use App\Entity\Question;
use App\Entity\Reponse;
use App\Entity\TypeDemande;
use App\Entity\Utilisateur;
use App\State\Utilisateur\UtilisateurManager;
use Behat\Behat\Context\Context;
use Behat\Step\Given;
use DateMalformedStringException;
use Doctrine\Persistence\ManagerRegistry;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\Clock\ClockAwareTrait;

class DemandeContext implements Context
{
    use ClockAwareTrait;

    private ObjectManager $manager;

    public function __construct(
        private readonly UtilisateurManager $utilisateurManager,
        ManagerRegistry $doctrine,
    ) {
        $this->manager = $doctrine->getManager();
    }

    #[Given(
        "l'utilisateur :uid a une demande :etat pour le type :idTypeDemande :commission commission et un membre :uidMembre",
    )]
    #[Given("l'utilisateur :uid a une demande :etat pour le type :idTypeDemande :commission commission")]
    #[Given("l'utilisateur :uid a une demande :etat pour le type :idTypeDemande")]
    public function creerDemandeUtilisateur(
        string $uid,
        string $etat,
        int $idTypeDemande,
        $commission = 'avec',
        ?string $membre = null,
    ): void {
        $typeDemande = $this->getTypeDemande($idTypeDemande);
        $user = $this->utilisateurManager->parUid($uid);
        $campagneEnCours = $this->getCampagneEnCours($typeDemande, $commission == 'avec', $membre);

        $demande = new Demande();
        $demande->setCampagne($campagneEnCours);
        $demande->setDemandeur($user);

        $etat = match ($etat) {
            'réceptionnée' => EtatDemande::RECEPTIONNEE,
            default => EtatDemande::EN_COURS,
        };

        $demande->setEtat($this->manager->getRepository(EtatDemande::class)->find($etat));

        if ($etat !== EtatDemande::EN_COURS) {
            $this->completerDemande($demande);
        }

        $this->manager->getRepository(Demande::class)->save($demande, true);
    }

    #[Given('le type de demande :idTypeDemande propose le profil :avecOuSans accompagnement')]
    public function modifierAccompagnementTypeDemande(int $idTypeDemande, string $avecOuSans)
    {
        $typeDemande = $this->getTypeDemande($idTypeDemande);
        $typeDemande->setAccompagnementOptionnel($avecOuSans === 'sans');

        $this->manager->getRepository(TypeDemande::class)->save($typeDemande, true);
    }

    #[Given(
        "l'utilisateur demandeur a répondu :ouiNon à la question souhait d'accompagnement pour la demande :idDemande",
    )]
    public function repondreQuestionSouhaitAccompagnement(string $ouiNon, int $idDemande)
    {
        $demande = $this->manager->getRepository(Demande::class)->find($idDemande);
        $question = $this->manager->getRepository(Question::class)->find(Question::QUESTION_DEMANDE_ACCOMPAGNEMENT);

        $reponse = new Reponse();
        $reponse->setRepondant($demande->getDemandeur());
        $reponse->setDateModification($this->now());
        $reponse->addOptionsChoisie($this->manager
            ->getRepository(OptionReponse::class)
            ->find(match ($ouiNon) {
                'oui' => OptionReponse::OPTION_DEMANDE_ACCOMPAGNEMENT_OUI,
                default => OptionReponse::OPTION_DEMANDE_ACCOMPAGNEMENT_NON,
            }));
        $reponse->setQuestion($question);
        $reponse->setCampagne($demande->getCampagne());

        $this->manager->getRepository(Reponse::class)->save($reponse, true);
    }

    #[Given('il y a une campagne en cours pour le type de demande :idTypeDemande')]
    public function creerCampagneEnCoursPourType(int $idTypeDemande): void
    {
        $typeDemande = $this->getTypeDemande($idTypeDemande);
        $campagneEnCours = $this->getCampagneEnCours($typeDemande);
    }

    #[Given(':demandeur a une réponse à la question :idQuestion pour le type de demande :idTypeDemande')]
    public function creerCampagneEnCoursEtReponsePourType(string $demandeur, int $idQuestion, int $idTypeDemande)
    {
        $typeDemande = $this->getTypeDemande($idTypeDemande);
        $campagneEnCours = $this->getCampagneEnCours($typeDemande);
        $reponseQuestion = new Reponse();
        $reponseQuestion->setQuestion($this->manager->getRepository(Question::class)->find($idQuestion));
        $reponseQuestion->setCampagne($campagneEnCours);
        $reponseQuestion->setDateModification($this->now());
        $reponseQuestion->setRepondant($this->utilisateurManager->parUid($demandeur));
        $reponseQuestion->setCommentaire('réponse de ' . $demandeur);

        $this->manager->getRepository(Reponse::class)->save($reponseQuestion, true);
    }

    #[Given('il existe :nb clubs sportifs :type')]
    public function creerClubsSportifs(int $nb, string $type): void
    {
        [$pro, $formation] = match ($type) {
            'professionnels' => [true, false],
            default => [false, true],
        };
        for ($i = 1; $i <= $nb; $i++) {
            $club = new ClubSportif();
            $club->setLibelle('Club numéro ' . $i)->setProfessionnel($pro)->setCentreFormation($formation);
            $this->manager->getRepository(ClubSportif::class)->save($club, $i === $nb);
        }
    }

    #[Given("j'envoie une requête :method sur :url avec le fichier :filename")]
    public function sendFile($method, $url, $filename): void
    {
        //todo...maybe
    }

    #[Given("il existe un utilisateur :username membre d'une commission en cours")]
    #[Given("il existe un utilisateur :username membre d'une commission en cours pour le type :idType")]
    public function creerMembreCommissionPourType($username, $idType = 1)
    {
        $typeDemande = $this->manager->getRepository(TypeDemande::class)->find($idType);
        $campagne = $this->getCampagneEnCours($typeDemande);
        $commission = $campagne->getCommission();
        $utilisateur = new Utilisateur();
        $utilisateur->setNom($username);
        $utilisateur->setPrenom($username);
        $utilisateur->setUid($username);
        $utilisateur->setEmail($username . '@domain.fr');
        $membreCommission = new MembreCommission();
        $membreCommission->setRoles([Utilisateur::ROLE_MEMBRE_COMMISSION]);
        $utilisateur->addMembreCommission($membreCommission);
        $commission->addMembre($membreCommission);
        $this->manager->getRepository(Utilisateur::class)->save($utilisateur, true);
    }

    private function creerMembreCommission(string $username, Commission $commission)
    {
        $utilisateur = new Utilisateur();
        $utilisateur->setNom($username);
        $utilisateur->setPrenom($username);
        $utilisateur->setUid($username);
        $utilisateur->setEmail($username . '@domain.fr');
        $membreCommission = new MembreCommission();
        $membreCommission->setRoles([Utilisateur::ROLE_MEMBRE_COMMISSION]);
        $utilisateur->addMembreCommission($membreCommission);
        $commission->addMembre($membreCommission);
        $this->manager->getRepository(Utilisateur::class)->save($utilisateur, true);
    }

    /**
     * @param int $idTypeDemande
     * @return TypeDemande
     */
    private function getTypeDemande(int $idTypeDemande): TypeDemande
    {
        if (!($type = $this->manager->getRepository(TypeDemande::class)->find($idTypeDemande))) {
            $type = new TypeDemande();
            $type->setActif(true);
            $type->setLibelle('Type demande #' . $idTypeDemande);
            $this->manager->getRepository(TypeDemande::class)->save($type, true);
        }
        return $type;
    }

    /**
     * @param TypeDemande $typeDemande
     * @return CampagneDemande
     * @throws DateMalformedStringException
     */
    private function getCampagneEnCours(
        TypeDemande $typeDemande,
        $avecCommission = true,
        ?string $membre = null,
    ): CampagneDemande {
        if (!($campagne = $typeDemande->getCampagneEnCoursPourDate($this->now()))) {
            $campagne = new CampagneDemande();
            $campagne->setTypeDemande($typeDemande);
            $campagne->setLibelle('Campagne en cours pour ' . $typeDemande->getLibelle());
            $campagne->setDebut($this->now()->modify('- 2 days'));
            $campagne->setFin($this->now()->modify('+ 2 days'));
            $campagne->setDateCommission($this->now()->modify('+ 3 days'));
            $this->manager->getRepository(CampagneDemande::class)->save($campagne);
            if ($avecCommission) {
                $commission = new Commission();
                $commission->setActif(true);
                $commission->setLibelle('Commission pour ' . $typeDemande->getLibelle());
                $this->manager->getRepository(Commission::class)->save($commission, true);
                $commission->addCampagne($campagne);

                if ($membre !== null) {
                    $this->creerMembreCommission($membre, $commission);
                }
            }
            $this->manager->getRepository(CampagneDemande::class)->save($campagne, true);
        }
        return $campagne;
    }

    /**
     * @param int|Demande $demande
     * @return void
     */
    #[Given('la demande :demande est complète')]
    public function completerDemande(Demande|int $demande)
    {
        if (!$demande instanceof Demande) {
            $demande = $this->manager->getRepository(Demande::class)->find($demande);
        }

        foreach ($demande->getCampagne()->getTypeDemande()->getEtapes() as $etape) {
            foreach ($etape->getQuestionsEtape() as $question) {
                if (!$question->getQuestion()->isObligatoire()) {
                    continue;
                }
                //on crée une réponse bidon
                $reponse = new Reponse();
                $reponse->setRepondant($demande->getDemandeur());
                $reponse->setCampagne($demande->getCampagne());
                $reponse->setQuestion($question->getQuestion());
                $reponse->setDateModification($this->now());
                $reponse->setCommentaire('reponse bidon');
                $this->manager->getRepository(Reponse::class)->save($reponse, true);
            }
        }

        $this->manager->getRepository(Demande::class)->save($demande, true);
    }
}
