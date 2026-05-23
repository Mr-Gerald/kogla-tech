import { useParams, useNavigate } from 'react-router-dom';
import { Zap, ArrowLeft } from 'lucide-react';

export default function ServiceWorkflow() {
    const { slug } = useParams();
    const navigate = useNavigate();
    return (
        <div className="pt-32 px-6 pb-20 max-w-3xl mx-auto">
            <button onClick={() => navigate(-1)} className="flex items-center text-gray-400 hover:text-gold-500 mb-8 text-sm">
                <ArrowLeft size={16} className="mr-2" /> Back
            </button>
            <Zap className="text-gold-500 mb-6" size={48} />
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-6 capitalize">{slug?.replace(/-/g, ' ')}</h1>
            <p className="text-gray-400 mb-8">Tell us about your needs for {slug?.replace(/-/g, ' ')} so we can tailor a solution specifically for your business.</p>
            <form className="space-y-4">
                <textarea placeholder="Describe your project, objectives, and timeline..." className="w-full p-4 bg-black border border-gray-800 text-sm h-40" />
                <button className="px-10 py-4 bg-gold-500 text-black font-semibold text-sm">Submit Project Inquiry</button>
            </form>
        </div>
    );
}
