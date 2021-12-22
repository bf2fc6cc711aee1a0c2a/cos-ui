import React, { FunctionComponent } from 'react';

import {
  Button,
  ClipboardCopyButton,
  CodeBlock,
  CodeBlockAction,
  CodeBlockCode,
  Tooltip,
} from '@patternfly/react-core';
import {
  EyeIcon,
  EyeSlashIcon,
  FileDownloadIcon,
} from '@patternfly/react-icons';

import { useReviewMachine } from './CreateConnectorWizardContext';

export const ViewJSONFormat: FunctionComponent = () => {
  const [copied, setCopied] = React.useState<boolean>(false);
  const [showServiceAccount, setShowServiceAccount] =
    React.useState<boolean>(false);

  const downloadTooltipRef = React.useRef();
  const showTooltipRef = React.useRef();
  let timer: any;

  const { configString } = useReviewMachine();

  function maskPropertyValues(inputObj: any) {
    const dataToHide = ['secretKey'];
    const json = JSON.stringify(
      inputObj,
      (key, value) => {
        return dataToHide.indexOf(key) === -1
          ? value
          : '*'.repeat(value.length);
      },
      2
    );
    return json;
  }

  const getJson = (properties: any, showHiddenFields: boolean) => {
    return showHiddenFields
      ? properties
      : maskPropertyValues(JSON.parse(properties));
  };

  const clipboardCopyFunc = (event: any, text: string) => {
    const clipboard = event.currentTarget.parentElement;
    const el = document.createElement('textarea');
    el.value = text.toString();
    clipboard.appendChild(el);
    el.select();
    document.execCommand('copy');
    clipboard.removeChild(el);
  };

  const onClick = (event: any, text: string) => {
    if (timer) {
      window.clearTimeout(timer);
      setCopied(false);
    }
    clipboardCopyFunc(event, text);
    setCopied(true);
  };

  const downloadFile = async (event: any, data: any) => {
    const downloadJson = event.currentTarget.parentElement;
    const file = 'connectorConfig.json';
    const json = data;
    const blob = new Blob([json], { type: 'application/json' });
    const href = await URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = file;
    downloadJson.appendChild(link);
    link.click();
    downloadJson.removeChild(link);
  };

  const actions = (
    <React.Fragment>
      <CodeBlockAction>
        <Button
          variant="plain"
          ref={showTooltipRef}
          aria-label="show hidden fields icon"
          onClick={() => setShowServiceAccount(!showServiceAccount)}
        >
          {showServiceAccount ? <EyeSlashIcon /> : <EyeIcon />}
        </Button>
        <Tooltip
          content={
            <div>
              {showServiceAccount
                ? 'Hide service account'
                : 'Show service account'}
            </div>
          }
          reference={showTooltipRef}
        />
      </CodeBlockAction>
      <CodeBlockAction>
        <ClipboardCopyButton
          id="copy-button"
          textId="code-content"
          aria-label="Copy to clipboard"
          onClick={(e) => onClick(e, getJson(configString, showServiceAccount))}
          exitDelay={600}
          maxWidth="110px"
          variant="plain"
        >
          {copied ? 'Successfully copied to clipboard!' : 'Copy to clipboard'}
        </ClipboardCopyButton>
      </CodeBlockAction>
      <CodeBlockAction>
        <Button
          variant="plain"
          ref={downloadTooltipRef}
          aria-label="Download icon"
          onClick={(e) =>
            downloadFile(e, getJson(configString, showServiceAccount))
          }
        >
          <FileDownloadIcon />
        </Button>
        <Tooltip
          content={<div>Download JSON</div>}
          reference={downloadTooltipRef}
        />
      </CodeBlockAction>
    </React.Fragment>
  );
  return (
    <CodeBlock actions={actions}>
      <CodeBlockCode id="code-content">
        {getJson(configString, showServiceAccount)}
      </CodeBlockCode>
    </CodeBlock>
  );
};
