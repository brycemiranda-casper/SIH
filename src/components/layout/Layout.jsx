import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import AlertCenterDrawer from './AlertCenterDrawer';
import ExplainableRiskModal from '../dashboard/ExplainableRiskModal';
import useStore from '../../store/useStore';

export default function Layout() {
  const { emergencyMode } = useStore();

  return (
    <div className={`flex h-screen font-sans overflow-hidden transition-colors duration-300 ${
      emergencyMode ? 'bg-red-50 text-red-950' : 'bg-[#faf9f6] text-stone-900'
    }`}>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 overflow-y-auto relative p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
      <AlertCenterDrawer />
      <ExplainableRiskModal />
    </div>
  );
}
