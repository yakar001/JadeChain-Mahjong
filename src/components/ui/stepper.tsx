
'use client';
import * as React from 'react';
import { Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepperProps extends React.HTMLAttributes<HTMLDivElement> {
  index: number;
  orientation?: 'horizontal' | 'vertical';
}

const StepperContext = React.createContext<{
  index: number;
  orientation: 'horizontal' | 'vertical';
}>({
  index: 0,
  orientation: 'horizontal',
});

const Stepper = React.forwardRef<HTMLDivElement, StepperProps>(
  ({ index, orientation = 'horizontal', className, children, ...props }, ref) => {
    return (
      <StepperContext.Provider value={{ index, orientation }}>
        <div
          ref={ref}
          className={cn(
            'flex w-full items-start justify-between',
            orientation === 'vertical' && 'flex-col',
            className
          )}
          {...props}
        >
          {children}
        </div>
      </StepperContext.Provider>
    );
  }
);
Stepper.displayName = 'Stepper';

const Step = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { orientation } = React.useContext(StepperContext);
  return (
    <div
      ref={ref}
      className={cn(
        'relative flex flex-1 items-center justify-start',
        orientation === 'vertical' && 'w-full flex-col items-start justify-start',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
Step.displayName = 'Step';

const StepIndicator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { orientation } = React.useContext(StepperContext);
  return (
    <div
      ref={ref}
      className={cn(
        'flex items-center justify-center',
        orientation === 'vertical' && 'pb-4',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
StepIndicator.displayName = 'StepIndicator';

const StepSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { orientation } = React.useContext(StepperContext);
  return (
    <div
      ref={ref}
      className={cn(
        'flex-1 bg-border transition-all duration-300',
        orientation === 'horizontal' ? 'h-0.5' : 'absolute left-4 top-4 -z-10 h-full w-0.5',
        className
      )}
      {...props}
    ></div>
  );
});
StepSeparator.displayName = 'StepSeparator';

interface StepStatusProps extends React.HTMLAttributes<HTMLDivElement> {
  complete?: React.ReactNode;
  active?: React.ReactNode;
  incomplete?: React.ReactNode;
}

const StepStatus = React.forwardRef<HTMLDivElement, StepStatusProps>(
  ({ complete, active, incomplete, className, ...props }, ref) => {
    // This is a little hacky, but we are getting the step number from the child.
    // This is because we want to know what step we are on, but we don't want to pass it down as a prop.
    const stepNumber = React.Children.toArray(incomplete).find(
      (child: any) => child.type.displayName === 'StepNumber'
    )?.props.children;
    const { index } = React.useContext(StepperContext);
    const isCompleted = stepNumber < index;
    const isActive = stepNumber === index;
    return (
      <div
        ref={ref}
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-full border-2 font-bold transition-colors duration-300',
          isActive && 'border-primary',
          isCompleted && 'border-primary bg-primary text-primary-foreground',
          className
        )}
        {...props}
      >
        {isCompleted ? complete : isActive ? active : incomplete}
      </div>
    );
  }
);
StepStatus.displayName = 'StepStatus';

const StepNumber = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => {
  return <span ref={ref} className={cn(className)} {...props}></span>;
});
StepNumber.displayName = 'StepNumber';

const StepTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => {
  return (
    <h3
      ref={ref}
      className={cn('font-semibold', className)}
      {...props}
    ></h3>
  );
});
StepTitle.displayName = 'StepTitle';

const StepDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    ></p>
  );
});
StepDescription.displayName = 'StepDescription';

const Box = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { orientation } = React.useContext(StepperContext);
  return (
    <div
      ref={ref}
      className={cn(
        'ms-4',
        orientation === 'vertical' && 'min-h-16',
        className
      )}
      {...props}
    ></div>
  );
});
Box.displayName = 'Box';

export {
  Stepper,
  Step,
  StepIndicator,
  StepSeparator,
  StepStatus,
  StepNumber,
  StepTitle,
  StepDescription,
  Box,
};
