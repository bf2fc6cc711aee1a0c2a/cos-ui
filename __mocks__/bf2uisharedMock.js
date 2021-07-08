/* global jest */
const uiShared = jest.genMockFromModule('@bf2/ui-shared');

uiShared.useBasename = () => {
  return {
    getBasename: () => '',
  };
};

module.exports = uiShared;
