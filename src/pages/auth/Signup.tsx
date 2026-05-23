import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

export default function Signup() {
    return (
        <div className="pt-32 px-6 pb-20 max-w-sm mx-auto">
            <h1 className="text-3xl font-display font-bold mb-8 text-center text-gold-500">Join Kogla Tech</h1>
            <form className="space-y-4">
                <input type="text" placeholder="Full Name" className="w-full p-3 bg-black border border-gray-800 text-sm" />
                <input type="email" placeholder="Business Email" className="w-full p-3 bg-black border border-gray-800 text-sm" />
                <input type="password" placeholder="Password" className="w-full p-3 bg-black border border-gray-800 text-sm" />
                <button className="w-full py-3 bg-gold-500 text-black font-semibold text-sm">Create Account</button>
            </form>
            <div className="mt-4 text-xs text-center text-gray-600">Already have an account? <Link to="/auth/login" className="text-gold-500">Log In</Link></div>
        </div>
    );
}
