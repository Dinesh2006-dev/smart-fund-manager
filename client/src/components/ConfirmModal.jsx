import React from 'react';

const ConfirmModal = ({
    show,
    title = "Confirm Action",
    message = "Are you sure you want to proceed?",
    confirmText = "Confirm",
    cancelText = "Cancel",
    onConfirm,
    onCancel,
    variant = "danger"
}) => {
    if (!show) return null;

    // FORCED SOLID STYLING
    const backdropStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.9)', // Very dark overlay
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        backdropFilter: 'blur(4px)'
    };

    const modalBoxStyle = {
        backgroundColor: '#0F172A', // STRICTLY SOLID Color
        borderRadius: '24px',
        width: '90%',
        maxWidth: '420px',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
        zIndex: 2001
    };

    return (
        <div style={backdropStyle} onClick={onCancel}>
            <div
                className="animate-modal-in"
                style={modalBoxStyle}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Solid Corner Wedge */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '100px',
                    height: '100px',
                    background: variant === 'danger' ? 'linear-gradient(135deg, #EF4444, #B91C1C)' : 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
                    clipPath: 'polygon(100% 0, 100% 100%, 0 0)',
                    zIndex: 1,
                    opacity: 1
                }}></div>

                {/* Fixed X Button Alignment */}
                <button
                    type="button"
                    onClick={onCancel}
                    style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: 'transparent',
                        border: 'none',
                        color: 'white',
                        fontSize: '1.2rem',
                        zIndex: 10,
                        cursor: 'pointer',
                        lineHeight: 1,
                        padding: '5px'
                    }}
                >
                    <i className="bi bi-x-lg"></i>
                </button>

                <div className="p-5 text-center">
                    <div className="mb-4 d-flex align-items-center justify-content-center mx-auto" style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '20px',
                        background: variant === 'danger' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                        border: `2px solid ${variant === 'danger' ? '#EF4444' : '#3B82F6'}`,
                        transform: 'rotate(-5deg)'
                    }}>
                        <i className={`bi ${variant === 'danger' ? 'bi-exclamation-octagon' : 'bi-info-circle'} fs-1`}
                            style={{ color: variant === 'danger' ? '#EF4444' : '#3B82F6', transform: 'rotate(5deg)' }}></i>
                    </div>

                    <h3 className="fw-bold text-white mb-3">{title}</h3>
                    <p className="text-white-50 fs-5 mb-5 lh-base">
                        {message}
                    </p>

                    <div className="d-flex gap-3">
                        <button
                            className="btn btn-dark flex-grow-1 rounded-pill py-3 fw-bold border-1 border-white border-opacity-10"
                            style={{ backgroundColor: '#1E293B' }}
                            onClick={onCancel}
                        >
                            {cancelText}
                        </button>
                        <button
                            className="btn flex-grow-1 rounded-pill py-3 fw-bold border-0 text-white shadow-lg"
                            style={{
                                background: variant === 'danger' ? 'linear-gradient(to right, #EF4444, #991B1B)' : 'linear-gradient(to right, #3B82F6, #1E40AF)',
                            }}
                            onClick={onConfirm}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes modalFadeIn {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-modal-in {
                    animation: modalFadeIn 0.3s ease-out forwards;
                }
            `}} />
        </div>
    );
};

export default ConfirmModal;
