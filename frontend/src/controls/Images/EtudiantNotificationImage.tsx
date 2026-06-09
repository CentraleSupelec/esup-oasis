/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React from "react";
import SvgImage from "@assets/images/etudiant-notification.svg?react";

export default function EtudiantNotificationImage(props: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return <SvgImage {...props} />;
}
