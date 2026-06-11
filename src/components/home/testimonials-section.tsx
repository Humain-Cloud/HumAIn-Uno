'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Star, Users, Github, Globe } from 'lucide-react'
import { testimonials } from './shared-data'

export function TestimonialsSection() {
  return (
    <section className="py-16 sm:py-20 bg-white dark:bg-gray-950" role="region" aria-label="Testimonials">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl sm:text-4xl font-bold mb-3 relative text-gray-900 dark:text-gray-100">Trusted by Developers Worldwide<span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-24 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full" /></h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Join thousands of developers building AI agents with Humain-Uno
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
            >
              <Card className="h-full border-0 shadow-sm hover:shadow-md transition-all duration-300 rounded-xl">
                <CardContent className="p-6">
                  {/* Stars */}
                  <div className="flex items-center gap-0.5 mb-4" role="img" aria-label={`${t.stars} out of 5 stars`}>
                    {Array.from({ length: t.stars }).map((_, si) => (
                      <Star key={si} className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden="true" />
                    ))}
                  </div>
                  {/* Quote */}
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6 italic">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  {/* Author */}
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-full ${t.color} flex items-center justify-center text-white font-semibold text-sm`} aria-hidden="true">
                      {t.initials}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{t.name}</div>
                      <div className="text-xs text-muted-foreground">{t.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-6 text-muted-foreground text-sm"
          role="list"
          aria-label="Trust indicators"
        >
          <span className="flex items-center gap-1.5" role="listitem">
            <Users className="h-4 w-4" aria-hidden="true" /> 2,500+ Developers
          </span>
          <span className="flex items-center gap-1.5" role="listitem">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden="true" /> 4.9/5 Rating
          </span>
          <span className="flex items-center gap-1.5" role="listitem">
            <Github className="h-4 w-4" aria-hidden="true" /> Open Source
          </span>
          <span className="flex items-center gap-1.5" role="listitem">
            <Globe className="h-4 w-4" aria-hidden="true" /> 40+ Countries
          </span>
        </motion.div>
      </div>
    </section>
  )
}
