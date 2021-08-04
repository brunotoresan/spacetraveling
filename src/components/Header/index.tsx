import style from './header.module.scss'

export default function Header() {
  return (
    <header className={style.headerContainer}>
      <div className={style.headerContent}>
        <img src="/logo.svg" alt="logo" />
      </div>
    </header>
  )
}
