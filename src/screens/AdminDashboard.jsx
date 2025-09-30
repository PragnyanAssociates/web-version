"use client"

import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext.tsx"
import { API_BASE_URL } from "../apiConfig"
import { SERVER_URL } from '../apiConfig';
import apiClient from '../api/client.js';
import centerImage from "../assets/centerimage.png"



function UserIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="7" r="4" strokeLinecap="round" />
      <path d="M5.5 21a6.5 6.5 0 0113 0" strokeLinecap="round" />
    </svg>
  )
}

function HomeIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 12l9-9 9 9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 10v9a1 1 0 001 1h4m8-10v9a1 1 0 01-1 1h-4m-6 0h6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="16" y1="2" x2="16" y2="6" strokeLinecap="round" />
      <line x1="8" y1="2" x2="8" y2="6" strokeLinecap="round" />
      <line x1="3" y1="10" x2="21" y2="10" strokeLinecap="round" />
    </svg>
  )
}

function BellIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-5-5.917V4a1 1 0 10-2 0v1.083A6 6 0 006 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
      />
    </svg>
  )
}

const allQuickAccessItems = [
  {
    id: "qa-ads-manage",
    title: "Ads Management",
    imageSource: "https://cdn-icons-png.flaticon.com/128/19006/19006038.png",
    navigateTo: "/AdminAdDashboardScreen",
  },
  {
    id: "qa-ads-create",
    title: "Create Ad",
    imageSource: "https://cdn-icons-png.flaticon.com/128/4944/4944482.png",
    navigateTo: "/CreateAdScreen",
  },
  {
    id: "qa0",
    title: "LM",
    imageSource: "https://cdn-icons-png.flaticon.com/128/15096/15096966.png",
    navigateTo: "/AdminLM",
  },
  {
    id: "qa5",
    title: "Time Table",
    imageSource: "https://cdn-icons-png.flaticon.com/128/1254/1254275.png",
    navigateTo: "/TimeTableScreen",
  },
  {
    id: "qa3",
    title: "Attendance",
    imageSource: "https://cdn-icons-png.flaticon.com/128/10293/10293877.png",
    navigateTo: "/AttendanceScreen",
  },
  {
    id: "qa4",
    title: "Syllabus",
    imageSource: "https://cdn-icons-png.flaticon.com/128/4728/4728712.png",
    navigateTo: "/AdminSyllabusScreen",
  },
  {
    id: "qa7",
    title: "Exam Schedule",
    imageSource: "https://cdn-icons-png.flaticon.com/128/4029/4029113.png",
    navigateTo: "/TeacherAdminExamScreen",
  },
  {
    id: "qa15",
    title: "Exams",
    imageSource: "https://cdn-icons-png.flaticon.com/128/207/207190.png",
    navigateTo: "/TeacherAdminExamsScreen",
  },
  {
    id: "qa6",
    title: "Reports",
    imageSource: "https://cdn-icons-png.flaticon.com/128/9913/9913576.png",
    navigateTo: "/TeacherAdminResultsScreen",
  },
  {
    id: "qa16",
    title: "Study Materials",
    imageSource: "https://cdn-icons-png.flaticon.com/128/3273/3273259.png",
    navigateTo: "/TeacherAdminMaterialsScreen",
  },
  {
    id: "qa13",
    title: "Homework",
    imageSource: "https://cdn-icons-png.flaticon.com/128/11647/11647336.png",
    navigateTo: "/TeacherAdminHomeworkScreen",
  },
  {
    id: "qa8",
    title: "Digital Labs",
    imageSource: "https://cdn-icons-png.flaticon.com/128/9562/9562280.png",
    navigateTo: "/TeacherAdminLabsScreen",
  },
  {
    id: "qa9",
    title: "Sports",
    imageSource: "https://cdn-icons-png.flaticon.com/128/3429/3429456.png",
    navigateTo: "/AdminSportsScreen",
  },
  {
    id: "qa12",
    title: "Health Info",
    imageSource: "https://cdn-icons-png.flaticon.com/128/3004/3004458.png",
    navigateTo: "/TeacherAdminHealthScreen",
  },
  {
    id: "qa11",
    title: "Events",
    imageSource: "https://cdn-icons-png.flaticon.com/128/9592/9592283.png",
    navigateTo: "/AdminEventsScreen",
  },
  {
    id: "qa10",
    title: "PTM",
    imageSource: "https://cdn-icons-png.flaticon.com/128/17588/17588666.png",
    navigateTo: "/TeacherAdminPTMScreen",
  },
  {
    id: "qa14",
    title: "Help Desk",
    imageSource: "https://cdn-icons-png.flaticon.com/128/4961/4961736.png",
    navigateTo: "/AdminHelpDeskScreen",
  },
  {
    id: "qa17",
    title: "Transport",
    imageSource: "https://cdn-icons-png.flaticon.com/128/2945/2945694.png",
    navigateTo: "/TransportScreen",
  },
  {
    id: "qa18",
    title: "Gallery",
    imageSource: "https://cdn-icons-png.flaticon.com/128/8418/8418513.png",
    navigateTo: "/GalleryScreen",
  },
  {
    id: "qa20",
    title: "Chat AI",
    imageSource: "https://cdn-icons-png.flaticon.com/128/6028/6028616.png",
    navigateTo: "/ChatAIScreen",
  },
  {
    id: "qa21",
    title: "Suggestions",
    imageSource: "https://cdn-icons-png.flaticon.com/128/9722/9722906.png",
    navigateTo: "/AdminSuggestionsScreen",
  },
  {
    id: "qa22",
    title: "Sponsorship",
    imageSource: "https://cdn-icons-png.flaticon.com/128/18835/18835518.png",
    navigateTo: "/AdminSponsorScreen",
  },
  {
    id: "qa23",
    title: "Payments",
    imageSource: "https://cdn-icons-png.flaticon.com/128/1198/1198291.png",
    navigateTo: "/AdminPaymentScreen",
  },
  {
    id: "qa24",
    title: "Kitchen",
    imageSource: "https://cdn-icons-png.flaticon.com/128/1698/1698742.png",
    navigateTo: "/KitchenScreen",
  },
  {
    id: "qa25",
    title: "Food",
    imageSource: "https://cdn-icons-png.flaticon.com/128/2276/2276931.png",
    navigateTo: "/FoodScreen",
  },
  {
    id: "qa26",
    title: "Group Chat",
    imageSource: "https://cdn-icons-png.flaticon.com/128/745/745205.png",
    navigateTo: "/GroupChatScreen",
  },
  {
    id: "qa27",
    title: "Online Classes",
    imageSource: "https://cdn-icons-png.flaticon.com/128/2922/2922510.png",
    navigateTo: "/OnlineClassScreen",
  },
  {
    id: "qa28",
    title: "Library",
    imageSource: "https://cdn-icons-png.flaticon.com/128/3135/3135715.png",
    navigateTo: "/LibraryScreen",
  },
    { id: 'qa29', title: 'Alumni', imageSource: 'https://cdn-icons-png.flaticon.com/128/2641/2641333.png', navigateTo: '/AlumniScreen' },
     { id: 'qa30', title: 'Pre-Admissions', imageSource: 'https://cdn-icons-png.flaticon.com/128/16495/16495874.png', navigateTo: '/PreAdmissionsScreen' },
]

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { user, token, logout, getProfileImageUrl, unreadCount, setUnreadCount } = useAuth()

  const [profile, setProfile] = useState(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [activeTab, setActiveTab] = useState("home")
  const [query, setQuery] = useState("")
  const [showAllMobile, setShowAllMobile] = useState(false)

 useEffect(() => {
  async function fetchUnreadNotifications() {
    if (!token) {
      setUnreadCount?.(0)
      return
    }
    try {
      const res = await apiClient.get('/notifications')
      const data = Array.isArray(res.data) ? res.data : []
      const count = data.filter((n) => !n.is_read).length
      setUnreadCount?.(count)
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
      setUnreadCount?.(0)
    }
  }
  
  fetchUnreadNotifications()
  const intervalId = setInterval(fetchUnreadNotifications, 60000) // Poll every minute
  return () => clearInterval(intervalId)
}, [token, setUnreadCount])

  useEffect(() => {
    async function fetchProfile() {
      if (!user?.id) {
        setLoadingProfile(false)
        return
      }
      setLoadingProfile(true)
      try {
        const res = await apiClient.get(`/profiles/${user.id}`)
        if (res.ok) {
          setProfile(await res.json())
        } else {
          setProfile({
            id: user.id,
            username: user.username || "Unknown",
            full_name: user.full_name || "Administrator",
            role: user.role || "admin",
          })
        }
      } catch {
        setProfile(null)
      } finally {
        setLoadingProfile(false)
      }
    }
    fetchProfile()
  }, [user])

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      logout()
      navigate("/")
    }
  }

  const filteredItems = allQuickAccessItems.filter((i) => i.title.toLowerCase().includes(query.trim().toLowerCase()))

  const kpis = [
    { id: "kpi-students", label: "Students", value: "1,240" },
    { id: "kpi-teachers", label: "Teachers", value: "86" },
    { id: "kpi-standards", label: "Standards", value: "12" },
    { id: "kpi-sections", label: "Sections", value: "56" },
  ]

  let mainContent = (
  <>
    {/* This now has a small default margin for mobile, and the original margins for sm and up. */}
    <header className="mb-4 sm:mb-12 md:mb-16 lg:mb-20 lg:mb-24">
      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">Institute Management System</h2>
      <p className="text-sm sm:text-base text-slate-600">Easy Navigation</p>
    </header>

    {/* This section's responsive margin is correct and does not need to be changed. */}
    <section
      aria-label="Quick access"
      className="relative block sm:flex sm:items-center sm:justify-center min-h-[480px] xs:min-h-[500px] sm:min-h-[640px] md:min-h-[750px] lg:min-h-[820px] xl:min-h-[940px] pt-0 mt-8 sm:-mt-24 pb-6 sm:pb-8 md:pb-12"
    >
        <div
          className="relative z-10 flex items-center justify-center
                      w-56 h-56 xs:w-72 xs:h-72 sm:w-80 sm:h-80 md:w-96 md:h-96 lg:w-[400px] lg:h-[400px] xl:w-[450px] xl:h-[450px]
                      rounded-full overflow-hidden shadow-2xl mx-auto sm:mx-0 mb-4 sm:mb-0"
        >
          <img src={centerImage || "/placeholder.svg"} alt="Parent ERP" className="w-full h-full object-cover" />
        </div>

        <div className="xs:hidden w-full mt-4 flex items-center justify-center">
          <div className="grid grid-cols-2 gap-4 w-full max-w-sm px-4">
            {(showAllMobile ? filteredItems : filteredItems.slice(0, 10)).map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.navigateTo)}
                className="group relative w-full aspect-square rounded-xl bg-white border-2 border-slate-200 shadow-lg hover:shadow-xl hover:border-blue-500 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 p-3"
                aria-label={`Open ${item.title}`}
              >
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="w-12 h-12 mb-2 rounded-full bg-slate-50 flex items-center justify-center">
                    <img
                      src={item.imageSource || "/placeholder.svg"}
                      alt=""
                      className="w-8 h-8 object-contain"
                      aria-hidden="true"
                    />
                  </div>
                  <span className="text-sm font-medium text-slate-800 text-center leading-snug whitespace-normal">
                    {item.title}
                  </span>
                </div>
              </button>
            ))}
            {filteredItems.length > 10 && !showAllMobile && (
              <button
                onClick={() => setShowAllMobile(true)}
                className="group relative w-full aspect-square rounded-xl bg-slate-100 border-2 border-slate-300 shadow-lg hover:shadow-xl hover:border-blue-500 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 p-3"
                aria-label="View all modules"
              >
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="w-12 h-12 mb-2 rounded-full bg-white flex items-center justify-center">
                    <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-slate-700 text-center leading-snug">More</span>
                </div>
              </button>
            )}
          </div>
        </div>

        <div className="hidden xs:block sm:hidden w-full mt-5 flex items-center justify-center">
          <div className="grid grid-cols-2 gap-5 w-full max-w-sm px-5">
            {(showAllMobile ? filteredItems : filteredItems.slice(0, 8)).map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.navigateTo)}
                className="group relative w-full aspect-square rounded-xl bg-white border-2 border-slate-200 shadow-lg hover:shadow-xl hover:border-blue-500 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 p-4"
                aria-label={`Open ${item.title}`}
              >
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="w-14 h-14 mb-3 rounded-full bg-slate-50 flex items-center justify-center">
                    <img
                      src={item.imageSource || "/placeholder.svg"}
                      alt=""
                      className="w-9 h-9 object-contain"
                      aria-hidden="true"
                    />
                  </div>
                  <span className="text-base font-medium text-slate-800 text-center leading-snug whitespace-normal">
                    {item.title}
                  </span>
                </div>
              </button>
            ))}
            {filteredItems.length > 8 && !showAllMobile && (
              <button
                onClick={() => setShowAllMobile(true)}
                className="group relative w-full aspect-square rounded-xl bg-slate-100 border-2 border-slate-300 shadow-lg hover:shadow-xl hover:border-blue-500 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 p-4"
                aria-label="View all modules"
              >
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="w-14 h-14 mb-3 rounded-full bg-white flex items-center justify-center">
                    <svg className="w-7 h-7 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  </div>
                  <span className="text-base font-medium text-slate-700 text-center leading-snug">More</span>
                </div>
              </button>
            )}
          </div>
        </div>

        <div className="hidden sm:block md:hidden absolute inset-0 flex items-center justify-center">
          {filteredItems.length > 0 &&
            filteredItems.map((item, index) => {
              const totalItems = filteredItems.length
              const angle = (index * 360) / totalItems
              const radius = 250
              const x = Math.cos((angle * Math.PI) / 180) * radius
              const y = Math.sin((angle * Math.PI) / 180) * radius

              return (
                <div
                  key={item.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `calc(50% + ${x}px)`,
                    top: `calc(50% + ${y}px)`,
                  }}
                >
                  <button
                    onClick={() => navigate(item.navigateTo)}
                    className="group relative w-16 h-16 rounded-full bg-white border-2 border-slate-200 shadow-lg hover:shadow-xl hover:border-blue-500 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    aria-label={`Open ${item.title}`}
                  >
                    <div className="flex flex-col items-center justify-center h-full p-1">
                      <div className="w-6 h-6 mb-0.5">
                        <img
                          src={item.imageSource || "/placeholder.svg"}
                          alt=""
                          className="w-full h-full object-contain"
                          aria-hidden="true"
                        />
                      </div>
                      <span className="text-[10px] font-medium text-slate-800 text-center leading-tight">
                        {item.title.length > 8 ? item.title.substring(0, 8) + "..." : item.title}
                      </span>
                    </div>
                  </button>
                </div>
              )
            })}
        </div>

        <div className="hidden md:block lg:hidden absolute inset-0 flex items-center justify-center">
          {filteredItems.length > 0 &&
            (() => {
              const totalItems = filteredItems.length
              const innerCount = Math.min(12, totalItems)
              const outerCount = Math.max(0, totalItems - innerCount)
              const innerRadius = 280
              const outerRadius = 400
              const nodes = []

              for (let i = 0; i < innerCount; i++) {
                const angle = (i * 360) / innerCount
                const x = Math.cos((angle * Math.PI) / 180) * innerRadius
                const y = Math.sin((angle * Math.PI) / 180) * innerRadius
                const item = filteredItems[i]
                nodes.push(
                  <div
                    key={item.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)` }}
                  >
                    <button
                      onClick={() => navigate(item.navigateTo)}
                      className="group relative w-20 h-20 rounded-full bg-white border-2 border-slate-200 shadow-lg hover:shadow-xl hover:border-blue-500 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      aria-label={`Open ${item.title}`}
                    >
                      <div className="flex flex-col items-center justify-center h-full p-2">
                        <div className="w-8 h-8 mb-1">
                          <img
                            src={item.imageSource || "/placeholder.svg"}
                            alt=""
                            className="w-full h-full object-contain"
                            aria-hidden="true"
                          />
                        </div>
                        <span className="text-xs font-medium text-slate-800 text-center leading-tight">
                          {item.title.length > 8 ? item.title.substring(0, 8) + "..." : item.title}
                        </span>
                      </div>
                    </button>
                  </div>,
                )
              }

              for (let j = 0; j < outerCount; j++) {
                const angle = (j * 360) / outerCount + (outerCount > 0 ? 180 / outerCount : 0)
                const x = Math.cos((angle * Math.PI) / 180) * outerRadius
                const y = Math.sin((angle * Math.PI) / 180) * outerRadius
                const item = filteredItems[innerCount + j]
                nodes.push(
                  <div
                    key={item.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)` }}
                  >
                    <button
                      onClick={() => navigate(item.navigateTo)}
                      className="group relative w-20 h-20 rounded-full bg-white border-2 border-slate-200 shadow-lg hover:shadow-xl hover:border-blue-500 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      aria-label={`Open ${item.title}`}
                    >
                      <div className="flex flex-col items-center justify-center h-full p-2">
                        <div className="w-8 h-8 mb-1">
                          <img
                            src={item.imageSource || "/placeholder.svg"}
                            alt=""
                            className="w-full h-full object-contain"
                            aria-hidden="true"
                          />
                        </div>
                        <span className="text-xs font-medium text-slate-800 text-center leading-tight">
                          {item.title.length > 8 ? item.title.substring(0, 8) + "..." : item.title}
                        </span>
                      </div>
                    </button>
                  </div>,
                )
              }

              return nodes
            })()}
        </div>

        <div className="hidden lg:block absolute inset-0 flex items-center justify-center">
          {filteredItems.length > 0 &&
            (() => {
              const totalItems = filteredItems.length
              const innerCount = Math.min(12, totalItems)
              const outerCount = Math.max(0, totalItems - innerCount)
              const innerRadius = 340
              const outerRadius = 480
              const nodes = []

              for (let i = 0; i < innerCount; i++) {
                const angle = (i * 360) / innerCount
                const x = Math.cos((angle * Math.PI) / 180) * innerRadius
                const y = Math.sin((angle * Math.PI) / 180) * innerRadius
                const item = filteredItems[i]
                nodes.push(
                  <div
                    key={item.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)` }}
                  >
                    <button
                      onClick={() => navigate(item.navigateTo)}
                      className="group relative w-24 h-24 xl:w-28 xl:h-28 2xl:w-32 2xl:h-32 rounded-full bg-white border-2 border-slate-200 shadow-lg hover:shadow-xl hover:border-blue-500 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      aria-label={`Open ${item.title}`}
                    >
                      <div className="flex flex-col items-center justify-center h-full p-2">
                        <div className="w-10 h-10 xl:w-12 xl:h-12 2xl:w-14 2xl:h-14 mb-1">
                          <img
                            src={item.imageSource || "/placeholder.svg"}
                            alt=""
                            className="w-full h-full object-contain"
                            aria-hidden="true"
                          />
                        </div>
                        <span className="text-sm xl:text-base font-medium text-slate-800 text-center leading-tight">
                          {item.title}
                        </span>
                      </div>
                    </button>
                  </div>,
                )
              }

              for (let j = 0; j < outerCount; j++) {
                const angle = (j * 360) / outerCount + (outerCount > 0 ? 180 / outerCount : 0)
                const x = Math.cos((angle * Math.PI) / 180) * outerRadius
                const y = Math.sin((angle * Math.PI) / 180) * outerRadius
                const item = filteredItems[innerCount + j]
                nodes.push(
                  <div
                    key={item.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)` }}
                  >
                    <button
                      onClick={() => navigate(item.navigateTo)}
                      className="group relative w-24 h-24 xl:w-28 xl:h-28 2xl:w-32 2xl:h-32 rounded-full bg-white border-2 border-slate-200 shadow-lg hover:shadow-xl hover:border-blue-500 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      aria-label={`Open ${item.title}`}
                    >
                      <div className="flex flex-col items-center justify-center h-full p-2">
                        <div className="w-10 h-10 xl:w-12 xl:h-12 2xl:w-14 2xl:h-14 mb-1">
                          <img
                            src={item.imageSource || "/placeholder.svg"}
                            alt=""
                            className="w-full h-full object-contain"
                            aria-hidden="true"
                          />
                        </div>
                        <span className="text-sm xl:text-base font-medium text-slate-800 text-center leading-tight">
                          {item.title}
                        </span>
                      </div>
                    </button>
                  </div>,
                )
              }

              return nodes
            })()}
        </div>

        {filteredItems.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center px-4">
            <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 text-center shadow-lg max-w-md w-full">
              <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-7 h-7 sm:w-8 sm:h-8 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <p className="text-slate-600 text-sm sm:text-base">No modules match "{query}".</p>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">Try a different search term</p>
            </div>
          </div>
        )}
      </section>
    </>
  )

  return (
    // +++ UPDATED BACKGROUND COLOR +++
    <div className="min-h-screen bg-slate-50">
      {/* +++ UPDATED HEADER BACKGROUND COLOR +++ */}
      <header className="border-b border-slate-200 bg-slate-50">
  <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-2">
    {/* This parent div now wraps elements on mobile */}
    <div className="flex flex-wrap items-center justify-between gap-y-3 gap-x-4">
      
      {/* Title section is now full-width on mobile */}
      <div className="w-full sm:w-auto sm:min-w-0 sm:flex-1">
        <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-slate-700 text-pretty mb-0">
          Admin Dashboard
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mb-0">
          ERP for Educational Institutions
        </p>
      </div>

      {/* Controls section is now full-width and aligned right on mobile */}
      <div className="w-full flex items-center justify-end gap-2 sm:w-auto sm:justify-start sm:gap-3">
        <label htmlFor="module-search" className="sr-only">Search modules</label>
        <div className="relative flex-grow sm:flex-grow-0">
          <input id="module-search" type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search modules" className="w-full rounded-md border border-slate-200 bg-white px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="inline-flex items-stretch rounded-lg border border-slate-200 bg-white overflow-hidden">
          <button onClick={() => setActiveTab("home")} className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm transition ${activeTab === "home" ? "bg-blue-600 text-white" : "text-slate-700 hover:bg-slate-50"}`} type="button" title="Home"><HomeIcon /><span className="hidden md:inline">Home</span></button>
          <div className="w-px bg-slate-200" aria-hidden="true" />
          <button onClick={() => navigate("/AcademicCalendar")} className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm transition text-slate-700 hover:bg-slate-50" type="button" title="Calendar"><CalendarIcon /><span className="hidden md:inline">Calendar</span></button>
          <div className="w-px bg-slate-200" aria-hidden="true" />
          <button onClick={() => navigate("/ProfileScreen")} className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm transition ${activeTab === "profile" ? "bg-blue-600 text-white" : "text-slate-700 hover:bg-slate-50"}`} type="button" title="Profile"><UserIcon /><span className="hidden md:inline">Profile</span></button>
        </div>
      </div>

      <div className="h-px w-full bg-slate-200 my-1 sm:hidden" aria-hidden="true" />

      {/* Profile section is now full-width and justified on mobile */}
      <div className="w-full flex items-center justify-between gap-2 sm:w-auto sm:justify-start sm:gap-3">
        {/* All profile items are now in a single flex container to stay grouped together */}
