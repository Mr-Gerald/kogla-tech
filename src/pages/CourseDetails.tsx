import { useParams, useNavigate } from 'react-router-dom';
import { BookOpen, ArrowLeft } from 'lucide-react';

export default function CourseDetails() {
    const { slug } = useParams();
    const navigate = useNavigate();
    return (
        <div className="pt-32 px-6 pb-20 max-w-4xl mx-auto">
            <button onClick={() => navigate(-1)} className="flex items-center text-gray-400 hover:text-gold-500 mb-8 text-sm">
                <ArrowLeft size={16} className="mr-2" /> Back
            </button>
            <BookOpen className="text-gold-500 mb-6" size={48} />
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-6 capitalize">{slug?.replace(/-/g, ' ')}</h1>
            <p className="text-gray-400 mb-8">This is our elite {slug?.replace(/-/g, ' ')} program designed to accelerate your career and deliver tangible results.</p>
            <button className="px-10 py-4 bg-gold-500 text-black font-semibold text-sm">Enroll In Program</button>
        </div>
    );
}
