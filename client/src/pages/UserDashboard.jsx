import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, Filler } from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';
import JoinFundModal from '../components/JoinFundModal';
import PaymentModal from '../components/PaymentModal';
import WithdrawModal from '../components/WithdrawModal';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, Filler);

const UserDashboard = () => {
    const { token } = useAuth();
    const [summary, setSummary] = useState(null);
    const [allFunds, setAllFunds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Modal States
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [selectedFund, setSelectedFund] = useState(null);
    const [showPayModal, setShowPayModal] = useState(false);
    const [preSelectedPayFund, setPreSelectedPayFund] = useState(null);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [selectedFundForWithdraw, setSelectedFundForWithdraw] = useState(null);

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            const [summaryRes, fundsRes] = await Promise.all([
                api.get('/dashboard/user/summary'),
                api.get('/funds')
            ]);
            setSummary(summaryRes.data);
            setAllFunds(fundsRes.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError('Failed to load dashboard data.');
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchDashboard();
        }
    }, [token]);

    const handleJoinClick = (fund) => {
        setSelectedFund(fund);
        setShowJoinModal(true);
    };

    const handleQuickPay = (fundId) => {
        setPreSelectedPayFund(fundId);
        setShowPayModal(true);
    };

    const handleWithdrawClick = (fund) => {
        setSelectedFundForWithdraw(fund);
        setShowWithdrawModal(true);
    };

    const handleWithdrawSuccess = (data) => {
        setShowWithdrawModal(false);
        fetchDashboard(); // Refresh all stats
    };

    if (loading) {
        return (
            <div className="min-vh-100">
                <div className="text-center pt-5">
                    <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
                </div>
            </div>
        );
    }

    // Filter available funds (not joined yet)
    const joinedIds = summary?.funds?.map(f => f.fund_id) || [];
    const availableFunds = allFunds.filter(f => !joinedIds.includes(f.id) && f.status === 'active');

    // Growth Chart Data
    const growthChartData = {
        labels: summary?.growthChart?.map(g => g.month) || [],
        datasets: [{
            label: 'Portfolio Value',
            data: summary?.growthChart?.map(g => g.value) || [],
            fill: true,
            borderColor: '#00E5FF',
            backgroundColor: 'rgba(0, 229, 255, 0.1)',
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#00E5FF',
            borderWidth: 3
        }]
    };

    const growthChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(26, 29, 33, 0.9)',
                titleColor: '#fff',
                bodyColor: '#fff',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.1)'
            }
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { color: 'rgba(255,255,255,0.5)' }
            },
            y: {
                grid: { color: 'rgba(255,255,255,0.05)' },
                ticks: { color: 'rgba(255,255,255,0.5)', callback: (v) => '₹' + v.toLocaleString() }
            }
        }
    };

    return (
        <div className="pb-5">
            <div className="mt-2">
                {/* Welcome Banner */}
                <div className="mb-5 animate-fade-in d-flex justify-content-between align-items-end">
                    <div>
                        <h1 className="fw-bold mb-1 text-white display-5" style={{ letterSpacing: '-1.5px' }}>
                            Welcome back, <span style={{ background: 'var(--grad-blue-vibrant)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{summary?.user?.name?.split(' ')[0] || 'Member'}</span>! 👋
                        </h1>
                        <p className="text-white-50 fs-5 mb-0">Your portfolio is growing. Here's your overview.</p>
                    </div>
                    <div className="text-end d-none d-md-block">
                        <div className="text-white-50 small fw-bold tracking-widest text-uppercase">Market Yield</div>
                        <div className="text-success fw-bold fs-4">+{summary?.performanceRate || '0.0'}% <i className="bi bi-arrow-up-short"></i></div>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="row g-4 mb-4">
                    <div className="col-md-3">
                        <div className="card glass-card border-0 overflow-hidden position-relative h-100">
                            <div className="card-body p-4 position-relative">
                                <div className="text-white-50 small fw-bold text-uppercase tracking-wider">Invested</div>
                                <h2 className="fw-extrabold text-white mb-0 display-6 mt-1">₹{summary?.totalPaid?.toLocaleString() || 0}</h2>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card glass-card border-0 overflow-hidden position-relative h-100">
                            <div className="card-body p-4 position-relative">
                                <div className="text-white-50 small fw-bold text-uppercase tracking-wider">Returns (Est.)</div>
                                <h2 className="fw-extrabold text-success mb-0 display-6 mt-1">₹{summary?.profitLoss?.toLocaleString() || 0}</h2>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card glass-card border-0 overflow-hidden position-relative h-100">
                            <div className="card-body p-4 position-relative">
                                <div className="text-white-50 small fw-bold text-uppercase tracking-wider">Pending</div>
                                <h2 className="fw-extrabold text-danger mb-0 display-6 mt-1">₹{summary?.pendingBalance?.toLocaleString() || 0}</h2>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card glass-card border-0 overflow-hidden position-relative h-100" style={{ background: 'var(--grad-blue-vibrant)' }}>
                            <div className="card-body p-4 position-relative text-white">
                                <div className="text-white-50 small fw-bold text-uppercase tracking-wider">Net Worth</div>
                                <h2 className="fw-extrabold mb-0 display-6 mt-1">₹{((summary?.totalPaid || 0) + (summary?.profitLoss || 0)).toLocaleString()}</h2>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Growth Chart & Activity */}
                <div className="row g-4 mb-5">
                    <div className="col-lg-8">
                        <div className="card glass-card border-0 p-4 shadow-2xl h-100">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h5 className="text-white fw-bold mb-0">Wealth Growth</h5>
                                <div className="badge glass-bg-medium text-white-50 px-3 py-2 rounded-pill small">Cumulative</div>
                            </div>
                            <div style={{ height: '300px' }}>
                                <Line data={growthChartData} options={growthChartOptions} />
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-4">
                        <div className="card glass-card border-0 p-4 shadow-2xl h-100">
                            <h5 className="text-white fw-bold mb-4">Strategic Insights</h5>
                            <div className="d-flex flex-column gap-4">
                                <div className="d-flex align-items-start gap-3">
                                    <div className="p-2 rounded-3 bg-success bg-opacity-10 text-success"><i className="bi bi-shield-check"></i></div>
                                    <div>
                                        <div className="text-white small fw-bold">Portfolio Health</div>
                                        <div className="text-white-50 x-small">Your contribution consistency is 98%</div>
                                    </div>
                                </div>
                                <div className="d-flex align-items-start gap-3">
                                    <div className="p-2 rounded-3 bg-info bg-opacity-10 text-info"><i className="bi bi-lightning-charge"></i></div>
                                    <div>
                                        <div className="text-white small fw-bold">Diversification</div>
                                        <div className="text-white-50 x-small">Consider joining a Weekly Fund for faster compounding.</div>
                                    </div>
                                </div>
                                <div className="d-flex align-items-start gap-3">
                                    <div className="p-2 rounded-3 bg-warning bg-opacity-10 text-warning"><i className="bi bi-wallet2"></i></div>
                                    <div>
                                        <div className="text-white small fw-bold">Wallet Advantage</div>
                                        <div className="text-white-50 x-small">Keep balance in wallet for zero-fee instant payments.</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="mb-0 text-white fw-bold">My Portfolio</h4>
                    <button className="btn btn-outline-light btn-sm rounded-pill px-3" onClick={() => window.location.href = '/user/passbook'}>
                        <i className="bi bi-journal-text me-1"></i> Passbook
                    </button>
                </div>

                {/* Invested Funds List */}
                <div className="row g-4 mb-5">
                    {summary?.funds?.length === 0 ? (
                        <div className="col-12"><div className="card glass-card p-5 text-center text-white-50 border-0">You haven't joined any funds yet. Browse available funds below!</div></div>
                    ) : (
                        summary.funds.map((f, idx) => (
                            <div className="col-md-6" key={f.fund_id}>
                                <div className="card glass-card border-0 h-100 p-3 overflow-hidden">
                                    {/* Background Accent Gradient */}
                                    <div className="position-absolute top-0 end-0 w-50 h-50 opacity-10" style={{ background: idx % 2 === 0 ? 'var(--grad-blue-vibrant)' : 'var(--grad-purple-blue)', filter: 'blur(50px)', zIndex: 0 }}></div>

                                    <div className="card-body position-relative">
                                        <div className="d-flex justify-content-between align-items-start mb-4">
                                            <div>
                                                <h4 className="fw-bold mb-1 text-white">{f.name}</h4>
                                                <span className="badge glass-bg-medium text-white text-uppercase px-3 rounded-pill" style={{ fontSize: '0.65rem', letterSpacing: '1px', border: '1px solid rgba(255,255,255,0.1)' }}>{f.payment_schedule}</span>
                                            </div>
                                            <div className="text-end">
                                                <div className="small text-white-50 mb-0">Total Goal</div>
                                                <div className="fw-bold fs-5 text-white">₹{f.total_amount.toLocaleString()}</div>
                                            </div>
                                        </div>

                                        <div className="row align-items-center mb-4">
                                            <div className="col-5">
                                                <div className="position-relative" style={{ height: '140px' }}>
                                                    <Doughnut
                                                        data={{
                                                            labels: ['Paid', 'Pending'],
                                                            datasets: [{
                                                                data: [f.total_paid, f.pending_balance],
                                                                backgroundColor: [idx % 2 === 0 ? '#00E5FF' : '#FF2CDF', 'rgba(255,255,255,0.05)'],
                                                                borderWidth: 0,
                                                                hoverOffset: 4
                                                            }]
                                                        }}
                                                        options={{
                                                            cutout: '80%',
                                                            responsive: true,
                                                            maintainAspectRatio: false,
                                                            plugins: { legend: { display: false } }
                                                        }}
                                                    />
                                                    <div className="position-absolute top-50 start-50 translate-middle text-center" style={{ pointerEvents: 'none' }}>
                                                        <div className="fw-bold fs-4 text-white">{Math.round(f.progress)}%</div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-7">
                                                <div className="mb-3">
                                                    <div className="small text-white-50 mb-1">AMOUUT PAID</div>
                                                    <div className="fw-bold text-white fs-5">₹{f.total_paid.toLocaleString()}</div>
                                                    <div className="progress mt-2" style={{ height: '5px', background: 'rgba(255,255,255,0.05)' }}>
                                                        <div className="progress-bar" style={{ width: `${f.progress}%`, background: idx % 2 === 0 ? 'var(--grad-blue-vibrant)' : 'var(--grad-purple-blue)' }}></div>
                                                    </div>
                                                </div>
                                                <div className="small d-flex justify-content-between">
                                                    <span className="text-white-50">Pending</span>
                                                    <span className="text-danger fw-bold">₹{f.pending_balance.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="d-flex justify-content-between align-items-center pt-3 border-top border-white border-opacity-10">
                                            <div className="small text-white-50">
                                                <i className="bi bi-calendar3 me-1"></i> Next Due: <span className="fw-bold text-white">{f.next_due_date || 'N/A'}</span>
                                            </div>
                                            {f.overdueMonths > 0 ? (
                                                <span className="badge bg-danger rounded-pill px-3 py-2 shadow-sm">Overdue</span>
                                            ) : (
                                                <span className="badge bg-success bg-opacity-20 text-success rounded-pill px-3 py-2" style={{ border: '1px solid rgba(0,255,100,0.2)' }}>On Track</span>
                                            )}
                                        </div>

                                        <div className="mt-4 d-flex gap-2">
                                            {f.currentMonthBalance > 0 && (
                                                <button className="btn btn-primary flex-grow-1 py-2 fw-bold" onClick={() => handleQuickPay(f.fund_id)} style={{ background: idx % 2 === 0 ? 'var(--grad-blue-vibrant)' : 'var(--grad-purple-blue)' }}>
                                                    <i className="bi bi-send-fill me-2"></i> Pay Now
                                                </button>
                                            )}
                                            {f.total_paid > 0 && (
                                                <button className="btn btn-outline-danger flex-grow-1 py-2 fw-bold" onClick={() => handleWithdrawClick(f)} style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                                                    <i className="bi bi-wallet2 me-2"></i> Withdraw
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Available Funds List */}
                <h3 className="mb-4 text-white fw-bold mt-5">Featured Investment Funds</h3>
                <div className="row g-4 mb-5">
                    {availableFunds.length === 0 ? (
                        <div className="col-12"><div className="text-white-50 text-center py-5 glass-bg-low rounded-4 border border-white border-opacity-10">Searching for new market opportunities...</div></div>
                    ) : (
                        availableFunds.map((f, idx) => {
                            const grads = ['var(--grad-cyan-pink)', 'var(--grad-green-blue)', 'var(--grad-orange-red)', 'var(--grad-yellow-pink)', 'var(--grad-purple-blue)'];
                            const selectedGrad = grads[idx % grads.length];

                            return (
                                <div className="col-md-4" key={f.id}>
                                    <div className="card glass-card border-0 h-100 p-1">
                                        <div className="card-body d-flex flex-column h-100 p-4">
                                            <div className="mb-4 p-3 rounded-4" style={{ background: selectedGrad, height: '120px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', position: 'relative', overflow: 'hidden' }}>
                                                {/* Decorative Icon */}
                                                <i className="bi bi-gem position-absolute top-0 end-0 m-3 text-white opacity-25 fs-1"></i>
                                                <div className="text-white-50 small fw-bold text-uppercase" style={{ letterSpacing: '2px' }}>High Growth</div>
                                                <h4 className="text-white fw-bold mb-0">{f.name}</h4>
                                            </div>

                                            <div className="mb-4 mt-2">
                                                <div className="d-flex justify-content-between mb-2">
                                                    <span className="text-white-50">Target Pool</span>
                                                    <span className="text-white fw-bold">₹{Number(f.total_amount).toLocaleString()}</span>
                                                </div>
                                                <div className="d-flex justify-content-between">
                                                    <span className="text-white-50">Min. Monthly</span>
                                                    <span className="text-white fw-bold">₹{(Number(f.total_amount) / 12).toFixed(0).toLocaleString()}*</span>
                                                </div>
                                            </div>

                                            <div className="mt-auto">
                                                <button className="btn btn-outline-light w-100 rounded-pill py-2 fw-bold" style={{ borderWidth: '2px' }} onClick={() => handleJoinClick(f)}>
                                                    View Details
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Floating Action Button */}
                <div className="position-fixed bottom-0 end-0 m-4" style={{ zIndex: 1050 }}>
                    <button className="btn btn-primary btn-lg rounded-circle shadow-2xl p-0 d-flex align-items-center justify-content-center"
                        style={{ width: '64px', height: '64px', background: 'var(--grad-blue-vibrant)', border: 'none' }}
                        onClick={() => { setPreSelectedPayFund(null); setShowPayModal(true); }}>
                        <i className="bi bi-plus-lg fs-2"></i>
                    </button>
                </div>

                {/* Modals */}
                {showJoinModal && selectedFund && (
                    <JoinFundModal
                        fund={selectedFund}
                        onClose={() => setShowJoinModal(false)}
                        onJoinSuccess={() => { fetchDashboard(); }}
                    />
                )}

                {showPayModal && (
                    <PaymentModal
                        funds={summary?.funds || []}
                        preSelectedFundId={preSelectedPayFund}
                        onClose={() => setShowPayModal(false)}
                        onSuccess={() => { fetchDashboard(); }}
                    />
                )}

                {showWithdrawModal && selectedFundForWithdraw && (
                    <WithdrawModal
                        fund={selectedFundForWithdraw}
                        onCancel={() => setShowWithdrawModal(false)}
                        onSuccess={handleWithdrawSuccess}
                    />
                )}

            </div>
        </div>
    );
};

export default UserDashboard;
