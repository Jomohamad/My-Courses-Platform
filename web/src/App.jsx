import React from 'react';
import { BookOpen, Gamepad2, messageCircle, Award, CheckCircle, Smartphone } from 'lucide-react';

function App() {
    return (
        <div className="app">
            {/* Navbar */}
            <nav className="navbar">
                <div className="container flex items-center justify-between">
                    <div className="logo flex items-center gap-4">
                        <div style={{ width: 40, height: 40, background: 'var(--primary)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <BookOpen color="white" size={24} />
                        </div>
                        <h1 className="font-bold" style={{ fontSize: '1.5rem' }}>منصتي</h1>
                    </div>
                    <div className="links flex gap-8" style={{ display: 'none', md: 'flex' }}>
                        <a href="#features">المميزات</a>
                        <a href="#courses">الدورات</a>
                        <a href="#about">عن المنصة</a>
                    </div>
                    <button className="btn btn-primary">ابدأ التعلم الآن</button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-bg"></div>
                <div className="container flex flex-col items-center text-center">
                    <span className="text-accent font-bold" style={{ marginBottom: 16, display: 'block' }}>منصة تعليمية تفاعلية</span>
                    <h1 style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1.2, marginBottom: 24 }}>
                        تعلم بذكاء مع <span className="gradient-text">منصتي</span>
                    </h1>
                    <p className="text-secondary" style={{ fontSize: '1.25rem', maxWidth: 600, marginBottom: 40 }}>
                        تجربة تعليمية فريدة تجمع بين الدروس التفاعلية، الألعاب التعليمية، والاختبارات الممتعة. اكتشف متعة التعلم اليوم!
                    </p>
                    <div className="flex gap-4">
                        <button className="btn btn-primary">
                            <Smartphone size={20} />
                            حمل التطبيق
                        </button>
                        <button className="btn btn-outline">استكشف الدورات</button>
                    </div>

                    <div style={{ marginTop: 60, width: '100%', maxWidth: 900, borderRadius: 20, overflow: 'hidden', border: '1px solid var(--border)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
                        {/* Placeholder for App Screenshot or Hero Image */}
                        <div style={{ aspectRatio: '16/9', background: 'linear-gradient(135deg, var(--background-light), var(--card))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <p className="text-secondary">صورة توضيحية للتطبيق</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" style={{ padding: '80px 0' }}>
                <div className="container">
                    <div className="text-center" style={{ marginBottom: 60 }}>
                        <h2 style={{ fontSize: '2.5rem', marginBottom: 16 }}>لماذا تختار منصتي؟</h2>
                        <p className="text-secondary">نقدم لك أفضل الأدوات التعليمية لضمان تفوقك</p>
                    </div>

                    <div className="features-grid">
                        <FeatureCard
                            icon={<BookOpen size={32} color="var(--primary)" />}
                            title="دروس تفاعلية"
                            description="تعلم من خلال محادثات شيقة وفيديوهات تعليمية ممتعة تجعل المعلومة تثبت في ذهنك."
                        />
                        <FeatureCard
                            icon={<Gamepad2 size={32} color="var(--accent)" />}
                            title="تعلم باللعب"
                            description="مجموعة من الألعاب التعليمية مثل ترتيب الكلمات والذاكرة لكسر الملل وزيادة التركيز."
                        />
                        <FeatureCard
                            icon={<Award size={32} color="var(--success)" />}
                            title="اختبارات وتقييم"
                            description="اختبر مستواك بعد كل درس واحصل على نتائج فورية لتعرف نقاط قوتك وضعفك."
                        />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ borderTop: '1px solid var(--border)', padding: '40px 0', marginTop: 80, background: 'var(--background-light)' }}>
                <div className="container text-center">
                    <p className="text-secondary">© 2026 منصتي التعليمية. جميع الحقوق محفوظة.</p>
                </div>
            </footer>
        </div>
    )
}

function FeatureCard({ icon, title, description }) {
    return (
        <div className="card">
            <div style={{ background: 'rgba(255,255,255,0.05)', width: 60, height: 60, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                {icon}
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: 12 }}>{title}</h3>
            <p className="text-secondary">{description}</p>
        </div>
    )
}

export default App
