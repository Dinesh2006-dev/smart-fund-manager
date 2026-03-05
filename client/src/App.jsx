import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import LandingPage from './pages/LandingPage'
import UserDashboard from './pages/UserDashboard'
import AdminDashboard from './pages/AdminDashboard'
import AdminFunds from './pages/AdminFunds'
import AdminUsers from './pages/AdminUsers'
import AdminPayments from './pages/AdminPayments';
import AdminTracking from './pages/AdminTracking';
import AdminUserReport from './pages/AdminUserReport';
import UserPassbook from './pages/UserPassbook';
import WalletPage from './pages/WalletPage';
import ProfilePage from './pages/ProfilePage.jsx';

import MainLayout from './components/MainLayout';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Routes>
            <Route path="/" element={<LandingPage />} />

            {/* User Routes (Wrapped in ProtectedRoute and MainLayout) */}
            <Route path="/user/*" element={
              <ProtectedRoute>
                <MainLayout>
                  <Routes>
                    <Route path="dashboard" element={<UserDashboard />} />
                    <Route path="passbook" element={<UserPassbook />} />
                    <Route path="wallet" element={<WalletPage />} />
                    <Route path="profile" element={<ProfilePage />} />
                  </Routes>
                </MainLayout>
              </ProtectedRoute>
            } />

            {/* Admin Routes (Wrapped in ProtectedRoute and MainLayout) */}
            <Route path="/admin/*" element={
              <ProtectedRoute requiredRole="admin">
                <MainLayout>
                  <Routes>
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="funds" element={<AdminFunds />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="payments" element={<AdminPayments />} />
                    <Route path="tracking/:id" element={<AdminTracking />} />
                    <Route path="user-report" element={<AdminUserReport />} />
                    <Route path="profile" element={<ProfilePage />} />
                  </Routes>
                </MainLayout>
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App
