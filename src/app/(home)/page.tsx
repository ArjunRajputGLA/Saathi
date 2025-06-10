'use client';

import { useEffect, useState } from 'react';
import { Rocket, Brain, Sparkles, BookOpen, FileText, Bot, Map, Users, Github, Linkedin, Mail, Star, Zap, Target, Heart } from 'lucide-react';

export default function AboutPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % 6);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: FileText,
      title: "Document Analysis",
      description: "Advanced document processing with key insights extraction, summary generation, and interactive chat capabilities",
      color: "from-blue-500 to-purple-600"
    },
    {
      icon: BookOpen,
      title: "Smart Quiz Generation", 
      description: "Automatic creation of intelligent quizzes from PDFs, URLs, or custom topics with instant feedback",
      color: "from-green-500 to-emerald-600"
    },
    {
      icon: Map,
      title: "Learning Roadmaps",
      description: "Personalized learning paths for any domain with difficulty-based progression",
      color: "from-orange-500 to-red-600"
    },
    {
      icon: Bot,
      title: "AI Chat Assistant",
      description: "Context-aware chatbot that helps users understand documents and concepts better",
      color: "from-cyan-500 to-blue-600"
    },
    {
      icon: BookOpen,
      title: "Shared Notes Bucket",
      description: "Collaborative space for sharing and organizing study materials and notes with fellow learners",
      color: "from-pink-500 to-rose-600"
    },
    {
      icon: Map,
      title: "KanBan Board",
      description: "Visual task management system to track learning progress and organize study goals efficiently",
      color: "from-indigo-500 to-violet-600"
    }
  ];

  const teamMembers = [
    {
      name: "Arjun Singh Rajput",
      role: "AI Engineer & Team Lead",
      avatar: "AR",
      image: "/images/team/arjun singh rajput.jpg",
      color: "from-purple-500 to-pink-500",
      social: { github: "https://github.com/ArjunRajputGLA", linkedin: "https://www.linkedin.com/in/imstorm23203attherategmail/", email: "imstorm23203@gmail.com" }
    },
    {
      name: "Bal Krishna Goswami",
      role: "Frontend Developer",
      avatar: "BK",
      image: "/images/team/bal krishna goswami.jpg",
      color: "from-blue-500 to-cyan-500",
      social: { github: "https://github.com/THEBKGOSWAMI08", linkedin: "https://www.linkedin.com/in/balkrishna-goswami-947448190/", email: "goswami.bk555@gmail.com" }
    },
    {
      name: "Ichcha Mehrishi",
      role: "Backend Engineer",
      avatar: "IM",
      image: "/images/team/ichcha mehrishi.jpg",
      color: "from-green-500 to-emerald-500", 
      social: { github: "https://github.com/ichcha03", linkedin: "https://www.linkedin.com/in/ichcha-mehrishi-344478289/", email: "ichchamehrishi@gmail.com" }
    },
    {
      name: "Parth Garg",
      role: "UX Designer",
      avatar: "PG",
      image: "/images/team/parth garg.jpg",
      color: "from-yellow-500 to-orange-500",
      social: { github: "https://github.com/Parthgarg27", linkedin: "https://www.linkedin.com/in/parth-garg-336695289", email: "parth83556@gmail.com" }
    }
  ];

  const techStack = [
    { name: "Next.js 13+", category: "Frontend", icon: "⚛️" },
    { name: "Google Gemini AI", category: "AI/ML", icon: "🤖" },
    { name: "TypeScript", category: "Language", icon: "📝" },
    { name: "Tailwind CSS", category: "Styling", icon: "🎨" },
    { name: "PDF.js", category: "Document Processing", icon: "📄" },
    { name: "React", category: "Frontend", icon: "⚛️" },
    { name: "Node.js", category: "Backend", icon: "🟢" },
    { name: "RESTful APIs", category: "Architecture", icon: "🔗" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-cyan-900">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-emerald-400 to-green-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative z-10 space-y-16 p-6 md:p-8 xl:p-10">
        {/* Hero Section */}
        <div className={`text-center space-y-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="relative">
            <h1 className="text-7xl md:text-8xl font-black bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-500 bg-clip-text text-transparent animate-pulse">
              Project Saathi
            </h1>
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-bounce"></div>
            <div className="absolute -bottom-2 -left-6 w-6 h-6 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full animate-bounce animation-delay-1000"></div>
          </div>
          
          <div className="space-y-4">
            <p className="text-2xl md:text-3xl font-light text-gray-700 dark:text-gray-300">
              Your AI-Powered Learning Companion
            </p>
            <div className="flex justify-center items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <Zap className="w-4 h-4 text-yellow-500 animate-pulse" />
              <span>Powered by Advanced AI</span>
              <Heart className="w-4 h-4 text-red-500 animate-pulse" />
              <span>Built with ❤️ in India</span>
            </div>
          </div>
        </div>

        {/* Vision Section */}
        <div className={`transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="relative bg-gradient-to-br from-emerald-50 via-cyan-50 to-purple-50 dark:from-emerald-900/20 dark:via-cyan-900/20 dark:to-purple-900/20 p-10 rounded-3xl border border-emerald-100 dark:border-emerald-800 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-400/20 to-purple-400/20 rounded-full blur-2xl"></div>
            <div className="relative">
              <div className="flex items-center space-x-3 mb-6">
                <Target className="w-8 h-8 text-emerald-500" />
                <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
                  Our Vision
                </h2>
              </div>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                An AI-based tutor, Saathi, is designed to assist self-learners in achieving their goals by generating personalized roadmaps, notes, quizzes, and more. It utilizes the Gemini API to power dynamic content creation, ensuring tailored study plans and interactive learning experiences.
                <br /><br />
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  Saathi aims to revolutionize the way individuals approach self-education, making learning more accessible, efficient, and engaging.
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className={`transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Core Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, idx) => (
              <div 
                key={idx}
                className={`relative group cursor-pointer transition-all duration-500 ${
                  activeFeature === idx 
                    ? 'scale-105 shadow-2xl' 
                    : 'hover:scale-102 hover:shadow-xl'
                }`}
                onMouseEnter={() => setActiveFeature(idx)}
              >
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 h-full relative overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                  <div className="relative">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 transform transition-transform group-hover:rotate-6`}>
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                  <div className={`absolute -bottom-2 -right-2 w-24 h-24 bg-gradient-to-br ${feature.color} rounded-full opacity-10 transform transition-transform group-hover:scale-150`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <div className={`transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 p-10 rounded-3xl border border-gray-200 dark:border-gray-700">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              Technology Stack
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {techStack.map((tech, idx) => (
                <div 
                  key={idx}
                  className="group bg-white dark:bg-gray-700 p-6 rounded-xl text-center transform transition-all duration-300 hover:-translate-y-2 hover:shadow-lg cursor-pointer"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="text-3xl mb-3 group-hover:scale-125 transition-transform duration-300">
                    {tech.icon}
                  </div>
                  <div className="text-emerald-500 text-sm mb-2 font-medium">{tech.category}</div>
                  <div className="font-semibold text-gray-900 dark:text-white">{tech.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Enhanced Team Section */}
        <div className={`transition-all duration-1000 delay-900 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-10 rounded-3xl border border-purple-100 dark:border-purple-800">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-12 text-center">
              Meet Our Team
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member, idx) => (
                <div 
                  key={idx}
                  className="group text-center space-y-6 transform transition-all duration-500 hover:scale-105"
                  style={{ animationDelay: `${idx * 200}ms` }}
                >
                  <div className="relative">
                    <div className={`w-32 h-32 bg-gradient-to-br ${member.color} rounded-full mx-auto overflow-hidden relative group-hover:shadow-2xl transition-all duration-300`}>
                      {member.image ? (
                        <img
                          src={member.image}
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-3xl font-bold text-white">
                            {member.avatar}
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-full"></div>
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-400 rounded-full border-4 border-white dark:border-gray-800 flex items-center justify-center">
                      <div className="w-3 h-3 bg-green-600 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {member.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                      {member.role}
                    </p>
                  </div>

                  <div className="flex justify-center space-x-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <a 
                      href={member.social.github} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-colors"
                    >
                      <Github className="w-4 h-4" />
                    </a>
                    <a 
                      href={member.social.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                    <a 
                      href={`mailto:${member.social.email}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className={`transition-all duration-1000 delay-1300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 p-10 rounded-3xl text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black opacity-10"></div>
            <div className="relative">
              <h2 className="text-3xl font-bold mb-4">Ready to Start Learning?</h2>
              <p className="text-xl opacity-90 mb-8">Join thousands of learners who trust Saathi for their educational journey</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`text-center pt-8 border-t border-gray-200 dark:border-gray-700 transition-all duration-1000 delay-1500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center space-x-3 text-gray-600 dark:text-gray-400">
            <span className="text-3xl animate-pulse">™</span>
            <div>
              <p className="font-medium">
                Team Saathi {new Date().getFullYear()} | Empowering Learning Through AI
              </p>
              <p className="text-sm opacity-75">
                Made with ❤️ in India • Building the future of education
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}