import style from './header.module.scss'

export default function Header() {
  return (
    <header className={style.headerContainer}>
      <div className={style.headerContent}>
        <img src="/images/logo.svg" alt="spacetraveling." />
      </div>
    </header>
  )
}
