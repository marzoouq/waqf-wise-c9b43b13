interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex-1 min-w-0">
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold break-words">{title}</h1>
        {description && (
          <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">{description}</p>
        )}
      </div>
      {action && (
        <div className="flex-shrink-0 w-full sm:w-auto">
          {action}
        </div>
      )}
    </div>
  );
}