<div className="w-full flex items-center justify-end gap-2 sm:w-auto sm:gap-3">
    <img src={getProfileImageUrl() || "/placeholder.svg"} alt="Profile" className="w-7 h-7 sm:w-9 sm:h-9 rounded-full border border-slate-200 object-cover" onError={(e) => { e.currentTarget.src = "/assets/profile.png" }} />
    <div className="hidden sm:flex flex-col">
        <span className="text-xs sm:text-sm font-medium text-slate-900 truncate max-w-[8ch] sm:max-w-[12ch]">{profile?.full_name || profile?.username || "User"}</span>
        <span className="text-xs text-slate-600 capitalize">{profile?.role || ""}</span>
    </div>
    <button onClick={handleLogout} className="inline-flex items-center rounded-md bg-blue-600 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"><span className="hidden sm:inline">Logout</span><span className="sm:hidden">Exit</span></button>
    <button onClick={() => navigate("/NotificationsScreen")} className="relative inline-flex items-center justify-center rounded-full border border-slate-200 bg-white p-1.5 sm:p-2 text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" aria-label="Notifications" title="Notifications" type="button">
        <BellIcon />
        {unreadCount > 0 && (<span className="absolute -top-0.5 sm:-top-1 -right-0.5 sm:-right-1 px-1 sm:px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold text-white bg-red-600 rounded-full min-w-[16px] sm:min-w-[18px]">{unreadCount > 99 ? "99+" : unreadCount}</span>)}
    </button>
</div>
      </div>
    </div>

    <section className="mt-4 pt-3 border-t border-slate-200" aria-label="Key metrics">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {kpis.map((kpi) => (
          <div key={kpi.id} className="flex flex-col items-center rounded-lg border border-slate-200 bg-white p-1 sm:p-1">
            <p className="text-xs text-slate-600 truncate mb-0.5">{kpi.label}</p>
            <p className="mt-0 text-sm sm:text-base lg:text-lg font-semibold text-slate-900">{kpi.value}</p>
          </div>
        ))}
      </div>
    </section>
  </div>
</header>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6">
        {loadingProfile && !profile ? (
          <div className="flex flex-col justify-center items-center py-16 sm:py-24">
            <div
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"
              aria-label="Loading"
            />
            <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-slate-600">Loading your dashboard…</p>
          </div>
        ) : (
          <div>{mainContent}</div>
        )}
      </main>
    </div>
  )
}
