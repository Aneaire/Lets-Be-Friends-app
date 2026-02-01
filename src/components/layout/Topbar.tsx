import { Link } from '@tanstack/react-router'

export default function Topbar() {
  return (
    <header className="sticky top-0 left-0 z-50 w-full md:hidden bg-bgLight border-b border-dark-1/10">
      <div className="flex items-center justify-between px-4 py-3">
        <Link to="/">
          <img src="/logo-with-name.svg" width={140} height={30} alt="Let's Be Friends" />
        </Link>
      </div>
    </header>
  )
}
