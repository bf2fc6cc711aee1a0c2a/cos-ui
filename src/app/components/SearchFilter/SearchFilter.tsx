import React, { FunctionComponent, useRef, useState } from 'react';

import {
  Button,
  ButtonVariant,
  InputGroup,
  TextInput,
  TextInputProps,
  Tooltip,
  ValidatedOptions,
} from '@patternfly/react-core';
import SearchIcon from '@patternfly/react-icons/dist/js/icons/search-icon';

import { useTranslation } from '@rhoas/app-services-ui-components';

export type FilterProps = {
  placeholder: string;
  onChangeSearchField: (value: string) => void;
  SearchFieldName: string;
  validateFilterRegex: (value?: string) => boolean;
};

export const SearchFilter: FunctionComponent<FilterProps> = ({
  placeholder,
  onChangeSearchField,
  SearchFieldName,
  validateFilterRegex,
}) => {
  const { t } = useTranslation();
  const [valid, setValid] = useState<boolean>(true);
  const [currentSearch, setCurrentSearch] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  const onChange = (currentSearch: string) => {
    setCurrentSearch(currentSearch);
    setValid(validateFilterRegex(currentSearch));
  };

  const onFilter = () => {
    if (currentSearch && currentSearch.trim() != '') {
      if (validateFilterRegex(currentSearch)) {
        onChangeSearchField(currentSearch);
        setCurrentSearch('');
      } else {
        setValid(false);
      }
    }
  };

  const onKeyPress: TextInputProps['onKeyPress'] = (event) => {
    if (event.key === 'Enter') {
      onFilter();
    }
  };

  const FilterTooltip: FunctionComponent = () => {
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
      <TextInput
        name={SearchFieldName}
        id="filterText"
        type="search"
        validated={!valid ? ValidatedOptions.error : ValidatedOptions.default}
        placeholder={placeholder}
        aria-label={placeholder}
        onChange={onChange}
        onKeyPress={onKeyPress}
        value={currentSearch}
        ref={inputRef}
      />
      <Button
        variant={ButtonVariant.control}
        isDisabled={!valid}
        onClick={onFilter}
        aria-label="Search"
      >
        <SearchIcon />
      </Button>
      <FilterTooltip />
    </InputGroup>
  );
};
