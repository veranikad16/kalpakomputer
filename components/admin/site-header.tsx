import { Separator } from "@/components/admin/ui/separator"
import { SidebarTrigger } from "@/components/admin/ui/sidebar"

export function SiteHeader() {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 h-4 data-vertical:self-auto"
        />
        <img
          src="/logo.png"
          alt="PT. KALPA KOMPUTER BALI Logo"
          className="h-8 w-auto object-contain"        
        />
        <h1 className="text-base font-medium">PT. KALPA KOMPUTER BALI</h1>
      </div>
    </header>
  )
}
