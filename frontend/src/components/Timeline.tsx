"use client"

import { motion } from "framer-motion"
import { Calendar, Award, Trophy, Star, Medal, MapPin, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface TimelineEvent {
  id: string
  milestoneDate: string
  customName?: string
  notes?: string
  milestoneType: {
    name: string
    displayName: string
    icon: string
    color: string
  }
}

interface TimelineProps {
  events: TimelineEvent[]
  className?: string
}

const iconMap: Record<string, React.ElementType> = {
  calendar: Calendar,
  award: Award,
  trophy: Trophy,
  star: Star,
  medal: Medal,
  "map-pin": MapPin,
  user: User,
}

export function Timeline({ events, className }: TimelineProps) {
  if (events.length === 0) {
    return (
      <div className={cn("text-center py-12 text-slate-500", className)}>
        <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No milestones yet</p>
        <p className="text-sm">Add milestones to see the timeline</p>
      </div>
    )
  }

  return (
    <div className={cn("relative", className)}>
      {/* Vertical line */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200" />

      <div className="space-y-8">
        {events.map((event, index) => {
          const Icon = iconMap[event.milestoneType.icon] || Calendar
          const color = event.milestoneType.color || "#3B82F6"
          const date = new Date(event.milestoneDate).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })

          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative flex gap-4"
            >
              {/* Icon circle */}
              <div
                className="relative z-10 flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
                style={{ backgroundColor: color }}
              >
                <Icon className="w-5 h-5 text-white" />
              </div>

              {/* Content */}
              <div className="flex-1 pt-1">
                <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold text-slate-900">
                      {event.customName || event.milestoneType.displayName}
                    </h4>
                    <span className="text-sm text-slate-500 whitespace-nowrap">
                      {date}
                    </span>
                  </div>
                  {event.notes && (
                    <p className="mt-2 text-sm text-slate-600">{event.notes}</p>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
