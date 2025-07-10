import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Bot, Menu } from "lucide-react"

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-amber-200/50 bg-white/90 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
            인테리어AI
          </span>
        </Link>

        <nav className="hidden md:flex items-center space-x-8">
          <Link href="#features" className="text-gray-700 hover:text-purple-600 transition-colors">
            기능소개
          </Link>
          <Link href="#process" className="text-gray-700 hover:text-purple-600 transition-colors">
            진행과정
          </Link>
          <Link href="#experience" className="text-gray-700 hover:text-purple-600 transition-colors">
            AI 체험
          </Link>
          <Link href="#contact" className="text-gray-700 hover:text-purple-600 transition-colors">
            문의하기
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" className="hidden md:flex">
            로그인
          </Button>
          <Button className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600">
            무료 시작하기
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
