import React, { Component, HTMLProps, ReactNode } from 'react';
import { css } from '@patternfly/react-styles';
import styles from '@patternfly/react-styles/css/components/Wizard/wizard';
import {
  WizardNavItemProps,
  PickOptional,
  KEY_CODES,
  WizardNav,
  WizardNavItem,
  WizardContextProvider,
  WizardHeader,
  WizardToggle,
  Modal,
  ModalVariant,
  Button,
  ButtonVariant,
} from '@patternfly/react-core';

export function getFlattenedSteps(steps: WizardStep[]): WizardStep[] {
  const flattenedSteps: WizardStep[] = [];
  for (const step of steps) {
    if (step.steps) {
      for (const childStep of step.steps) {
        flattenedSteps.push(childStep);
      }
    } else {
      flattenedSteps.push(step);
    }
  }
  return flattenedSteps;
}

export interface WizardStep {
  /** Optional identifier */
  id?: string | number;
  /** The name of the step */
  name: ReactNode;
  /** The component to render in the main body */
  component?: any;
  /** Setting to true hides the side nav and footer */
  isFinishedStep?: boolean;
  /** Enables or disables the step in the navigation. Enabled by default. */
  canJumpTo?: boolean;
  /** Sub steps */
  steps?: WizardStep[];
  /** Props to pass to the WizardNavItem */
  stepNavItemProps?:
    | HTMLProps<HTMLButtonElement | HTMLAnchorElement>
    | WizardNavItemProps;
  /** (Unused if footer is controlled) Can change the Next button text. If nextButtonText is also set for the Wizard, this step specific one overrides it. */
  nextButtonText?: ReactNode;
  /** (Unused if footer is controlled) The condition needed to enable the Next button */
  enableNext?: boolean;
  /** (Unused if footer is controlled) True to hide the Cancel button */
  hideCancelButton?: boolean;
  /** (Unused if footer is controlled) True to hide the Back button */
  hideBackButton?: boolean;
}

export type WizardStepFunctionType = (
  newStep: { id?: string | number; name: ReactNode },
  prevStep: { prevId?: string | number; prevName: ReactNode }
) => void;

export interface WizardProps extends HTMLProps<HTMLDivElement> {
  /** Custom width of the wizard */
  width?: number | string;
  /** Custom height of the wizard */
  height?: number | string;
  /** The wizard title to display if header is desired */
  title?: string;
  /** An optional id for the title */
  titleId?: string;
  /** An optional id for the description */
  descriptionId?: string;
  /** The wizard description */
  description?: ReactNode;
  /** Flag indicating whether the close button should be in the header */
  hideClose?: boolean;
  /** Callback function to close the wizard */
  onClose: () => void;
  /** Callback function when a step in the nav is clicked */
  onGoToStep?: WizardStepFunctionType;
  /** Additional classes spread to the Wizard */
  className?: string;
  /** The wizard steps configuration object */
  steps: WizardStep[];
  /** The current step the wizard is on (1 or higher) */
  currentStep: number;
  /** Aria-label for the Nav */
  navAriaLabel?: string;
  /** Sets aria-labelledby on nav element */
  navAriaLabelledBy?: string;
  /** Aria-label for the main element */
  mainAriaLabel?: string;
  /** Sets aria-labelledby on the main element */
  mainAriaLabelledBy?: string;
  /** Can remove the default padding around the main body content by setting this to true */
  hasNoBodyPadding?: boolean;
  /** (Use to control the footer) Passing in a footer component lets you control the buttons yourself */
  footer?: ReactNode;
  /** (Unused if footer is controlled) Callback function to save at the end of the wizard, if not specified uses onClose */
  onSave: () => void;
  /** (Unused if footer is controlled) Callback function after Next button is clicked */
  onNext: () => void;
  /** (Unused if footer is controlled) Callback function after Back button is clicked */
  onBack: () => void;
  goToStep: (index: number) => void;
  goToStepById: (id: number | string) => void;
  goToStepByName: (name: string) => void;
  /** (Unused if footer is controlled) The Next button text */
  nextButtonText?: ReactNode;
  /** (Unused if footer is controlled) The Back button text */
  backButtonText?: ReactNode;
  /** (Unused if footer is controlled) The Cancel button text */
  cancelButtonText?: ReactNode;
  /** (Unused if footer is controlled) aria-label for the close button */
  closeButtonAriaLabel?: string;
  /** The parent container to append the modal to. Defaults to document.body */
  appendTo?: HTMLElement | (() => HTMLElement);
  /** Flag indicating Wizard modal is open. Wizard will be placed into a modal if this prop is provided */
  isOpen?: boolean;
}

