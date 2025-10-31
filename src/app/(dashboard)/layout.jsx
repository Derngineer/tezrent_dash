// Layout Imports
import LayoutWrapper from '@layouts/LayoutWrapper'
import VerticalLayout from '@layouts/VerticalLayout'

// Component Imports
import Providers from '@components/Providers'
import AuthGuard from '@components/AuthGuard'
import Navigation from '@components/layout/vertical/Navigation'
import Navbar from '@components/layout/vertical/Navbar'
import VerticalFooter from '@components/layout/vertical/Footer'

const Layout = async ({ children }) => {
  // Vars
  const direction = 'ltr'

  return (
    <Providers direction={direction}>
      {/* AuthGuard protects all dashboard routes */}
      <AuthGuard>
        <LayoutWrapper
          verticalLayout={
            <VerticalLayout navigation={<Navigation />} navbar={<Navbar />} footer={<VerticalFooter />}>
              {children}
            </VerticalLayout>
          }
        />
      </AuthGuard>
    </Providers>
  )
}

export default Layout
