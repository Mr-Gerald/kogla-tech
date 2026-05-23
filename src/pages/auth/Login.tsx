import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

export default function Login() {
    return (
        <div className="pt-32 px-6 pb-20 max-w-sm mx-auto">
            <h1 className="text-3xl font-display font-bold mb-8 text-center text-gold-500">Log In</h1>
            <form className="space-y-4">
                <input type="email" placeholder="Business Email" className="w-full p-3 bg-black border border-gray-800 text-sm" />
                <input type="password" placeholder="Password" className="w-full p-3 bg-black border border-gray-800 text-sm" />
                <button className="w-full py-3 bg-gold-500 text-black font-semibold text-sm">Continue</button>
            </form>
            <div className="mt-4 text-xs text-center space-y-2">
                <Link to="/auth/forgot-password" className="text-gray-400 hover:text-white">Forgot password?</Link>
                <div className="text-gray-600">Don't have an account? <Link to="/auth/signup" className="text-gold-500">Sign Up</Link></div>
            </div>
        </div>
    );
}