interface WizardState {
  isNavOpen: boolean;
}

export class UncontrolledWizard extends Component<WizardProps, WizardState> {
  static displayName = 'Wizard';
  private static currentId = 0;
  static defaultProps: PickOptional<WizardProps> = {
    title: undefined,
    description: '',
    className: '',
    nextButtonText: 'Next',
    backButtonText: 'Back',
    cancelButtonText: 'Cancel',
    hideClose: false,
    closeButtonAriaLabel: 'Close',
    navAriaLabel: undefined,
    navAriaLabelledBy: undefined,
    mainAriaLabel: undefined,
    mainAriaLabelledBy: undefined,
    hasNoBodyPadding: false,
    onGoToStep: undefined,
    width: undefined,
    height: undefined,
    footer: undefined,
    appendTo: undefined,
    isOpen: undefined,
  };
  private titleId: string;
  private descriptionId: string;

  constructor(props: WizardProps) {
    super(props);
    const newId = UncontrolledWizard.currentId++;
    this.titleId = props.titleId || `pf-wizard-title-${newId}`;
    this.descriptionId =
      props.descriptionId || `pf-wizard-description-${newId}`;

    this.state = {
      isNavOpen: false,
    };
  }

  private handleKeyClicks = (event: KeyboardEvent): void => {
    if (event.keyCode === KEY_CODES.ESCAPE_KEY) {
      if (this.state.isNavOpen) {
        this.setState({ isNavOpen: !this.state.isNavOpen });
      } else if (this.props.isOpen && this.props.onClose) {
        this.props.onClose();
      }
    }
  };

  // private goToStep = (step: number): void => {
  //   const { onGoToStep } = this.props;
  //   const { currentStep } = this.state;
  //   const flattenedSteps = this.getFlattenedSteps();
  //   const maxSteps = flattenedSteps.length;
  //   if (step < 1) {
  //     step = 1;
  //   } else if (step > maxSteps) {
  //     step = maxSteps;
  //   }
  //   this.setState({ currentStep: step, isNavOpen: false });
  //   const { id: prevId, name: prevName } = flattenedSteps[currentStep - 1];
  //   const { id, name } = flattenedSteps[step - 1];
  //   return onGoToStep && onGoToStep({ id, name }, { prevId, prevName });
  // };

  // private goToStepById = (stepId: number | string): void => {
  //   const flattenedSteps = this.getFlattenedSteps();
  //   let step;
  //   for (let i = 0; i < flattenedSteps.length; i++) {
  //     if (flattenedSteps[i].id === stepId) {
  //       step = i + 1;
  //       break;
  //     }
  //   }
  //   if (step) {
  //     this.setState({ currentStep: step });
  //   }
  // };

  // private goToStepByName = (stepName: string): void => {
  //   const flattenedSteps = this.getFlattenedSteps();
  //   let step;
  //   for (let i = 0; i < flattenedSteps.length; i++) {
  //     if (flattenedSteps[i].name === stepName) {
  //       step = i + 1;
  //       break;
  //     }
  //   }
  //   if (step) {
  //     this.setState({ currentStep: step });
  //   }
  // };

  private getFlattenedSteps = (): WizardStep[] => {
    const { steps } = this.props;
    return getFlattenedSteps(steps);
  };

