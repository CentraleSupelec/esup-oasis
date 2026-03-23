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

namespace App\Tests;

use App\Message\ErreurTechniqueMessage;
use App\MessageHandler\ErreurTechniqueMessageHandler;
use Exception;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

class ErreurTechniqueMessageHandlerTest extends KernelTestCase
{
    public function testInvoke(): void
    {
        self::bootKernel();
        $container = self::getContainer();
        
        $handler = $container->get(ErreurTechniqueMessageHandler::class);
        
        $exception = new Exception('Exception test');
        $message = new ErreurTechniqueMessage($exception, 'Message d\'erreur technique');

        $handler->__invoke($message);

        $this->assertEmailCount(1);
    }
}
