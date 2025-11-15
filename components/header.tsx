"use client";

interface HeaderProps {
  title: string;
  description?: string;
}

export function Header({ title, description }: HeaderProps) {
  return (
    <div className="border-b bg-background">
      <div className="flex h-16 items-center justify-between px-6">
        <div>
          <h1 className="text-lg font-bold">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