  private getFlattenedStepsIndex = (
    flattenedSteps: WizardStep[],
    stepName: ReactNode
  ): number => {
    for (let i = 0; i < flattenedSteps.length; i++) {
      if (flattenedSteps[i].name === stepName) {
        return i + 1;
      }
    }

    return 0;
  };

  private initSteps = (steps: WizardStep[]): WizardStep[] => {
    // Set default Step values
    for (let i = 0; i < steps.length; i++) {
      if (steps[i].steps) {
        for (let j = 0; j < steps[i].steps!.length; j++) {
          steps[i].steps![j] = Object.assign(
            { canJumpTo: true },
            steps[i].steps![j]
          );
        }
      }
      steps[i] = Object.assign({ canJumpTo: true }, steps[i]);
    }
    return steps;
  };

  getElement = (appendTo: HTMLElement | (() => HTMLElement)) => {
    if (typeof appendTo === 'function') {
      return appendTo();
    }
    return appendTo || document.body;
  };

  componentDidMount() {
    const target = typeof document !== 'undefined' ? document.body : null;
    if (target) {
      target.addEventListener('keydown', this.handleKeyClicks, false);
    }
  }

  componentWillUnmount() {
    const target = (typeof document !== 'undefined' && document.body) || null;
    if (target) {
      target.removeEventListener('keydown', this.handleKeyClicks, false);
    }
  }

