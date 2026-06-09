<?php

namespace App\Validator;

use Attribute;
use Symfony\Component\Validator\Constraint;

#[Attribute]
class AllowedFileTypesConstraint extends Constraint
{
    public string $message = 'Type de fichier non autorisé : {{ type }}.';
    public string $messageIncoherence = 'Type de fichier {{ type }} incohérent avec l\'extension {{ extension }}.';

    public function getTargets(): string
    {
        return self::CLASS_CONSTRAINT;
    }
}
