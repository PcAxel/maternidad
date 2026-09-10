import Sidebar from '../components/Sidebar'
import './MainLayout.css'

function MainLayout({ children }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="app-shell__content">{children}</main>
    </div>
  )
}

export default MainLayout
