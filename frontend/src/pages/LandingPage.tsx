import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, UploadCloud, ShieldAlert, Sparkles, MessageSquare, 
  FileText, Activity, ShieldCheck, Zap, ArrowRight, Star, 
  HelpCircle, ChevronDown, Mail, Phone, MapPin
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const stats = [
    { value: '98.4%', label: 'Inference Accuracy' },
    { value: '< 3 sec', label: 'Processing Speed' },
    { value: '25,000+', label: 'Scans Evaluated' },
    { value: '99.9%', label: 'SaaS Uptime' },
  ];

  const features = [
    {
      icon: Activity,
      title: 'Multimodal Image Support',
      desc: 'Process standard digital uploads for ECG traces, cardiac MRIs, computed tomography (CT) coronary scans, and chest X-rays.',
    },
    {
      icon: Sparkles,
      title: 'ViT Neural Classifier',
      desc: 'Engineered with Google Vision Transformer models (vit-base-patch16-224) to isolate micro-structural cardiac anomalies.',
    },
    {
      icon: MessageSquare,
      title: 'BioGPT Medical Assistant',
      desc: 'A clinical language model assistant (microsoft/BioGPT) to explain diagnostic details and suggest preventative heart health steps.',
    },
    {
      icon: FileText,
      title: 'Instant PDF Reports',
      desc: 'Generate, print, and download professional-grade health assessments showing risk indicators, data visualizers, and advice.',
    },
    {
      icon: ShieldCheck,
      title: 'HIPAA-Aligned Privacy',
      desc: 'Military-grade password hashing, secure JWT-based tokens, file validation bounds, and strict row-level record protection.',
    },
    {
      icon: Zap,
      title: 'Diagnostic Insights',
      desc: 'Receive immediate classification risk thresholds (High, Medium, Low) and comprehensive summaries within seconds of submission.',
    },
  ];

  const steps = [
    { num: '01', title: 'Register Account', desc: 'Create your private clinical account in seconds with secure email login.' },
    { num: '02', title: 'Upload Scan', desc: 'Drag and drop your ECG, MRI, CT, or X-Ray image (PNG, JPG) onto the secure portal.' },
    { num: '03', title: 'AI Diagnostics', desc: 'Our ViT image model runs a diagnostic pass to classify structural cardiovascular anomalies.' },
    { num: '04', title: 'Consult Assistant', desc: 'Review the PDF report and discuss the diagnostic findings with the BioGPT assistant.' },
  ];

  return (
    <div className="min-h-screen bg-[#090D1A] text-slate-100 overflow-x-hidden relative">
      
      {/* Background Glow Blobs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none pulse-glow-blue"></div>
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none"></div>
      
      {/* Header / Navbar */}
      <nav className="border-b border-slate-800/80 px-6 py-5 sticky top-0 bg-[#090D1A]/85 backdrop-blur-md z-30">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-red-500 fill-red-500 animate-pulse" />
            <span className="font-display font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
              HeartSense AI
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link 
              to="/register" 
              className="text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-300"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 pt-20 pb-24 md:pt-32 md:pb-36 max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400 mb-8 animate-fade-in">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Intelligent Deep Learning Cardiac Screening</span>
        </div>
        
        <h1 className="font-display font-extrabold text-4xl md:text-6xl tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400 max-w-4xl mx-auto">
          AI-Powered Heart Disease Detection Platform
        </h1>
        
        <p className="mt-6 text-base md:text-xl text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed">
          Upload medical images and receive intelligent AI-powered analysis within seconds. Screen for infarctions, cardiomegaly, arrhythmias, and arterial blocks.
        </p>
        
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            to="/register" 
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-8 py-4 rounded-xl text-base font-semibold shadow-xl shadow-blue-500/20 transition-all duration-300 hover:-translate-y-0.5"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link 
            to="/login" 
            className="w-full sm:w-auto flex items-center justify-center bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60 px-8 py-4 rounded-xl text-base font-semibold transition-all duration-300"
          >
            Live Demo
          </Link>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="px-6 py-12 border-y border-slate-800/60 bg-slate-900/30 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, idx) => (
            <div key={idx} className="text-center">
              <p className="font-display font-extrabold text-3xl md:text-5xl text-blue-400">{s.value}</p>
              <p className="mt-2 text-xs md:text-sm font-semibold text-slate-500 tracking-wide uppercase">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 py-24 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display font-bold text-3xl md:text-4xl">Comprehensive AI Features</h2>
          <p className="mt-3 text-slate-400 max-w-lg mx-auto text-sm md:text-base">
            Engineered with deep learning algorithms to aid in clinical screening, medical explanation, and risk assessment.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f, idx) => {
            const Icon = f.icon;
            return (
              <div key={idx} className="glass-panel p-6 rounded-2xl border border-slate-800/80 hover:border-slate-700/60 transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-6">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-lg text-white">{f.title}</h3>
                <p className="mt-3 text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="px-6 py-20 border-t border-slate-900 bg-slate-900/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display font-bold text-3xl md:text-4xl">System Workflow</h2>
            <p className="mt-3 text-slate-400 max-w-md mx-auto text-sm">
              Our end-to-end pipeline operates efficiently to provide high-quality heart disease diagnostic metrics.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {steps.map((st, idx) => (
              <div key={idx} className="relative glass-panel p-6 rounded-2xl border border-slate-850">
                <div className="font-display font-black text-3xl text-blue-500/20 absolute top-4 right-6">{st.num}</div>
                <h3 className="font-semibold text-lg text-white mt-4">{st.title}</h3>
                <p className="mt-3 text-slate-400 text-sm leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-6 py-24 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display font-bold text-3xl md:text-4xl">Clinical Endorsements</h2>
          <p className="mt-3 text-slate-400 max-w-md mx-auto text-sm">
            Read how HeartSense AI can augment clinical workflows and support preventative cardiovascular monitoring.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="glass-panel p-8 rounded-2xl border border-slate-800">
            <div className="flex gap-1 text-amber-400 mb-6">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400" />)}
            </div>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed italic">
              "HeartSense AI is an impressive screening companion. The speed with which the Vision Transformer scans local abnormalities in ECGs is exceptional. It helps filter patients needing emergency priority."
            </p>
            <div className="flex items-center gap-3.5 mt-6 border-t border-slate-800 pt-5">
              <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-300 text-xs">
                Dr
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Dr. Aris Thorne, MD</p>
                <p className="text-xs text-slate-500">Board Certified Cardiologist</p>
              </div>
            </div>
          </div>
          
          <div className="glass-panel p-8 rounded-2xl border border-slate-800">
            <div className="flex gap-1 text-amber-400 mb-6">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400" />)}
            </div>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed italic">
              "The integration of the BioGPT assistant alongside the classification report is very smart. It helps patients understand complex clinical jargon in a supportive manner without bypassing doctors."
            </p>
            <div className="flex items-center gap-3.5 mt-6 border-t border-slate-800 pt-5">
              <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-300 text-xs">
                Dr
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Dr. Elena Rostova, PhD</p>
                <p className="text-xs text-slate-500">Clinical AI Researcher</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-6 py-20 bg-slate-900/20 border-t border-slate-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display font-bold text-3xl md:text-4xl">Frequently Asked Questions</h2>
          </div>
          
          <div className="space-y-4">
            <div className="glass-panel p-6 rounded-2xl border border-slate-800">
              <h3 className="font-semibold text-base md:text-lg text-white flex items-center gap-3">
                <HelpCircle className="w-4 h-4 text-blue-400" />
                How does the AI heart disease classification work?
              </h3>
              <p className="mt-3 text-slate-400 text-xs md:text-sm leading-relaxed pl-7">
                Our application implements Google's Vision Transformer (ViT) model. When you upload a chest X-Ray, CT coronary angiogram, MRI scan, or ECG trace, the model tokenizes the image and processes structural coordinates. It generates probability values mapped to diagnostic findings like myocardial infarction, arrhythmia, and cardiomegaly.
              </p>
            </div>
            
            <div className="glass-panel p-6 rounded-2xl border border-slate-800">
              <h3 className="font-semibold text-base md:text-lg text-white flex items-center gap-3">
                <HelpCircle className="w-4 h-4 text-blue-400" />
                Is the medical advice from BioGPT binding?
              </h3>
              <p className="mt-3 text-slate-400 text-xs md:text-sm leading-relaxed pl-7">
                No. The BioGPT chatbot utilizes Hugging Face language pipelines trained on biomedical documents to discuss precautions and describe symptoms. All generated information is strictly educational. It DOES NOT replace a professional diagnosis or cardiological consultation.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-slate-800">
              <h3 className="font-semibold text-base md:text-lg text-white flex items-center gap-3">
                <HelpCircle className="w-4 h-4 text-blue-400" />
                Is my health data protected?
              </h3>
              <p className="mt-3 text-slate-400 text-xs md:text-sm leading-relaxed pl-7">
                Yes. HeartSense AI implements robust security layers: secure password hashing (Bcrypt), JWT-based session security, local file sanitization, and strict database isolation so that user uploads are only visible to the respective account.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="px-6 py-24 max-w-4xl mx-auto">
        <div className="glass-panel p-8 md:p-12 rounded-3xl border border-slate-800/80 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-blue-500/10 rounded-full blur-[80px]"></div>
          
          <h2 className="font-display font-bold text-2xl md:text-3xl text-center">Get in Touch</h2>
          <p className="mt-3 text-slate-400 text-center text-sm max-w-sm mx-auto">
            Have questions about clinical licensing or research access? Send us a message.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 mt-10 text-center">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-3">
                <Mail className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-white uppercase tracking-wider">Email Us</p>
              <p className="text-sm text-slate-400 mt-1">support@heartsenseai.com</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-3">
                <Phone className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-white uppercase tracking-wider">Call Us</p>
              <p className="text-sm text-slate-400 mt-1">+1 (555) 321-4321</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-3">
                <MapPin className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-white uppercase tracking-wider">Visit Us</p>
              <p className="text-sm text-slate-400 mt-1">San Francisco, CA</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 px-6 py-10 bg-[#060A14] text-slate-500 text-xs">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500/60 fill-red-500/20" />
            <span className="font-display font-bold text-slate-400">HeartSense AI</span>
            <span>© 2026 HeartSense AI, Inc. All rights reserved.</span>
          </div>
          
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-300">Privacy Policy</a>
            <a href="#" className="hover:text-slate-300">Terms of Service</a>
            <a href="#" className="hover:text-slate-300">HIPAA Compliance</a>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
