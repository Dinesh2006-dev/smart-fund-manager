import React, { useState } from 'react';
import Sidebar from './Sidebar';

const MainLayout = ({ children }) => {
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);

    return (
        <div className="main-layout bg-premium">
            <div className={`sidebar-wrapper ${showMobileSidebar ? 'show' : ''}`}>
                <Sidebar />
            </div>

            {/* Mobile Toggle Button */}
            <button
                className="btn btn-primary d-lg-none position-fixed bottom-0 end-0 m-4 rounded-circle shadow-lg z-3"
                style={{ width: '60px', height: '60px', zIndex: 1100 }}
                onClick={() => setShowMobileSidebar(!showMobileSidebar)}
            >
                <i className={`bi ${showMobileSidebar ? 'bi-x-lg' : 'bi-list'} fs-3`}></i>
            </button>

            <main className="main-content container-fluid">
                {children}
            </main>

            {/* Backdrop for mobile */}
            {showMobileSidebar && (
                <div
                    className="modal-backdrop fade show d-lg-none shadow-blur"
                    style={{ zIndex: 1040 }}
                    onClick={() => setShowMobileSidebar(false)}
                ></div>
            )}
        </div>
    );
};

export default MainLayout;