  render() {
    const {
      /* eslint-disable @typescript-eslint/no-unused-vars */
      width,

      height,
      title,
      description,
      onClose,
      onSave,
      onBack,
      onNext,
      onGoToStep,
      goToStep,
      goToStepById,
      goToStepByName,
      className,
      steps,
      currentStep,
      nextButtonText = 'Next',
      backButtonText = 'Back',
      cancelButtonText = 'Cancel',
      hideClose,
      closeButtonAriaLabel = 'Close',
      navAriaLabel,
      navAriaLabelledBy,
      mainAriaLabel,
      mainAriaLabelledBy,
      hasNoBodyPadding,
      footer,
      appendTo,
      isOpen,
      titleId,
      descriptionId,
      ...rest
      /* eslint-enable @typescript-eslint/no-unused-vars */
    } = this.props;
    const flattenedSteps = this.getFlattenedSteps();
    const adjustedStep =
      flattenedSteps.length < currentStep ? flattenedSteps.length : currentStep;
    const activeStep = flattenedSteps[adjustedStep - 1];
    const computedSteps: WizardStep[] = this.initSteps(steps);
    const firstStep = activeStep === flattenedSteps[0];
    const isValid =
      activeStep && activeStep.enableNext !== undefined
        ? activeStep.enableNext
        : true;
    const nav = (isWizardNavOpen: boolean) => {
      const wizNavAProps = {
        isOpen: isWizardNavOpen,
        'aria-label': navAriaLabel,
        'aria-labelledby':
          (title || navAriaLabelledBy) && (navAriaLabelledBy || this.titleId),
      };
      return (
        <WizardNav {...wizNavAProps}>
          {computedSteps.map((step, index) => {
            if (step.isFinishedStep) {
              // Don't show finished step in the side nav
              return null;
            }
            let enabled;
            let navItemStep;
            if (step.steps) {
              let hasActiveChild = false;
              let canJumpToParent = false;
              for (const subStep of step.steps) {
                if (activeStep.name === subStep.name) {
                  // one of the children matches
                  hasActiveChild = true;
                }
                if (subStep.canJumpTo) {
                  canJumpToParent = true;
                }
              }
              navItemStep = this.getFlattenedStepsIndex(
                flattenedSteps,
                step.steps[0].name
              );
              return (
                <WizardNavItem
                  key={index}
                  content={step.name}
                  isCurrent={hasActiveChild}
                  isDisabled={!canJumpToParent}
                  step={navItemStep}
                  onNavItemClick={goToStep}
                >
                  <WizardNav {...wizNavAProps} returnList>
                    {step.steps.map(
                      (childStep: WizardStep, indexChild: number) => {
                        if (childStep.isFinishedStep) {
                          // Don't show finished step in the side nav
                          return null;
                        }
                        navItemStep = this.getFlattenedStepsIndex(
                          flattenedSteps,
                          childStep.name
                        );
                        enabled = childStep.canJumpTo;
                        return (
                          <WizardNavItem
                            key={`child_${indexChild}`}
                            content={childStep.name}
                            isCurrent={activeStep.name === childStep.name}
                            isDisabled={!enabled}
                            step={navItemStep}
                            onNavItemClick={goToStep}
                          />
                        );
                      }
                    )}
                  </WizardNav>
                </WizardNavItem>
              );
            }
            navItemStep = this.getFlattenedStepsIndex(
              flattenedSteps,
              step.name
            );
            enabled = step.canJumpTo;
            return (
              <WizardNavItem
                {...step.stepNavItemProps}
                key={index}
                content={step.name}
                isCurrent={activeStep.name === step.name}
                isDisabled={!enabled}
                step={navItemStep}
                onNavItemClick={goToStep}
              />
            );
          })}
        </WizardNav>
      );
    };

    const context = {
      goToStepById,
      goToStepByName,
      onNext,
      onBack,
      onClose,
      activeStep,
    };

    const divStyles = {
      ...(height ? { height } : {}),
      ...(width ? { width } : {}),
    };

    const wizard = (
      <WizardContextProvider value={context}>
        <div
          {...rest}
          className={css(
            styles.wizard,
            activeStep && activeStep.isFinishedStep && 'pf-m-finished',
            className
          )}
          style={Object.keys(divStyles).length ? divStyles : undefined}
        >
          {title && (
            <WizardHeader
              titleId={this.titleId}
              descriptionId={this.descriptionId}
              onClose={onClose}
              title={title}
              description={description}
              closeButtonAriaLabel={closeButtonAriaLabel}
              hideClose={hideClose}
            />
          )}
          <WizardToggle
            mainAriaLabel={mainAriaLabel}
            isInPage={isOpen === undefined}
            mainAriaLabelledBy={
              (title || mainAriaLabelledBy) &&
              (mainAriaLabelledBy || this.titleId)
            }
            isNavOpen={this.state.isNavOpen}
            onNavToggle={isNavOpen => this.setState({ isNavOpen })}
            nav={nav}
            steps={steps}
            activeStep={activeStep}
            hasNoBodyPadding={hasNoBodyPadding!}
          >
            {footer || (
              <footer className={css(styles.wizardFooter)}>
                <Button
                  variant={ButtonVariant.primary}
                  type="submit"
                  onClick={onNext}
                  isDisabled={!isValid}
                >
                  {(activeStep && activeStep.nextButtonText) || nextButtonText}
                </Button>
                {!activeStep.hideBackButton && (
                  <Button
                    variant={ButtonVariant.secondary}
                    onClick={onBack}
                    className={css(firstStep && 'pf-m-disabled')}
                  >
                    {backButtonText}
                  </Button>
                )}
                {!activeStep.hideCancelButton && (
                  <div className={styles.wizardFooterCancel}>
                    <Button variant={ButtonVariant.link} onClick={onClose}>
                      {cancelButtonText}
                    </Button>
                  </div>
                )}
              </footer>
              // <WizardFooterInternal
              //   onNext={this.onNext}
              //   onBack={this.onBack}
              //   onClose={onClose}
              //   isValid={isValid}
              //   firstStep={firstStep}
              //   activeStep={activeStep}
              //   nextButtonText={(activeStep && activeStep.nextButtonText) || nextButtonText}
              //   backButtonText={backButtonText}
              //   cancelButtonText={cancelButtonText}
              // />
            )}
          </WizardToggle>
        </div>
      </WizardContextProvider>
    );

    if (isOpen !== undefined) {
      return (
        <Modal
          width={width !== null ? width : undefined}
          isOpen={isOpen}
          variant={ModalVariant.large}
          aria-labelledby={this.titleId}
          aria-describedby={this.descriptionId}
          showClose={false}
          hasNoBodyWrapper
        >
          {wizard}
        </Modal>
      );
    }
    return wizard;
  }
}
