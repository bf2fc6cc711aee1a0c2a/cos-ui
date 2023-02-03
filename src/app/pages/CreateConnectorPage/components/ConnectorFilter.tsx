import { validateConnectorSearchField } from '@utils/shared';
import React, { FC, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  Button,
  ButtonVariant,
  InputGroup,
  TextInput,
  Tooltip,
  ValidatedOptions,
  TextInputGroup,
  TextInputGroupUtilities,
} from '@patternfly/react-core';
import { TimesIcon } from '@patternfly/react-icons';
import SearchIcon from '@patternfly/react-icons/dist/js/icons/search-icon';

export type ConnectorFilter = {
  onChangeSearchField: (value: string) => void;
  loading: boolean;
  searchFieldPlaceholder: string;
  total: number;
  searchFieldValue: string;
};
export const ConnectorFilter: FC<ConnectorFilter> = ({
  onChangeSearchField,
  loading,
  searchFieldPlaceholder,
  searchFieldValue,
}) => {
  const { t } = useTranslation();
  const [valid, setValid] = useState<boolean>(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const [currentSearch, setCurrentSearch] = useState<string | undefined>(
    searchFieldValue
  );
  const [showClearButton, SetShowClearButton] = useState<boolean>(false);

  const onChange = (input?: string) => {
    setCurrentSearch(input);
    setValid(validateConnectorSearchField(input));
  };

  const onFilter = () => {
    if (currentSearch && currentSearch.trim() != '') {
      if (validateConnectorSearchField(currentSearch)) {
        onChangeSearchField(currentSearch);
        setCurrentSearch('');
      } else {
        setValid(false);
      }
    }
    SetShowClearButton(true);
  };
  const renderInput = () => {
    const FilterTooltip: FC = () => {
      if (!valid) {
        return (
          <Tooltip
            isVisible={!valid}
            content={<div>{t('input_field_invalid_message')}</div>}
            reference={inputRef}
          />
        );
      }
      return <></>;
    };
    return (
      <InputGroup>
        <TextInputGroup>
          <div className="pf-c-text-input-group__text">
            <TextInput
              name="name"
              id="filterText"
              type="search"
              validated={
                !valid ? ValidatedOptions.error : ValidatedOptions.default
              }
              placeholder={searchFieldPlaceholder}
              aria-label={searchFieldPlaceholder}
              onChange={onChange}
              value={currentSearch}
              ref={inputRef}
              isDisabled={loading}
            />
          </div>
          {showClearButton && searchFieldValue !== '' ? (
            <TextInputGroupUtilities>
              <Button
                variant={ButtonVariant.plain}
                onClick={() => {
                  setCurrentSearch('');
                  onChangeSearchField('');
                  setValid(true);
                }}
                isDisabled={!valid}
              >
                <TimesIcon />
              </Button>
            </TextInputGroupUtilities>
          ) : (
            <></>
          )}
        </TextInputGroup>
        <Button
          variant={ButtonVariant.control}
          isDisabled={!valid || loading}
          onClick={() => onFilter()}
          aria-label="filter by connector name"
          type="submit"
          icon={<SearchIcon />}
        />
        <FilterTooltip />
      </InputGroup>
    );
  };
  return renderInput();
};
