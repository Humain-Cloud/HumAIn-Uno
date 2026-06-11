'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { howItWorks } from './shared-data'

export function HowItWorksSection() {
  return (
    <section className="py-16 sm:py-20 bg-gray-50 dark:bg-gray-900" role="region" aria-label="How it works">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl sm:text-4xl font-bold mb-3 relative text-gray-900 dark:text-gray-100">
            How It Works
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-24 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full" />
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            From idea to deployed AI agent in four simple steps
          </p>
        </motion.div>
        {/* Steps with connecting line */}
        <div className="relative">
          {/* Connecting gradient line (desktop only) */}
          <div className="hidden lg:block absolute top-16 left-[12.5%] right-[12.5%] h-[2px] bg-gradient-to-r from-amber-300 via-emerald-300 via-violet-300 to-rose-300 opacity-40" aria-hidden="true" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <Card className="h-full border-0 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group rounded-xl">
                  {/* Numbered step badge */}
                  <div className="absolute top-3 left-3 h-7 w-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold shadow-sm z-10">
                    {item.step}
                  </div>
                  <div className="absolute top-3 right-3 text-6xl font-black text-gray-100/50 dark:text-gray-800/50 select-none" aria-hidden="true">
                    {item.step}
                  </div>
                  <CardContent className="p-6 pt-8 relative">
                    <div className={`inline-flex items-center justify-center h-12 w-12 rounded-xl mb-4 ${item.color} group-hover:scale-110 transition-transform duration-300`}>
                      <item.icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
