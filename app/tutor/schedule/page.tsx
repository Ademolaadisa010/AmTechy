"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";

interface TimeSlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
}

interface DaySchedule {
  day: string;
  slots: TimeSlot[];
  isAvailable: boolean;
}

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const TIME_OPTIONS = [
  "00:00", "00:30", "01:00", "01:30", "02:00", "02:30",
  "03:00", "03:30", "04:00", "04:30", "05:00", "05:30",
  "06:00", "06:30", "07:00", "07:30", "08:00", "08:30",
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00", "19:30", "20:00", "20:30",
  "21:00", "21:30", "22:00", "22:30", "23:00", "23:30",
];

export default function TutorSchedule() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>("Monday");
  const [showAddSlotModal, setShowAddSlotModal] = useState(false);
  const [newSlot, setNewSlot] = useState({
    startTime: "09:00",
    endTime: "17:00",
    isRecurring: true,
  });
  const [timeZone, setTimeZone] = useState("America/New_York");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await fetchSchedule(currentUser.uid);
        setLoading(false);
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const fetchSchedule = async (userId: string) => {
    try {
      const scheduleDoc = await getDoc(doc(db, "tutor_schedules", userId));
      
      if (scheduleDoc.exists()) {
        const scheduleData = scheduleDoc.data();
        setSchedule(scheduleData.weeklySchedule || initializeEmptySchedule());
        setTimeZone(scheduleData.timeZone || "America/New_York");
      } else {
        setSchedule(initializeEmptySchedule());
      }
    } catch (error) {
      console.error("Error fetching schedule:", error);
      setSchedule(initializeEmptySchedule());
    }
  };

  const initializeEmptySchedule = (): DaySchedule[] => {
    return DAYS_OF_WEEK.map((day) => ({
      day,
      slots: [],
      isAvailable: false,
    }));
  };

  const handleAddSlot = () => {
    const daySchedule = schedule.find((d) => d.day === selectedDay);
    if (!daySchedule) return;

    // Validate times
    if (newSlot.startTime >= newSlot.endTime) {
      alert("End time must be after start time");
      return;
    }

    // Check for overlapping slots
    const hasOverlap = daySchedule.slots.some((slot) => {
      return (
        (newSlot.startTime >= slot.startTime && newSlot.startTime < slot.endTime) ||
        (newSlot.endTime > slot.startTime && newSlot.endTime <= slot.endTime) ||
        (newSlot.startTime <= slot.startTime && newSlot.endTime >= slot.endTime)
      );
    });

    if (hasOverlap) {
      alert("This time slot overlaps with an existing slot");
      return;
    }

    const slot: TimeSlot = {
      id: `${selectedDay}-${Date.now()}`,
      day: selectedDay,
      startTime: newSlot.startTime,
      endTime: newSlot.endTime,
      isRecurring: newSlot.isRecurring,
    };

    const updatedSchedule = schedule.map((daySchedule) => {
      if (daySchedule.day === selectedDay) {
        return {
          ...daySchedule,
          slots: [...daySchedule.slots, slot].sort((a, b) => 
            a.startTime.localeCompare(b.startTime)
          ),
          isAvailable: true,
        };
      }
      return daySchedule;
    });

    setSchedule(updatedSchedule);
    setShowAddSlotModal(false);
    setNewSlot({ startTime: "09:00", endTime: "17:00", isRecurring: true });
  };

  const handleDeleteSlot = (slotId: string) => {
    const updatedSchedule = schedule.map((daySchedule) => {
      const filteredSlots = daySchedule.slots.filter((slot) => slot.id !== slotId);
      return {
        ...daySchedule,
        slots: filteredSlots,
        isAvailable: filteredSlots.length > 0,
      };
    });

    setSchedule(updatedSchedule);
  };

  const handleToggleDayAvailability = (day: string) => {
    const updatedSchedule = schedule.map((daySchedule) => {
      if (daySchedule.day === day) {
        return {
          ...daySchedule,
          isAvailable: !daySchedule.isAvailable,
        };
      }
      return daySchedule;
    });

    setSchedule(updatedSchedule);
  };

  const handleCopySchedule = (fromDay: string, toDays: string[]) => {
    const sourceDay = schedule.find((d) => d.day === fromDay);
    if (!sourceDay) return;

    const updatedSchedule = schedule.map((daySchedule) => {
      if (toDays.includes(daySchedule.day)) {
        // Copy slots from source day
        const copiedSlots = sourceDay.slots.map((slot) => ({
          ...slot,
          id: `${daySchedule.day}-${Date.now()}-${Math.random()}`,
          day: daySchedule.day,
        }));
        return {
          ...daySchedule,
          slots: copiedSlots,
          isAvailable: sourceDay.isAvailable,
        };
      }
      return daySchedule;
    });

    setSchedule(updatedSchedule);
  };

  const handleClearAll = () => {
    if (confirm("Are you sure you want to clear all time slots?")) {
      setSchedule(initializeEmptySchedule());
    }
  };

  const handleSaveSchedule = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const scheduleData = {
        weeklySchedule: schedule,
        timeZone,
        updatedAt: new Date(),
      };

      const scheduleRef = doc(db, "tutor_schedules", user.uid);
      const scheduleDoc = await getDoc(scheduleRef);

      if (scheduleDoc.exists()) {
        await updateDoc(scheduleRef, scheduleData);
      } else {
        await setDoc(scheduleRef, {
          ...scheduleData,
          tutorId: user.uid,
          createdAt: new Date(),
        });
      }

      alert("Schedule saved successfully!");
    } catch (error) {
      console.error("Error saving schedule:", error);
      alert("Failed to save schedule. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const getTotalHoursPerWeek = () => {
    let totalMinutes = 0;
    schedule.forEach((day) => {
      if (day.isAvailable) {
        day.slots.forEach((slot) => {
          const [startHour, startMin] = slot.startTime.split(":").map(Number);
          const [endHour, endMin] = slot.endTime.split(":").map(Number);
          const minutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);
          totalMinutes += minutes;
        });
      }
    });
    return (totalMinutes / 60).toFixed(1);
  };

  if (loading) {
    return (
      <main className="flex-1 flex bg-slate-50 min-h-screen items-center justify-center">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </main>
    );
  }

  const selectedDaySchedule = schedule.find((d) => d.day === selectedDay);

  return (
    <main className="flex-1 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <button
              onClick={() => router.push("/tutor/dashboard")}
              className="flex items-center text-slate-600 hover:text-slate-900 mb-2"
            >
              <i className="fa-solid fa-arrow-left mr-2"></i>
              Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-slate-900">Schedule Management</h1>
            <p className="text-slate-600 mt-1">Set your weekly availability for tutoring sessions</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleClearAll}
              className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors"
            >
              <i className="fa-solid fa-trash mr-2"></i>
              Clear All
            </button>
            <button
              onClick={handleSaveSchedule}
              disabled={saving}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                  Saving...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-save mr-2"></i>
                  Save Schedule
                </>
              )}
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
            <div className="text-sm text-slate-600 mb-1">Total Hours/Week</div>
            <div className="text-2xl font-bold text-slate-900">{getTotalHoursPerWeek()}h</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
            <div className="text-sm text-slate-600 mb-1">Available Days</div>
            <div className="text-2xl font-bold text-slate-900">
              {schedule.filter((d) => d.isAvailable).length}/7
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
            <div className="text-sm text-slate-600 mb-1">Time Slots</div>
            <div className="text-2xl font-bold text-slate-900">
              {schedule.reduce((sum, day) => sum + day.slots.length, 0)}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
            <div className="text-sm text-slate-600 mb-1">Time Zone</div>
            <select
              value={timeZone}
              onChange={(e) => setTimeZone(e.target.value)}
              className="text-sm font-medium text-slate-900 border-none bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="America/New_York">EST (GMT-5)</option>
              <option value="America/Chicago">CST (GMT-6)</option>
              <option value="America/Denver">MST (GMT-7)</option>
              <option value="America/Los_Angeles">PST (GMT-8)</option>
              <option value="Europe/London">GMT (GMT+0)</option>
              <option value="Europe/Paris">CET (GMT+1)</option>
              <option value="Asia/Dubai">GST (GMT+4)</option>
              <option value="Asia/Kolkata">IST (GMT+5:30)</option>
              <option value="Asia/Singapore">SGT (GMT+8)</option>
              <option value="Asia/Tokyo">JST (GMT+9)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Weekly Overview */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Weekly Overview</h2>
              <div className="space-y-2">
                {DAYS_OF_WEEK.map((day) => {
                  const daySchedule = schedule.find((d) => d.day === day);
                  const isSelected = selectedDay === day;
                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                        isSelected
                          ? "bg-indigo-50 border-2 border-indigo-600"
                          : "bg-slate-50 border-2 border-transparent hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            daySchedule?.isAvailable
                              ? "bg-green-100 text-green-600"
                              : "bg-slate-200 text-slate-400"
                          }`}
                        >
                          <i
                            className={`fa-solid ${
                              daySchedule?.isAvailable ? "fa-check" : "fa-xmark"
                            }`}
                          ></i>
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-slate-900">{day}</div>
                          <div className="text-xs text-slate-600">
                            {daySchedule?.slots.length || 0} slot(s)
                          </div>
                        </div>
                      </div>
                      <i className="fa-solid fa-chevron-right text-slate-400"></i>
                    </button>
                  );
                })}
              </div>

              {/* Quick Copy */}
              <div className="mt-6 pt-6 border-t border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-3">Quick Copy</h3>
                <button
                  onClick={() => {
                    const targetDays = DAYS_OF_WEEK.filter((d) => d !== selectedDay);
                    if (
                      confirm(
                        `Copy ${selectedDay}'s schedule to all other days?`
                      )
                    ) {
                      handleCopySchedule(selectedDay, targetDays);
                    }
                  }}
                  className="w-full px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium text-slate-700 transition-colors"
                >
                  <i className="fa-solid fa-copy mr-2"></i>
                  Copy {selectedDay} to All Days
                </button>
              </div>
            </div>
          </div>

          {/* Day Schedule Detail */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{selectedDay} Schedule</h2>
                  <p className="text-sm text-slate-600 mt-1">
                    {selectedDaySchedule?.slots.length || 0} time slot(s) configured
                  </p>
                </div>
                <button
                  onClick={() => setShowAddSlotModal(true)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                >
                  <i className="fa-solid fa-plus mr-2"></i>
                  Add Time Slot
                </button>
              </div>

              {/* Day Availability Toggle */}
              <div className="mb-6 p-4 bg-slate-50 rounded-lg flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900">Available on {selectedDay}</div>
                  <div className="text-sm text-slate-600">
                    {selectedDaySchedule?.isAvailable
                      ? "Students can book sessions"
                      : "No sessions available"}
                  </div>
                </div>
                <button
                  onClick={() => handleToggleDayAvailability(selectedDay)}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                    selectedDaySchedule?.isAvailable ? "bg-green-600" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                      selectedDaySchedule?.isAvailable ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Time Slots */}
              {selectedDaySchedule && selectedDaySchedule.slots.length > 0 ? (
                <div className="space-y-3">
                  {selectedDaySchedule.slots.map((slot) => (
                    <div
                      key={slot.id}
                      className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                          <i className="fa-solid fa-clock text-indigo-600"></i>
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">
                            {slot.startTime} - {slot.endTime}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <span>
                              {(() => {
                                const [startHour, startMin] = slot.startTime
                                  .split(":")
                                  .map(Number);
                                const [endHour, endMin] = slot.endTime.split(":").map(Number);
                                const minutes =
                                  endHour * 60 + endMin - (startHour * 60 + startMin);
                                const hours = Math.floor(minutes / 60);
                                const mins = minutes % 60;
                                return hours > 0
                                  ? `${hours}h ${mins > 0 ? `${mins}m` : ""}`
                                  : `${mins}m`;
                              })()}
                            </span>
                            {slot.isRecurring && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <i className="fa-solid fa-repeat text-xs"></i>
                                  Recurring
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (confirm("Delete this time slot?")) {
                            handleDeleteSlot(slot.id);
                          }
                        }}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fa-solid fa-calendar-xmark text-slate-400 text-3xl"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    No time slots yet
                  </h3>
                  <p className="text-slate-600 mb-4">
                    Add your first time slot for {selectedDay}
                  </p>
                  <button
                    onClick={() => setShowAddSlotModal(true)}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                  >
                    <i className="fa-solid fa-plus mr-2"></i>
                    Add Time Slot
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Time Slot Modal */}
      {showAddSlotModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">Add Time Slot</h3>
              <button
                onClick={() => setShowAddSlotModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
              >
                <i className="fa-solid fa-xmark text-slate-600"></i>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Day
                </label>
                <div className="px-4 py-3 bg-slate-50 rounded-lg font-medium text-slate-900">
                  {selectedDay}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Start Time
                </label>
                <select
                  value={newSlot.startTime}
                  onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                >
                  {TIME_OPTIONS.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  End Time
                </label>
                <select
                  value={newSlot.endTime}
                  onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                >
                  {TIME_OPTIONS.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div>
                  <div className="font-medium text-slate-900">Recurring Weekly</div>
                  <div className="text-sm text-slate-600">
                    Repeat this slot every {selectedDay}
                  </div>
                </div>
                <button
                  onClick={() =>
                    setNewSlot({ ...newSlot, isRecurring: !newSlot.isRecurring })
                  }
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                    newSlot.isRecurring ? "bg-indigo-600" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                      newSlot.isRecurring ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddSlotModal(false)}
                className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSlot}
                className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                <i className="fa-solid fa-plus mr-2"></i>
                Add Slot
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}