<?php

namespace App\Validator;

use App\ApiResource\Telechargement;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;
use Symfony\Component\Validator\Exception\UnexpectedTypeException;
use Symfony\Component\Validator\Exception\UnexpectedValueException;

class AllowedFileTypesConstraintValidator extends ConstraintValidator
{
    public function validate(mixed $value, Constraint $constraint): void
    {
        if (!$constraint instanceof AllowedFileTypesConstraint) {
            throw new UnexpectedTypeException($constraint, AllowedFileTypesConstraint::class);
        }

        if (!$value instanceof Telechargement) {
            throw new UnexpectedValueException($value, Telechargement::class);
        }

        $allowed = [
            'PDF' => [
                'mime' => ['application/pdf'],
                'extension' => ['pdf'],
            ],
            'DOC' => [
                'mime' => [
                    'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'application/vnd.oasis.opendocument.text',
                ],
                'extension' => ['doc', 'docx', 'odt'],
            ],
            'IMAGE' => [
                'mime' => ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/tiff'],
                'extension' => ['jpg', 'jpeg', 'png', 'gif', 'webp', 'tif', 'tiff'],
            ],
            'VIDEO' => [
                'mime' => [
                    'video/mp4',
                    'video/webm',
                    'video/ogg',
                    'video/quicktime',
                    'video/x-msvideo',
                    'video/x-ms-wmv',
                ],
                'extension' => [
                    'mp4',
                    'm4v',
                    'webm',
                    'ogv',
                    'mov',
                    'avi',
                    'wmv',
                ],
            ],
            'TXT' => [
                'mime' => ['text/plain'],
                'extension' => ['txt'],
            ],
        ];

        $detectedMime = $value->file->getMimeType();
        $detectedExtension = strtolower($value->file->getClientOriginalExtension());

        $detectedType = null;

        //on vérifie si le type mime fait partie de ceux autorisés
        foreach ($allowed as $type => $infos) {
            if (in_array($detectedMime, $infos['mime'])) {
                $detectedType = $type;
            }
        }

        if (null == $detectedType) {
            $this->context
                ->buildViolation($constraint->message)
                ->setParameter('{{ type }}', $detectedExtension)
                ->addViolation();
        } else {
            //si le type est autorisé, on vérifie que l'extension correspond
            if (!in_array($detectedExtension, $allowed[$detectedType]['extension'])) {
                $this->context
                    ->buildViolation($constraint->messageIncoherence)
                    ->setParameter('{{ type }}', $detectedType)
                    ->setParameter('{{ extension }}', $detectedExtension)
                    ->addViolation();
            }
        }
    }
}
