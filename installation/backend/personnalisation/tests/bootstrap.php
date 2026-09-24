<?php

/*
 * Démarrage des tests de la personnalisation Paris-Saclay.
 *
 * Ces classes ne font pas partie de l'application : elles sont copiées dans l'image à la
 * construction. Pour les tester sans image, on charge l'application, puis on inclut les
 * classes de la personnalisation dans l'ordre de leurs dépendances.
 *
 * OASIS_VENDOR désigne le dossier vendor de l'application ; par défaut, celui du dépôt
 * dans lequel se trouve ce dossier d'installation.
 */
require (getenv('OASIS_VENDOR') ?: __DIR__ . '/../../../../backend/vendor') . '/autoload.php';

foreach (['NiveauResolver', 'NiveauExtractor', 'RedoublementCalculator', 'CalculScolariteSaclay'] as $classe) {
    require_once __DIR__ . '/../SiScol/' . $classe . '.php';
}
