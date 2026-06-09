/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React from "react";
import { Button, Input, Space } from "antd";
import dayjs from "dayjs";
import { IEvenement } from "@api";

interface IDureeEvenementFieldProps {
  evenement: IEvenement;
  className?: string;
  width?: number;
}

export default function DureeEvenementField({
  evenement,
  className,
  width,
}: IDureeEvenementFieldProps) {
  // get nb minutes between evenement.debut and evenement.fin
  const nbMinutes = dayjs(evenement.fin).diff(dayjs(evenement.debut), "minute");

  return (
    <Space.Compact className="w-100">
      <Input
        className={`text-center text-text semi-bold ${className}`}
        disabled
        value={nbMinutes}
        width={width}
      />
      <Button disabled className="bg-light text-dark border-left-0">
        {nbMinutes > 1 ? "minutes" : "minute"}
      </Button>
    </Space.Compact>
  );
}
