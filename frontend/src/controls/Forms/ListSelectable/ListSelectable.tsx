/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { ReactElement } from "react";
import { List } from "antd";

interface IListSelectable<T extends { "@id"?: string | undefined }> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  onSelect: (item: T | undefined) => void;
  selectedItemId?: string;
  extra?: (item: T) => React.ReactNode;
  className?: string;
  classNameSelected?: string;
  header?: React.ReactNode;
  loading?: boolean;
}

/**
 * Renders a selectable list of items.
 *
 * @param {IListSelectable} options - The options for rendering the list
 * @param {IListSelectable<T>.items} options.items - The array of items to be rendered
 * @param {Function} options.renderItem - The function that renders each item
 * @param {Function} options.onSelect - The callback function triggered when an item is selected
 * @param {string} options.selectedItemId - The ID of the currently selected item
 * @param {Function} [options.extra] - The function that renders any extra content for each item
 * @param {string} [options.className] - The CSS class for the list
 * @param {string} [options.classNameSelected] - The CSS class for the selected item
 * @param {ReactNode} [options.header] - The header component for the list
 * @param {boolean} [options.loading] - Indicates whether the list is in a loading state
 *
 * @returns {ReactElement} The rendered selectable list component
 */
export default function ListSelectable<T extends { "@id"?: string | undefined }>({
  items,
  renderItem,
  onSelect,
  selectedItemId,
  extra,
  className,
  classNameSelected,
  header,
  loading,
}: IListSelectable<T>): ReactElement {
  const getClassName = (item: T) => {
    if (selectedItemId) {
      if (item["@id"] === selectedItemId) {
        return `ant-list-selectable-selected ${classNameSelected}`;
      }
      return "ant-list-selectable d-none";
    }

    return `ant-list-selectable-selected`;
  };

  return (
    <List<T> className={`selectable ${className}`} header={header} loading={loading}>
      {items.map((item) => {
        return (
          <List.Item
            key={item["@id"]}
            extra={extra?.(item)}
            className={getClassName(item)}
            onClick={() => {
              if (item["@id"] === selectedItemId) {
                onSelect(undefined);
                return;
              }
              onSelect(item);
            }}
          >
            {renderItem(item)}
          </List.Item>
        );
      })}
    </List>
  );
}
