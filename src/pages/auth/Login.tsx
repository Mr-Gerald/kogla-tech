import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
    const navigate = useNavigate();
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');

        if (!identifier || !password) {
            setErrorMsg('All fields are required.');
            return;
        }

        // Admin gateway bypass verification
        if (identifier.toUpperCase() === 'ADMIN' && password === 'ADMIN77') {
            sessionStorage.setItem('kogla_admin_auth', 'true');
            setSuccessMsg('Administrative verification successful! Redirecting...');
            setTimeout(() => {
                navigate('/admin');
            }, 1000);
            return;
        }

        // Generic mock login behavior for demo users
        setErrorMsg('Invalid email or password. Please try again.');
    };

    return (
        <div className="pt-32 px-6 pb-20 max-w-sm mx-auto text-gray-100">
            <h1 className="text-3xl font-display font-bold mb-6 text-center text-gold-500">Log In</h1>
            
            <p className="text-xs text-gray-400 text-center mb-6 leading-relaxed">
                Enter your credentials to access your accounts.
            </p>

            {errorMsg && (
                <div className="p-3 bg-red-950/40 border border-red-500/20 text-red-400 text-xs text-center rounded-sm mb-4">
                    {errorMsg}
                </div>
            )}

            {successMsg && (
                <div className="p-3 bg-green-950/40 border border-green-500/20 text-green-400 text-xs text-center rounded-sm mb-4">
                    {successMsg}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-[10px] text-gray-400 uppercase tracking-widest mb-1">
                        Username or Email
                    </label>
                    <input 
                        type="text" 
                        required
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="corporate@company.com" 
                        className="w-full p-3 bg-black border border-gray-800 focus:border-gold-500 focus:outline-none text-sm text-white" 
                    />
                </div>

                <div>
                    <label className="block text-[10px] text-gray-400 uppercase tracking-widest mb-1">
                        Password
                    </label>
                    <input 
                        type="password" 
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password" 
                        className="w-full p-3 bg-black border border-gray-800 focus:border-gold-500 focus:outline-none text-sm text-white" 
                    />
                </div>

                <button 
                    type="submit" 
                    className="w-full py-3 bg-gold-500 hover:bg-gold-600 active:scale-[0.98] transition-all text-black font-semibold text-sm uppercase tracking-wider font-display"
                >
                    Continue
                </button>
            </form>

            <div className="mt-6 text-xs text-center space-y-2">
                <Link to="/auth/forgot-password" className="text-gray-400 hover:text-white block">Forgot password?</Link>
                <div className="text-gray-600">
                    Don't have an account? <Link to="/auth/signup" className="text-gold-500 hover:underline">Sign Up</Link>
                </div>
            </div>
        </div>
    );
}

