import { CodeEditor, Language } from '@patternfly/react-code-editor';
import { Alert, AlertGroup, PageSection, Text } from '@patternfly/react-core';
import React, { useCallback } from 'react';
import {
  useCreationWizardMachineReviewActor,
  useReviewMachine,
} from '@cos-ui/machines';

export function Review() {
  const actor = useCreationWizardMachineReviewActor();
  const { data, error, warnings, onChange } = useReviewMachine(actor);
  const onEditorDidMount = useCallback((editor: any, _monaco: any) => {
    editor.layout();
    editor.focus();
    // monaco.editor.getModels()[0].updateOptions({ tabSize: 5 });
  }, []);
  return (
    <PageSection variant="light">
      <Text component="h2">Please review the configuration data.</Text>
      <AlertGroup>
        {error && <Alert title={error} variant="danger" isInline />}
        {warnings?.map((w, idx) => (
          <Alert key={idx} title={w} variant="warning" isInline />
        ))}
      </AlertGroup>
      <CodeEditor
        isDarkTheme={false}
        isLineNumbersVisible={true}
        isReadOnly={false}
        isMinimapVisible={false}
        isLanguageLabelVisible
        code={data}
        onChange={onChange}
        language={Language.json}
        onEditorDidMount={onEditorDidMount}
        height="400px"
      />
    </PageSection>
  );
}
