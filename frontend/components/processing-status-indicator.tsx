interface ProcessingStatusIndicatorProps {
  message: string;
}

export function ProcessingStatusIndicator({ message }: ProcessingStatusIndicatorProps) {
  return (
    <p className="animate-processing-fade text-xs text-muted-foreground">
      {message}
    </p>
  );
}
