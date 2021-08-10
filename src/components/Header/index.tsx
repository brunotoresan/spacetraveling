import Link from 'next/link'
import style from './header.module.scss'

export default function Header() {
  return (
    <Link href='/' >
      <header className={style.headerContainer}>
        <div className={style.headerContent}>
          <img src="/logo.svg" alt="logo" />
        </div>
      </header>
    </Link>
  )
}
