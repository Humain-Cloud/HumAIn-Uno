'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Github, Star, Users, GitBranch, MessageCircle, Mail, Check, Twitter } from 'lucide-react'
import { AnimatedCounter } from './animated-counter'
import { useToast } from '@/hooks/use-toast'

export function CommunitySection() {
  const { toast } = useToast()
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false)
  const [newsletterError, setNewsletterError] = useState('')

  const handleNewsletterSubscribe = () => {
    setNewsletterError('')
    const email = newsletterEmail.trim()
    if (!email) {
      setNewsletterError('Please enter your email address')
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setNewsletterError('Please enter a valid email address')
      return
    }
    setNewsletterSubscribed(true)
    toast({
      title: 'Subscribed successfully!',
      description: 'Welcome to the Humain-Uno newsletter. Check your inbox for a confirmation.',
    })
  }

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950" role="region" aria-label="Community">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl sm:text-4xl font-bold mb-3 relative text-gray-900 dark:text-gray-100">Join the Community<span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-24 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full" /></h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Connect with thousands of AI agent developers. Share, learn, and build together.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* GitHub Stars */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <Card className="h-full border-0 shadow-sm hover:shadow-md transition-all duration-300 text-center rounded-xl">
              <CardContent className="p-6">
                <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gray-100 dark:bg-gray-800 mb-4" aria-hidden="true">
                  <Github className="h-7 w-7" />
                </div>
                <div className="text-3xl font-bold mb-1">
                  <AnimatedCounter target={2847} duration={1.5} />
                </div>
                <div className="text-sm text-muted-foreground mb-3">GitHub Stars</div>
                <Button variant="outline" size="sm" className="rounded-lg gap-1.5" asChild>
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="Star on GitHub">
                    <Star className="h-3.5 w-3.5" aria-hidden="true" /> Star on GitHub
                  </a>
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contributors */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Card className="h-full border-0 shadow-sm hover:shadow-md transition-all duration-300 text-center rounded-xl">
              <CardContent className="p-6">
                <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 mb-4" aria-hidden="true">
                  <Users className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="text-3xl font-bold mb-1">
                  <AnimatedCounter target={156} duration={1.5} />
                </div>
                <div className="text-sm text-muted-foreground mb-3">Contributors</div>
                {/* Contributor avatars */}
                <div className="flex items-center justify-center -space-x-2 mb-3" aria-hidden="true">
                  {['SC', 'MR', 'PP', 'AK', 'JW'].map((initials, i) => (
                    <div
                      key={initials}
                      className="h-7 w-7 rounded-full border-2 border-white dark:border-gray-950 flex items-center justify-center text-[9px] font-bold text-white"
                      style={{
                        backgroundColor: ['#10b981', '#f59e0b', '#8b5cf6', '#f43f5e', '#06b6d4'][i],
                        zIndex: 5 - i,
                      }}
                    >
                      {initials}
                    </div>
                  ))}
                  <div className="h-7 w-7 rounded-full border-2 border-white dark:border-gray-950 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[9px] font-medium text-muted-foreground" style={{ zIndex: 0 }}>
                    +151
                  </div>
                </div>
                <Button variant="outline" size="sm" className="rounded-lg gap-1.5" asChild>
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="Contribute to the project">
                    <GitBranch className="h-3.5 w-3.5" aria-hidden="true" /> Contribute
                  </a>
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Discord */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <Card className="h-full border-0 shadow-sm hover:shadow-md transition-all duration-300 text-center rounded-xl">
              <CardContent className="p-6">
                <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 mb-4" aria-hidden="true">
                  <MessageCircle className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="text-3xl font-bold mb-1">
                  <AnimatedCounter target={890} duration={1.5} />
                </div>
                <div className="text-sm text-muted-foreground mb-3">Discord Members</div>
                <Button variant="outline" size="sm" className="rounded-lg gap-1.5" asChild>
                  <a href="https://discord.gg" target="_blank" rel="noopener noreferrer" aria-label="Join Discord community">
                    <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" /> Join Discord
                  </a>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Newsletter signup */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 shadow-sm overflow-hidden max-w-2xl mx-auto">
            <div className="h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" aria-hidden="true" />
            <CardContent className="p-6 sm:p-8 text-center">
              {!newsletterSubscribed ? (
                <>
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 mb-4" aria-hidden="true">
                    <Mail className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Stay in the Loop</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Get weekly updates on new agents, framework releases, and community highlights.
                  </p>
                  <div className="flex gap-3 max-w-md mx-auto">
                    <div className="flex-1">
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        className={`h-10 rounded-lg ${newsletterError ? 'border-rose-300 focus-visible:ring-rose-400' : ''}`}
                        value={newsletterEmail}
                        onChange={(e) => {
                          setNewsletterEmail(e.target.value)
                          setNewsletterError('')
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && handleNewsletterSubscribe()}
                        aria-label="Email address for newsletter"
                        aria-invalid={!!newsletterError}
                        aria-describedby={newsletterError ? 'newsletter-error' : undefined}
                      />
                    </div>
                    <Button
                      className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg px-6 h-10 shrink-0"
                      onClick={handleNewsletterSubscribe}
                      aria-label="Subscribe to newsletter"
                    >
                      Subscribe
                    </Button>
                  </div>
                  {newsletterError && (
                    <p id="newsletter-error" className="text-xs text-rose-500 mt-2" role="alert">{newsletterError}</p>
                  )}
                  <p className="text-[11px] text-muted-foreground mt-3">No spam, unsubscribe anytime. Join 1,200+ subscribers.</p>
                </>
              ) : (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="py-4"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.1 }}
                    className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 mb-4"
                  >
                    <Check className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                  </motion.div>
                  <h3 className="font-bold text-lg mb-2">You&apos;re subscribed!</h3>
                  <p className="text-sm text-muted-foreground">
                    Welcome to the Humain-Uno newsletter. Check your inbox for a confirmation.
                  </p>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Social Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-8 flex items-center justify-center gap-3"
        >
          {[
            { icon: Github, label: 'GitHub', href: 'https://github.com' },
            { icon: Twitter, label: 'Twitter', href: 'https://twitter.com' },
            { icon: MessageCircle, label: 'Discord', href: 'https://discord.gg' },
          ].map(social => (
            <Button
              key={social.label}
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full"
              asChild
            >
              <a href={social.href} target="_blank" rel="noopener noreferrer" aria-label={social.label}>
                <social.icon className="h-4 w-4" />
              </a>
            </Button>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
