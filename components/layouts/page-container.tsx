import { cn } from "@/lib/utils"

interface PageContainerProps {
  children: React.ReactNode
  title?: string
  className?: string
}

// PageContainer コンポーネント：ページ全体のレイアウトを一貫して提供するコンテナ
// オプションのタイトルを表示し、コンテンツを中央揃えにします。
export const PageContainer = ({
  children,
  title,
  className,
}: PageContainerProps) => {
  return (
    <div
      className={cn(
        "container mx-auto px-4 py-8 min-h-screen flex flex-col items-center justify-center",
        className
      )}
    >
      {/* タイトルが提供されている場合、見出しとして表示 */}
      {title && (
        <h1 className="text-4xl font-bold mb-8 text-center">{title}</h1>
      )}
      {/* 子要素をレンダリング */}
      {children}
    </div>
  )
}
