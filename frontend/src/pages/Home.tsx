
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useAuthStore } from "@/store/useAuthStore"
import { useAppStore } from "@/store/useAppStore"
import { motion } from "framer-motion"
import { ArrowRight, Book, Moon, Sun, Server, Shield, CreditCard, Layers } from "lucide-react"

export default function Home() {
    const { isAuthenticated, user } = useAuthStore()
    const { publicSettings, fetchPublicSettings, publicSettingsLoaded } = useAppStore()
    const [isDark, setIsDark] = useState(false)

    useEffect(() => {
        if (!publicSettingsLoaded) {
            fetchPublicSettings()
        }

        // Theme initialization
        const isDarkMode = document.documentElement.classList.contains('dark')
        setIsDark(isDarkMode)
    }, [])

    const toggleTheme = () => {
        const newTheme = !isDark
        setIsDark(newTheme)
        document.documentElement.classList.toggle('dark', newTheme)
        localStorage.setItem('theme', newTheme ? 'dark' : 'light')
    }

    const {
        site_name = 'Sub2API',
        site_subtitle = 'AI API Gateway & Subscription Manager',
        site_logo,
        doc_url
    } = publicSettings || {}

    // Features data
    const features = [
        {
            title: "Unified Gateway",
            desc: "One API standard (OpenAI-compatible) to access Claude, GPT, Gemini and more.",
            icon: Server,
            color: "text-blue-500",
            bg: "bg-blue-100 dark:bg-blue-900/30",
            gradient: "from-blue-500 to-blue-600"
        },
        {
            title: "Account Pool",
            desc: "Intelligent load balancing across multiple upstream accounts for high availability.",
            icon: Layers,
            color: "text-emerald-500",
            bg: "bg-emerald-100 dark:bg-emerald-900/30",
            gradient: "from-emerald-500 to-emerald-600"
        },
        {
            title: "Balance & Quota",
            desc: "Real-time billing, rigorous quota management, and transparent usage tracking.",
            icon: CreditCard,
            color: "text-purple-500",
            bg: "bg-purple-100 dark:bg-purple-900/30",
            gradient: "from-purple-500 to-purple-600"
        }
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-foreground transition-colors duration-300">
            {/* Background Decorations */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-primary/20 blur-3xl opacity-50"></div>
                <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-blue-500/15 blur-3xl opacity-50"></div>
            </div>

            {/* Header */}
            <header className="fixed w-full top-0 z-50 backdrop-blur-md border-b border-border/40 bg-background/60">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between max-w-7xl">
                    <div className="flex items-center gap-2">
                        {site_logo ? (
                            <img src={site_logo} alt="Logo" className="h-8 w-8 rounded-lg object-contain" />
                        ) : (
                            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
                                S
                            </div>
                        )}
                        <span className="font-bold text-xl tracking-tight">{site_name}</span>
                    </div>

                    <div className="flex items-center gap-4">
                        {doc_url && (
                            <a href={doc_url} target="_blank" rel="noreferrer" className="p-2 rounded-full hover:bg-muted transition-colors">
                                <Book className="h-5 w-5 text-muted-foreground" />
                            </a>
                        )}
                        <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-muted transition-colors">
                            {isDark ? <Sun className="h-5 w-5 text-muted-foreground" /> : <Moon className="h-5 w-5 text-muted-foreground" />}
                        </button>

                        {isAuthenticated ? (
                            <Link to="/dashboard" className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium">
                                Dashboard <ArrowRight className="h-4 w-4" />
                            </Link>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link to="/login" className="px-4 py-2 rounded-full hover:bg-muted transition-colors text-sm font-medium">
                                    Login
                                </Link>
                                <Link to="/register" className="hidden md:block px-4 py-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium">
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="pt-32 pb-20 px-6">
                <div className="container mx-auto max-w-6xl">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        {/* Text Content */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="flex-1 text-center lg:text-left space-y-6"
                        >
                            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 pb-2">
                                {site_name}
                            </h1>
                            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto lg:mx-0">
                                {site_subtitle}
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                                <Link to={isAuthenticated ? "/dashboard" : "/register"} className="px-8 py-3 rounded-full bg-primary text-primary-foreground font-semibold hover:shadow-lg hover:shadow-primary/20 transition-all flex items-center gap-2">
                                    {isAuthenticated ? "Go to Dashboard" : "Start Building"}
                                    <ArrowRight className="h-5 w-5" />
                                </Link>
                                {!isAuthenticated && <Link to="/login" className="text-muted-foreground hover:text-foreground font-medium underline-offset-4 hover:underline">
                                    Existing account? Log in
                                </Link>}
                            </div>
                        </motion.div>

                        {/* Terminal Animation */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="flex-1 w-full max-w-lg"
                        >
                            <div className="relative rounded-xl overflow-hidden bg-[#1e293b] shadow-2xl border border-gray-700 font-mono text-sm leading-6">
                                {/* Terminal Header */}
                                <div className="bg-slate-800/80 px-4 py-2 border-b border-gray-700 flex items-center gap-2">
                                    <div className="flex gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    </div>
                                    <div className="ml-4 text-xs text-gray-400">bash</div>
                                </div>

                                {/* Terminal Body */}
                                <div className="p-6 h-[240px] text-gray-300 space-y-2">
                                    <TypewriterLine delay={0.5}>
                                        <span className="text-green-400 font-bold">$</span> curl -X POST /v1/chat/completions \
                                    </TypewriterLine>
                                    <TypewriterLine delay={1.5}>
                                        &nbsp;&nbsp;-H <span className="text-orange-300">"Authorization: Bearer sk-..."</span> \
                                    </TypewriterLine>
                                    <TypewriterLine delay={2.5}>
                                        &nbsp;&nbsp;-d <span className="text-blue-300">'{`{"model": "gpt-4", "messages": [...]}`}'</span>
                                    </TypewriterLine>
                                    <TypewriterLine delay={3.5}>
                                        <span className="text-gray-500 italic"># Routing to optimized upstream...</span>
                                    </TypewriterLine>
                                    <TypewriterLine delay={4.5}>
                                        <span className="text-green-400">{`{ "role": "assistant", "content": "Hello!" }`}</span>
                                    </TypewriterLine>
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 5.5 }}
                                    >
                                        <span className="text-green-400 font-bold">$</span> <span className="animate-pulse inline-block w-2 h-4 bg-green-400 align-middle"></span>
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Features Grid */}
                    <div className="mt-32 grid md:grid-cols-3 gap-8">
                        {features.map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="group p-6 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-transparent hover:border-border transition-all hover:shadow-xl hover:shadow-primary/5"
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br ${feature.gradient} shadow-lg shadow-primary/20`}>
                                    <feature.icon className="h-6 w-6 text-white" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                                <p className="text-muted-foreground">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Providers */}
                    <div className="mt-24 text-center">
                        <h2 className="text-2xl font-bold mb-8">Supported Providers</h2>
                        <div className="flex flex-wrap justify-center gap-4">
                            {['OpenAI', 'Anthropic', 'Google Gemini', 'Mistral', 'Groq'].map((p, i) => (
                                <span key={i} className="px-5 py-2 rounded-full border bg-background/50 text-sm font-medium">
                                    {p}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-border/50 py-8 bg-muted/20">
                <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} {site_name}. All rights reserved.</p>
                </div>
            </footer>
        </div>
    )
}

function TypewriterLine({ children, delay }: { children: React.ReactNode, delay: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.3 }}
            className="break-all"
        >
            {children}
        </motion.div>
    )
}
