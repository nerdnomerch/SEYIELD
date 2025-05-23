"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Quote } from "lucide-react"

const testimonials = [
  {
    quote:
      "EduZero changed how I think about shopping. I've been able to buy textbooks and online courses without spending my savings.",
    name: "Alex Johnson",
    title: "College Student",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    quote:
      "As someone new to digital finance, I was surprised how easy it was to use. The rewards-based shopping concept is revolutionary!",
    name: "Sarah Chen",
    title: "Teacher",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    quote:
      "I've been in finance for years, and EduZero is one of the most innovative platforms I've seen. The fixed reward rate gives me peace of mind.",
    name: "Michael Rodriguez",
    title: "Tech Professional",
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

export function Testimonials() {
  return (
    <section className="py-20">
      <div className="container px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">What Our Users Say</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Join thousands of users who are already shopping with their rewards
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border border-pink-100 dark:border-pink-900/20 hover:border-pink-200 dark:hover:border-pink-800/30 transition-colors">
                <CardContent className="pt-6">
                  <Quote className="h-8 w-8 text-pink-500/20 mb-4" />
                  <p className="text-muted-foreground">{testimonial.quote}</p>
                </CardContent>
                <CardFooter>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={testimonial.avatar || "/placeholder.svg"} alt={testimonial.name} />
                      <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
