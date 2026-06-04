"use client"
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import timeGridPlugin from '@fullcalendar/timegrid'
import { useEffect, useState } from 'react'
import { EventSourceInput } from '@fullcalendar/core/index.js'

interface Event {
  title: string
  start: string
  allDay: boolean
  id: number
  categoryId: string
}

interface Category {
  id: string
  name: string
  color: string
  icon: string
}

const categories: Category[] = [
  { id: 'sport', name: 'Sporten', color: '#f97316', icon: '' },
  { id: 'handwerk', name: 'Handwerk', color: '#a855f7', icon: '' },
  { id: 'lezen', name: 'Lezen', color: '#3b82f6', icon: '' },
  { id: 'koken', name: 'Koken', color: '#22c55e', icon: '' },
  { id: 'reizen', name: 'Reizen', color: '#eab308', icon: '' },
]

export default function Home() {
  const [allEvents, setAllEvents] = useState<Event[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [newEventTitle, setNewEventTitle] = useState('')
  const [newEventCategory, setNewEventCategory] = useState(categories[0].id)
  const [filterCategory, setFilterCategory] = useState<string | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [view, setView] = useState<"calendar" | "agenda">("calendar")

  useEffect(() => {
    const stored = localStorage.getItem('hobby-events')
    if (stored) setAllEvents(JSON.parse(stored))
  }, [])

  useEffect(() => {
    localStorage.setItem('hobby-events', JSON.stringify(allEvents))
  }, [allEvents])

  function handleDateClick(arg: { dateStr: string }) {
    setSelectedDate(arg.dateStr)
    setNewEventTitle('')
    setNewEventCategory(categories[0].id)
    setShowAddModal(true)
  }

  function handleAddEvent() {
    if (newEventTitle.trim() === '') return
    const event: Event = {
      title: newEventTitle.trim(),
      start: selectedDate,
      allDay: true,
      id: Date.now(),
      categoryId: newEventCategory,
    }
    setAllEvents((prev) => [...prev, event])
    setShowAddModal(false)
  }

  function handleEventClick(data: { event: { id: string } }) {
    const found = allEvents.find((e) => e.id === Number(data.event.id))
    if (found) {
      setSelectedEvent(found)
      setEditTitle(found.title)
      setIsEditing(false)
      setShowDetailModal(true)
    }
  }

  function handleDelete() {
    if (!selectedEvent) return
    setAllEvents((prev) => prev.filter((e) => e.id !== selectedEvent.id))
    setShowDetailModal(false)
    setSelectedEvent(null)
  }

  function handleEdit() {
    if (!selectedEvent || editTitle.trim() === '') return
    setAllEvents((prev) =>
      prev.map((e) =>
        e.id === selectedEvent.id ? { ...e, title: editTitle.trim() } : e
      )
    )
    setShowDetailModal(false)
    setSelectedEvent(null)
    setIsEditing(false)
  }

  const filtered = filterCategory
    ? allEvents.filter((e) => e.categoryId === filterCategory)
    : allEvents

  return (
    <>
      <nav className="flex justify-between items-center mb-6 border-b border-violet-100 p-4">
       <img src="/applogo.png" alt="HobbyOnTime" className="h-16" />
        {/* View Toggle */}
        <div className="flex gap-2 mb-4 bg-gray-100 p-1 rounded-xl w-fit">
          <button
            onClick={() => setView("calendar")}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              view === "calendar" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500"
            }`}
          >
            Kalender
          </button>
          <button
            onClick={() => setView("agenda")}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              view === "agenda" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500"
            }`}
          >
             Agenda
          </button>
        </div>

      </nav>

      <main className="p-6 pt-0">
       
        {/* Filter */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <button
            onClick={() => setFilterCategory(null)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filterCategory === null ? "bg-[#1a2b5f] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Alles
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filterCategory === cat.id ? "text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              style={filterCategory === cat.id ? { backgroundColor: cat.color } : {}}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>

        {/* Kalender of Agenda */}
        {view === "calendar" ? (
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek",
            }}
            locale="nl"
            events={filtered.map((ev) => {
              const cat = categories.find((c) => c.id === ev.categoryId)
              return {
                ...ev,
                backgroundColor: cat?.color || "#6366f1",
                borderColor: cat?.color || "#6366f1",
              }
            }) as EventSourceInput}
            nowIndicator={true}
            selectable={true}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            initialView="dayGridMonth"
          />
        ) : (
          <div className="space-y-4">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p className="text-4xl mb-2">📭</p>
                <p>Geen activiteiten gevonden</p>
              </div>
            ) : (
              Object.entries(
                filtered
                  .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
                  .reduce((groups: Record<string, Event[]>, event) => {
                    if (!groups[event.start]) groups[event.start] = []
                    groups[event.start].push(event)
                    return groups
                  }, {})
              ).map(([date, events]) => (
                <div key={date}>
                  <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                    {new Date(date).toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" })}
                  </h2>
                  <div className="space-y-2">
                    {events.map((event) => {
                      const cat = categories.find((c) => c.id === event.categoryId)
                      return (
                        <div
                          key={event.id}
                          onClick={() => {
                            setSelectedEvent(event)
                            setEditTitle(event.title)
                            setIsEditing(false)
                            setShowDetailModal(true)
                          }}
                          className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:shadow-md cursor-pointer bg-white"
                        >
                          <div
                            className="text-2xl w-10 h-10 flex items-center justify-center rounded-lg"
                            style={{ backgroundColor: cat?.color + '20' }}
                          >
                            {cat?.icon}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-800">{event.title}</p>
                            <p className="text-sm font-medium" style={{ color: cat?.color }}>{cat?.name}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* Add Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={(e) => e.target === e.currentTarget && setShowAddModal(false)}
        >
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Nieuw event toevoegen</h3>
            <input
              type="text"
              autoFocus
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="Naam van het event"
              value={newEventTitle}
              onChange={(e) => setNewEventTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddEvent()}
            />
            <div className="grid grid-cols-3 gap-2 mb-5">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setNewEventCategory(cat.id)}
                  className={`p-2 rounded-lg border-2 text-sm font-medium transition-all ${
                    newEventCategory === cat.id ? 'border-violet-500 bg-violet-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
              >
                Annuleren
              </button>
              <button
                onClick={handleAddEvent}
                disabled={newEventTitle.trim() === ''}
                className="px-4 py-2 text-sm rounded-lg bg-violet-600 text-white hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Toevoegen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedEvent && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={(e) => e.target === e.currentTarget && setShowDetailModal(false)}
        >
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            {(() => {
              const cat = categories.find((c) => c.id === selectedEvent.categoryId)
              return (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">{cat?.icon}</span>
                    <div>
                      {isEditing ? (
                        <input
                          type="text"
                          autoFocus
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                      ) : (
                        <h3 className="text-lg font-semibold text-gray-800">{selectedEvent.title}</h3>
                      )}
                      <p className="text-sm font-medium" style={{ color: cat?.color }}>{cat?.name}</p>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-6">📅 {selectedEvent.start}</p>
                  <div className="flex gap-2">
                    {isEditing ? (
                      <button onClick={handleEdit} className="flex-1 bg-violet-600 text-white py-2 rounded-xl font-medium hover:bg-violet-500">
                        Opslaan
                      </button>
                    ) : (
                      <button onClick={() => setIsEditing(true)} className="flex-1 bg-blue-500 text-white py-2 rounded-xl font-medium hover:bg-blue-600">
                        Bewerken
                      </button>
                    )}
                    <button onClick={handleDelete} className="flex-1 bg-red-500 text-white py-2 rounded-xl font-medium hover:bg-red-600">
                      Verwijderen
                    </button>
                    <button onClick={() => setShowDetailModal(false)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-xl font-medium hover:bg-gray-200">
                      Sluiten
                    </button>
                  </div>
                </>
              )
            })()}
          </div>
        </div>
      )}
    </>
  )
}