"use client";

import { useState, useEffect } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MoonIcon,
  SunIcon,
  SaveIcon,
  UploadIcon,
  RefreshCwIcon,
} from "lucide-react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  isSameDay,
  addDays,
  parseISO,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { es } from "date-fns/locale";
import Swal from "sweetalert2";

type Protocol = "4:3" | "1:2";

type SavedData = {
  selectedDate: string;
  protocol: Protocol;
  pillCount: number;
};

export default function ProtocolCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [protocol, setProtocol] = useState<Protocol>("4:3");
  const [pillCount, setPillCount] = useState<number>(0);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode");
    if (savedDarkMode !== null) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  // Ajustamos para mostrar la semana completa incluso si empieza en el mes anterior
  const calendarStart = startOfWeek(monthStart, { locale: es });
  const calendarEnd = endOfWeek(monthEnd, { locale: es });
  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const getProtocolColor = (date: Date) => {
    if (date < selectedDate) return "";
    const daysSinceStart = Math.floor(
      (date.getTime() - selectedDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    let greenDays = 0;
    if (protocol === "4:3") {
      greenDays =
        Math.floor(daysSinceStart / 7) * 4 + Math.min(daysSinceStart % 7, 4);
    } else {
      greenDays = Math.floor(daysSinceStart / 3);
    }
    if (greenDays >= pillCount) return "";
    if (protocol === "4:3") {
      return daysSinceStart % 7 < 4
        ? darkMode
          ? "bg-green-800"
          : "bg-green-200"
        : darkMode
        ? "bg-red-800"
        : "bg-red-200";
    } else {
      return daysSinceStart % 3 === 0
        ? darkMode
          ? "bg-green-800"
          : "bg-green-200"
        : darkMode
        ? "bg-red-800"
        : "bg-red-200";
    }
  };

  const getLastPillDate = () => {
    if (pillCount <= 0) return null;
    let totalDays = 0;
    if (protocol === "4:3") {
      const fullCycles = Math.floor(pillCount / 4);
      const remainingDays = pillCount % 4;
      totalDays = fullCycles * 7 + remainingDays - 1;
    } else {
      totalDays = (pillCount - 1) * 3;
    }
    const lastPillDay = addDays(selectedDate, totalDays);
    return format(lastPillDay, "d 'de' MMMM, yyyy", { locale: es });
  };

  const formatDate = (date: Date) => {
    return format(date, "d 'de' MMMM, yyyy", { locale: es });
  };

  const saveData = () => {
    const dataToSave: SavedData = {
      selectedDate: selectedDate.toISOString(),
      protocol,
      pillCount,
    };
    localStorage.setItem("protocolCalendarData", JSON.stringify(dataToSave));
    Swal.fire({
      title: "¡Guardado!",
      text: "Datos guardados correctamente",
      icon: "success",
      confirmButtonText: "OK",
    });
  };

  const loadData = () => {
    const savedData = localStorage.getItem("protocolCalendarData");
    if (savedData) {
      const parsedData: SavedData = JSON.parse(savedData);
      setSelectedDate(parseISO(parsedData.selectedDate));
      setProtocol(parsedData.protocol);
      setPillCount(parsedData.pillCount);
      Swal.fire({
        title: "¡Cargado!",
        text: "Datos cargados correctamente",
        icon: "success",
        confirmButtonText: "OK",
      });
    } else {
      Swal.fire({
        title: "Error",
        text: "No hay datos guardados",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const resetData = () => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, resetear",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        setSelectedDate(new Date());
        setCurrentMonth(new Date());
        setProtocol("4:3");
        setPillCount(0);
        Swal.fire(
          "¡Reseteado!",
          "Los datos han sido reseteados correctamente",
          "success"
        );
      }
    });
  };

  useEffect(() => {
    setCurrentMonth(selectedDate);
  }, [selectedDate]);

  return (
    <div
      className={`min-h-screen flex items-center justify-center ${
        darkMode ? "bg-gray-900" : "bg-gray-100"
      }`}
    >
      <div
        className={`w-full max-w-md p-6 rounded-lg shadow-lg ${
          darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={prevMonth}
            className={`p-2 rounded-full ${
              darkMode ? "hover:bg-gray-700" : "hover:bg-gray-200"
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-semibold">
            {format(currentMonth, "MMMM yyyy", { locale: es })}
          </h2>
          <button
            onClick={nextMonth}
            className={`p-2 rounded-full ${
              darkMode ? "hover:bg-gray-700" : "hover:bg-gray-200"
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="mb-4 space-y-4">
          <div className="flex justify-between items-center">
            <label className="block font-medium">Protocolo</label>
            <div className="flex space-x-2">
              <button
                onClick={saveData}
                className={`p-2 rounded-full ${
                  darkMode
                    ? "bg-gray-700 hover:bg-gray-600"
                    : "bg-gray-200 hover:bg-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                title="Guardar datos"
              >
                <SaveIcon className="h-5 w-5" />
              </button>
              <button
                onClick={loadData}
                className={`p-2 rounded-full ${
                  darkMode
                    ? "bg-gray-700 hover:bg-gray-600"
                    : "bg-gray-200 hover:bg-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                title="Cargar datos"
              >
                <UploadIcon className="h-5 w-5" />
              </button>
              <button
                onClick={resetData}
                className={`p-2 rounded-full ${
                  darkMode
                    ? "bg-gray-700 hover:bg-gray-600"
                    : "bg-gray-200 hover:bg-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                title="Resetear datos"
              >
                <RefreshCwIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-full ${
                  darkMode ? "bg-gray-700" : "bg-gray-200"
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                {darkMode ? (
                  <SunIcon className="h-5 w-5" />
                ) : (
                  <MoonIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
          <div className="flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio text-blue-600"
                name="protocol"
                value="4:3"
                checked={protocol === "4:3"}
                onChange={(e) => setProtocol(e.target.value as Protocol)}
              />
              <span className="ml-2">4:3</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio text-blue-600"
                name="protocol"
                value="1:2"
                checked={protocol === "1:2"}
                onChange={(e) => setProtocol(e.target.value as Protocol)}
              />
              <span className="ml-2">1:2</span>
            </label>
          </div>
          <div>
            <label htmlFor="pill-count" className="block mb-2 font-medium">
              Cantidad
            </label>
            <input
              id="pill-count"
              type="number"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                darkMode
                  ? "bg-gray-700 border-gray-600"
                  : "bg-white border-gray-300"
              }`}
              value={pillCount}
              onChange={(e) =>
                setPillCount(Math.max(0, parseInt(e.target.value) || 0))
              }
              min="0"
            />
          </div>
        </div>
        {pillCount > 0 && (
          <div
            className={`mb-4 p-3 rounded-md space-y-2 ${
              darkMode
                ? "bg-blue-900 text-blue-200"
                : "bg-blue-100 text-blue-800"
            }`}
          >
            <p className="text-sm">
              Inicio: <strong>{formatDate(selectedDate)}</strong>
            </p>
            <p className="text-sm">
              Fin: <strong>{getLastPillDate()}</strong>
            </p>
          </div>
        )}
        <div className="grid grid-cols-7 gap-1">
          {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((day) => (
            <div key={day} className="text-center font-medium text-sm py-2">
              {day}
            </div>
          ))}
          {calendarDays.map((day) => (
            <button
              key={day.toString()}
              onClick={() => setSelectedDate(day)}
              className={`
                p-2 text-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500
                ${
                  !isSameMonth(day, currentMonth)
                    ? darkMode
                      ? "text-gray-500"
                      : "text-gray-400"
                    : ""
                }
                ${isToday(day) ? "ring-2 ring-blue-600" : ""}
                ${
                  isSameDay(day, selectedDate)
                    ? darkMode
                      ? "bg-blue-600 text-white"
                      : "bg-blue-600 text-white"
                    : ""
                }
                ${getProtocolColor(day)}
              `}
            >
              {format(day, "d")}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
