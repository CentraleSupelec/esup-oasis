<?php

namespace App\Test;

use App\Service\LdapService;

class FakeLdapService extends LdapService
{
    public function __construct()
    {
        // No parent construct call to avoid connection issues
    }

    public function searchUid(string $uid, array $attributes = []): array
    {
        return [
            [
                'sn' => ['Nom'],
                'givenname' => ['Prenom'],
                'mail' => [$uid . '@test.fr'],
                'supannetuid' => ['123456'],
                'count' => 1,
            ]
        ];
    }

    public function query(string $ldapQuery, array $attributes): array
    {
        return [];
    }

    public function isConnected(): bool
    {
        return true;
    }

    public function checkLdapConnection(): bool
    {
        return true;
    }

    public function connectAndBind(): void
    {
        // Do nothing
    }
}
