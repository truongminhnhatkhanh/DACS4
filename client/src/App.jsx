import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import RecoveryCodeModal from './components/RecoveryCodeModal';
import RecoverAccountModal from './components/RecoverAccountModal';
import ProfileModal from './components/ProfileModal';
import FeedPage from './pages/FeedPage';
import MyPostsPage from './pages/MyPostsPage';
import P2PChatPage from './pages/P2PChatPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import { Shield } from 'lucide-react';

function AppContent() {
  const [activeTab, setActiveTab] = useState('feed'); // 'feed' | 'my-posts' | 'p2p-chat' | 'admin'
  const {
    user,
    loading,
    showRecoveryCodeModal,
    setShowRecoveryCodeModal,
    guestRecoveryCode,
    showRecoverModal,
    setShowRecoverModal,
    showProfileModal,
    setShowProfileModal
  } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-mint-mist flex items-center justify-center border border-hairline shadow-subtle animate-pulse">
          <Shield className="w-6 h-6 text-emerald-pulse" />
        </div>
        <p className="text-xs text-graphite font-mono">Đang khởi tạo phiên làm việc...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-forest-ink flex flex-col">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 pb-16 md:pb-0">
        {activeTab === 'feed' && <FeedPage onStartChat={() => setActiveTab('p2p-chat')} />}
        {activeTab === 'my-posts' && <MyPostsPage />}
        {activeTab === 'p2p-chat' && <P2PChatPage />}
        {activeTab === 'admin' && (
          user?.role === 'admin' ? (
            <AdminDashboardPage />
          ) : (
            <AdminLoginPage onLoginSuccess={() => setActiveTab('admin')} />
          )
        )}
      </main>

      {/* Upstash Style Footer */}
      <footer className="border-t border-hairline bg-white py-8 text-xs text-graphite mt-16">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-pulse inline-block"></span>
            <span className="font-semibold text-forest-ink">Heli Platform</span>
            <span>—</span>
            <span>Nền tảng Tâm sự Ẩn danh & Trợ lý AI An toàn (DACS4)</span>
          </div>
          <div className="flex items-center space-x-4 text-[11px] text-graphite font-mono">
            <span>WebRTC DataChannel (In-RAM)</span>
            <span>•</span>
            <span>SHA-256 / Bcrypt</span>
            <span>•</span>
            <span>Upstash Design System</span>
          </div>
        </div>
      </footer>

      {/* Modals toàn cục */}
      <AuthModal />
      <RecoveryCodeModal
        isOpen={showRecoveryCodeModal}
        onClose={() => setShowRecoveryCodeModal(false)}
        recoveryCode={guestRecoveryCode}
      />
      <RecoverAccountModal
        isOpen={showRecoverModal}
        onClose={() => setShowRecoverModal(false)}
      />
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
