import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
    return (
        <div className="pt-32 px-6 pb-20 max-w-sm mx-auto">
            <h1 className="text-3xl font-display font-bold mb-8 text-center text-gold-500">Recover Account</h1>
            <form className="space-y-4">
                <input type="email" placeholder="Enter your business email" className="w-full p-3 bg-black border border-gray-800 text-sm" />
                <button className="w-full py-3 bg-gold-500 text-black font-semibold text-sm">Send Reset Link</button>
            </form>
            <div className="mt-4 text-xs text-center text-gray-600"><Link to="/auth/login" className="text-gold-500">Back to Login</Link></div>
        </div>
    );
}
