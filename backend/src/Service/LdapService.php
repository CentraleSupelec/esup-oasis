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

/**
 * Interaction avec un LDAP.
 */

namespace App\Service;

use Ldap\Connection;

/**
 * Interaction avec un LDAP.
 *
 * @property string ldapHost
 * @property int    ldapPort
 * @property string   ldapSSL
 * @property string ldapUsername
 * @property string ldapPassword
 * @property string ldapDn
 *
 * @author boris.doucey@u-bordeaux.fr
 * @author manuel.rossard@u-bordeaux.fr
 */
class LdapService
{
    private ?Connection $ldap;
    private bool $bind;
    private bool $ldapSSL;

    public function __construct(
        private readonly string $ldapHost,
        private readonly int $ldapPort,
        string $ldapSSL,
        private readonly string $ldapUsername,
        private readonly string $ldapPassword,
        private readonly string $ldapDn,
    ) {
        $this->ldapSSL = $ldapSSL == 'true';
    }

    /**
     * Retourne les attributs demandés pour une uid.
     *
     * Note : pour lire le contenu du tableau ($entries) renvoyé on peut faire comme ça :
     * $infos = array (
     * "nom" => $entries[0]['sn'][0],
     * "prenom" => $entries[0]['givenname'][0],
     * "email" => $entries[0]['mail'][0],
     * "code_etudiant" => @$entries[0]['supannetuid'][0]
     * );
     *
     * @param string uid
     *
     * @param array $attributes
     * @return array
     * @throws ErreurLdapException
     */
    public function searchUid(string $uid, array $attributes = []): array
    {
        $result = $this->query("(&(uid=$uid))", $attributes);
        if (empty($result)) {
            throw new LdapUtilisateurInconnuException($uid . ' inconnu dans le ldap');
        }
        return $result;
    }

    /**
     * Retourne les attributs demandés pour les entrées répondant à une requête ldap.
     *
     * @param string $ldapQuery
     * @param array  $attributes
     * @return array
     * @throws ErreurLdapException
     */
    public function query(string $ldapQuery, array $attributes): array
    {
        $results = [];
        if ($this->isConnected()) {
            $cookie = '';
            do {
                $search = ldap_search($this->ldap, $this->ldapDn, $ldapQuery, $attributes, controls: [
                    [
                        'oid' => LDAP_CONTROL_PAGEDRESULTS,
                        'value' => ['size' => 10, 'cookie' => $cookie],
                    ],
                ]);

                if (!ldap_parse_result($this->ldap, $search, $errcode, $matcheddn, $errmsg, $referrals, $controls)) {
                    throw new ErreurLdapException('Erreur de lecture des résultats de la recherche LDAP');
                }

                $entries = ldap_get_entries($this->ldap, $search);
                foreach ($entries as $entry) {
                    if (!is_array($entry)) {
                        continue;
                    }
                    $results[] = $entry;
                }
                $cookie = $controls[LDAP_CONTROL_PAGEDRESULTS]['value']['cookie'] ?? '';
            } while (!empty($cookie));

            ldap_unbind($this->ldap);
        }
        return $results;
    }

    public function isConnected(): bool
    {
        return $this->checkLdapConnection();
    }

    public function checkLdapConnection(): bool
    {
        $this->connectAndBind();

        return $this->ldap instanceof Connection && $this->bind;
    }

    /**
     * Connexion au LDAP.
     */
    public function connectAndBind(): void
    {
        $ldapUrl = ($this->ldapSSL ? 'ldaps' : 'ldap') . '://' . $this->ldapHost . ':' . $this->ldapPort;
        $this->ldap = ldap_connect($ldapUrl);
        if (!$this->ldap instanceof Connection) {
            throw new ErreurLdapException('Connection au serveur LDAP impossible');
        }
        ldap_set_option($this->ldap, LDAP_OPT_PROTOCOL_VERSION, 3);
        ldap_set_option($this->ldap, LDAP_OPT_REFERRALS, 0);
        $this->bind = @ldap_bind($this->ldap, $this->ldapUsername, $this->ldapPassword);
        if (!$this->bind) {
            throw new ErreurLdapException('Connection au serveur LDAP impossible');
        }
    }
}
