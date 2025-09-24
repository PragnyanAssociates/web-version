"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext.tsx";
import { API_BASE_URL } from "../../apiConfig";
import { Country, State, City } from "country-state-city";
import {
    FaRoute,
    FaChevronRight,
    FaPhoneAlt,
    FaTimes,
    FaEdit,
    FaTrash,
    FaBus,
    FaTimesCircle,
    FaMapMarkerAlt
} from "react-icons/fa";
import { MdArrowBack, MdPerson, MdSupervisorAccount } from 'react-icons/md';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import polyline from "@mapbox/polyline";
import "leaflet/dist/leaflet.css";
import { createPortal } from "react-dom";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// --- Icon Components for Header (from FoodScreen) ---
function UserIcon() {
    return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="7" r="4" strokeLinecap="round" />
            <path d="M5.5 21a6.5 6.5 0 0113 0" strokeLinecap="round" />
        </svg>
    );
}

function HomeIcon() {
    return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 12l9-9 9 9" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5 10v9a1 1 0 001 1h4m8-10v9a1 1 0 01-1 1h-4m-6 0h6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function CalendarIcon() {
    return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
            <rect x="3" y="4" width="18" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="16" y1="2" x2="16" y2="6" strokeLinecap="round" />
            <line x1="8" y1="2" x2="8" y2="6" strokeLinecap="round" />
            <line x1="3" y1="10" x2="21" y2="10" strokeLinecap="round" />
        </svg>
    );
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
    );
}

// --- Leaflet Icon Fix ---
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
});

// --- Transport Specific Components (Unchanged) ---
function TransportIcon() {
    return (
        <svg className="w-6 h-6 sm:w-8 sm:h-8 text-blue-800" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
        </svg>
    );
}

const makeCall = (phone) => phone && (window.location.href = `tel:${phone}`);

const FitBounds = ({ coordinates }) => {
    const map = useMap();
    useEffect(() => {
        if (coordinates?.length > 0) {
            map.fitBounds(coordinates);
            setTimeout(() => map.invalidateSize(), 200);
        }
    }, [coordinates, map]);
    return null;
};

const RouteFormModal = ({ routeToEdit, onClose, onSaved }) => {
    // (This component's code remains unchanged)
    const { user } = useAuth();
    const isEdit = !!routeToEdit;
    const [isLoading, setIsLoading] = useState(isEdit);
    const [isSaving, setIsSaving] = useState(false);
    const [routeName, setRouteName] = useState("");
    const [driverName, setDriverName] = useState("");
    const [driverPhone, setDriverPhone] = useState("");
    const [conductorName, setConductorName] = useState("");
    const [conductorPhone, setConductorPhone] = useState("");
    const [stops, setStops] = useState([{ point: "" }, { point: "" }]);
    const allCountries = useMemo(() => Country.getAllCountries(), []);
    const [countryCode, setCountryCode] = useState("");
    const [stateCode, setStateCode] = useState("");
    const [cityName, setCityName] = useState("");
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; };
    }, []);

    useEffect(() => {
        const loadEditData = async () => {
            if (!isEdit) { setIsLoading(false); return; }
            try {
                const res = await fetch(`${API_BASE_URL}/api/transport/routes/${routeToEdit.route_id}`);
                const data = await res.json();
                setRouteName(data.route_name || "");
                setDriverName(data.driver_name || "");
                setDriverPhone(data.driver_phone || "");
                setConductorName(data.conductor_name || "");
                setConductorPhone(data.conductor_phone || "");
                setStops(data.stops?.length > 1 ? data.stops.map(s => ({ point: s.point })) : [{ point: "" }, { point: "" }]);
                const foundCountry = allCountries.find(c => c.name === data.country);
                if (foundCountry) {
                    setCountryCode(foundCountry.isoCode);
                    const stateList = State.getStatesOfCountry(foundCountry.isoCode);
                    setStates(stateList);
                    const foundState = stateList.find(s => s.name === data.state);
                    if (foundState) {
                        setStateCode(foundState.isoCode);
                        setCities(City.getCitiesOfState(foundCountry.isoCode, foundState.isoCode));
                        setCityName(data.city || "");
                    }
                }
            } catch (e) {
                alert(e.message);
                onClose();
            } finally {
                setIsLoading(false);
            }
        };
        loadEditData();
    }, [isEdit, routeToEdit, allCountries, onClose]);

    useEffect(() => {
        if (countryCode) {
            setStates(State.getStatesOfCountry(countryCode));
            setStateCode("");
            setCities([]);
            setCityName("");
        }
    }, [countryCode]);

    useEffect(() => {
        if (countryCode && stateCode) {
            setCities(City.getCitiesOfState(countryCode, stateCode));
            setCityName("");
        }
    }, [countryCode, stateCode]);

    const handleStopChange = (i, val) => {
        const newStops = [...stops];
        newStops[i].point = val;
        setStops(newStops);
    };

    const addStop = () => setStops(prev => [...prev, { point: "" }]);
    const removeStop = i => {
        if (stops.length > 2) setStops(prev => prev.filter((_, idx) => idx !== i));
    };

    const handleSubmit = async () => {
        const countryName = Country.getCountryByCode(countryCode)?.name;
        const stateName = State.getStateByCodeAndCountry(stateCode, countryCode)?.name;

        if (!routeName || !driverName || !countryName || !stateName || !cityName || stops.length < 2 || stops.some(s => !s.point.trim())) {
            return alert("Please fill all required fields and provide at least two valid boarding points.");
        }

        const payload = { route_name: routeName, driver_name: driverName, driver_phone: driverPhone, conductor_name: conductorName, conductor_phone: conductorPhone, stops, city: cityName, state: stateName, country: countryName, created_by: user.id };
        const url = isEdit ? `${API_BASE_URL}/api/transport/routes/${routeToEdit.route_id}` : `${API_BASE_URL}/api/transport/routes`;
        const method = isEdit ? "PUT" : "POST";

        setIsSaving(true);
        try {
            const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Save failed");
            alert(`Route ${isEdit ? "updated" : "created"} successfully`);
            onSaved?.();
            onClose();
        } catch (e) {
            alert(e.message);
        } finally {
            setIsSaving(false);
        }
    };

    useEffect(() => {
        const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const handleBackdropClick = (e) => { if (e.target === e.currentTarget) onClose(); };

    const modalContent = (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" style={{ zIndex: 9999 }} onClick={handleBackdropClick}>
            <div className="w-full max-w-5xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <h2 className="text-2xl font-bold text-gray-800">{isEdit ? "Edit Route" : "Create New Route"}</h2>
                    <button className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-all duration-300 flex-shrink-0" onClick={onClose} aria-label="Close"><FaTimes className="text-gray-600" /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <div className="relative mb-4">
                                <div className="h-12 w-12 border-4 border-orange-200 rounded-full border-t-orange-500 animate-spin shadow-lg"></div>
                                <div className="absolute inset-0 h-12 w-12 border-4 border-transparent rounded-full border-r-orange-400 animate-pulse"></div>
                            </div>
                            <p className="text-gray-600 font-medium">Loading...</p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center"><div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full mr-3"></div>Route Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2 lg:col-span-1"><input className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 bg-white" placeholder="Route Name (e.g., Route-1)" value={routeName} onChange={(e) => setRouteName(e.target.value)} /></div>
                                    <div><input className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 bg-white" placeholder="Driver Name" value={driverName} onChange={(e) => setDriverName(e.target.value)} /></div>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center"><div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full mr-3"></div>Contact Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div><input className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 bg-white" placeholder="Driver Phone" value={driverPhone} onChange={(e) => setDriverPhone(e.target.value)} /></div>
                                    <div><input className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 bg-white" placeholder="Conductor Name" value={conductorName} onChange={(e) => setConductorName(e.target.value)} /></div>
                                    <div className="md:col-span-2"><input className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 bg-white" placeholder="Conductor Phone" value={conductorPhone} onChange={(e) => setConductorPhone(e.target.value)} /></div>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center"><div className="w-2 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full mr-3"></div>Location</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div><select className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 bg-white" value={countryCode} onChange={(e) => setCountryCode(e.target.value)}><option value="">Select Country</option>{allCountries.map((c) => (<option key={c.isoCode} value={c.isoCode}>{c.name}</option>))}</select></div>
                                    <div><select className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 bg-white disabled:opacity-50 disabled:cursor-not-allowed" value={stateCode} onChange={(e) => setStateCode(e.target.value)} disabled={!countryCode}><option value="">Select State</option>{states.map((s) => (<option key={s.isoCode} value={s.isoCode}>{s.name}</option>))}</select></div>
                                    <div><select className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 bg-white disabled:opacity-50 disabled:cursor-not-allowed" value={cityName} onChange={(e) => setCityName(e.target.value)} disabled={!stateCode}><option value="">Select City</option>{cities.map((c) => (<option key={c.name} value={c.name}>{c.name}</option>))}</select></div>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center"><div className="w-2 h-6 bg-gradient-to-b from-orange-500 to-red-500 rounded-full mr-3"></div>Boarding Points (in order)</h3>
                                <div className="space-y-3">
                                    {stops.map((stop, i) => (<div className="flex gap-3" key={i}><div className="flex-1"><input className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 transition-all duration-300 bg-white" placeholder={`Stop ${i + 1} (e.g., Ameerpet)`} value={stop.point} onChange={(e) => handleStopChange(i, e.target.value)} /></div>{stops.length > 2 && (<button className="w-12 h-12 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all duration-300 flex items-center justify-center flex-shrink-0" onClick={() => removeStop(i)} aria-label="Remove stop"><FaTimesCircle size={18} /></button>)}</div>))}
                                    <button className="w-full px-4 py-3 rounded-xl border-2 border-dashed border-gray-300 hover:border-orange-500 bg-gray-50 hover:bg-orange-50 text-gray-600 hover:text-orange-600 transition-all duration-300 font-medium" onClick={addStop}>+ Add Another Stop</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-end p-6 border-t border-gray-200 bg-gray-50">
                    <button className="px-6 py-3 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold transition-all duration-300 order-2 sm:order-1" onClick={onClose} disabled={isLoading}>Cancel</button>
                    <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2" onClick={handleSubmit} disabled={isSaving || isLoading}>
                        {isSaving ? (<div className="flex items-center justify-center gap-2"><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Saving...</div>) : ("Save Route")}
                    </button>
                </div>
            </div>
        </div>
    );
    return createPortal(modalContent, document.body);
};


const TransportListScreen = ({ onSelectDetail }) => {
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/transport/routes`);
                if (!res.ok) throw new Error("Could not fetch routes.");
                setRoutes(await res.json());
            } catch (e) {
                alert(e.message);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-16">
                <div className="relative mb-4">
                    <div className="h-12 w-12 border-4 border-orange-200 rounded-full border-t-orange-500 animate-spin shadow-lg"></div>
                    <div className="absolute inset-0 h-12 w-12 border-4 border-transparent rounded-full border-r-orange-400 animate-pulse"></div>
                </div>
                <p className="text-gray-600 font-medium">Loading transport routes...</p>
            </div>
        );
    }
    
    return (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            {routes.length > 0 ? (
                <div className="divide-y divide-slate-200">
                    {routes.map((r, index) => (
                        <button
                            key={r.route_id}
                            className="group w-full p-4 sm:p-6 hover:bg-slate-100 transition-colors duration-200 flex items-center justify-between text-left"
                            onClick={() => onSelectDetail(r.route_id, r.route_name)}
                            style={{ animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both` }}
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-11 h-11 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <FaRoute className="text-blue-600 text-lg" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-800 text-base sm:text-lg">{r.route_name}</h3>
                                    <p className="text-slate-500 text-sm">View route details and live tracking</p>
                                </div>
                            </div>
                            <FaChevronRight className="text-slate-400 group-hover:text-blue-500 transition-colors duration-300 ml-4" />
                        </button>
                    ))}
                </div>
            ) : (
                <div className="p-12 text-center">
                     <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <TransportIcon />
                    </div>
                    <h3 className="text-xl font-bold text-slate-700 mb-2">No Routes Available</h3>
                    <p className="text-slate-500">Transport routes have not been added yet.</p>
                </div>
            )}
        </div>
    );
};


const RouteDetailScreen = ({ routeId, routeName, onBack }) => {
    const [routeData, setRouteData] = useState(null);
    const [coords, setCoords] = useState([]);

    useEffect(() => {
        let timer;
        const fetchData = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/transport/routes/${routeId}`);
                if (!res.ok) throw new Error("Could not fetch route details.");
                const data = await res.json();
                setRouteData(data);

                if (data?.route_path_polyline) {
                    const decoded = polyline.decode(data.route_path_polyline);
                    const latlngs = decoded.map(([lat, lng]) => [lat, lng]);
                    setCoords(latlngs);
                } else {
                    setCoords([]);
                }
            } catch (e) {
                alert(e.message);
            }
        };

        fetchData();
        timer = setInterval(fetchData, 15000);
        return () => clearInterval(timer);
    }, [routeId]);

    if (!routeData) {
        return (
            <div className="flex flex-col items-center justify-center py-16">
                <div className="relative mb-4">
                    <div className="h-12 w-12 border-4 border-orange-200 rounded-full border-t-orange-500 animate-spin shadow-lg"></div>
                    <div className="absolute inset-0 h-12 w-12 border-4 border-transparent rounded-full border-r-orange-400 animate-pulse"></div>
                </div>
                <p className="text-gray-600 font-medium">Loading route details...</p>
            </div>
        );
    }
    
    const renderContactCard = (title, name, phone, icon) => (
        <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl">
            <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-600">
                    {icon}
                </div>
                <div>
                    <p className="text-sm font-medium text-slate-500">{title}</p>
                    <p className="font-bold text-slate-800 text-lg">{name || 'N/A'}</p>
                </div>
                {phone && (
                    <button
                        onClick={() => makeCall(phone)}
                        className="ml-auto w-9 h-9 bg-blue-100 hover:bg-blue-200 rounded-full flex items-center justify-center transition-all duration-300 flex-shrink-0"
                        aria-label={`Call ${title}`}
                    >
                        <FaPhoneAlt className="text-blue-600 text-sm" />
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Map & Contacts */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Map */}
                    <div className="border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                         <div className="bg-slate-50 p-4 border-b border-slate-200">
                            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-3">
                                <FaBus className="text-blue-500" /> Live Bus Tracking
                            </h3>
                        </div>
                        <div className="h-[450px] w-full bg-slate-200">
                            {coords.length > 0 ? (
                                <MapContainer style={{ height: "100%", width: "100%" }} center={coords[0] || [0, 0]} zoom={13}>
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                    <Polyline positions={coords} color="#3b82f6" weight={5} />
                                    <FitBounds coordinates={coords} />
                                    {routeData.current_lat && (
                                        <Marker position={[routeData.current_lat, routeData.current_lng]} />
                                    )}
                                </MapContainer>
                            ) : (
                                <div className="h-full w-full flex items-center justify-center bg-slate-100">
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <TransportIcon />
                                        </div>
                                        <p className="text-slate-600 font-medium">Route map is unavailable</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                     {/* Contacts */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {renderContactCard("Driver", routeData.driver_name, routeData.driver_phone, <MdPerson size={22} />)}
                        {renderContactCard("Conductor", routeData.conductor_name, routeData.conductor_phone, <MdSupervisorAccount size={22} />)}
                    </div>
                </div>

                {/* Right Column: Stops */}
                <div className="lg:col-span-1">
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl shadow-sm h-full">
                        <div className="p-4 border-b border-slate-200">
                             <h3 className="font-bold text-lg text-slate-800 flex items-center gap-3">
                                <FaMapMarkerAlt className="text-orange-500"/> Route Stops
                            </h3>
                        </div>
                        <div className="p-6 max-h-[600px] overflow-y-auto">
                            <div className="relative">
                                {/* Vertical line for timeline */}
                                <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-slate-200"></div>
                                {(routeData.stops || []).map((s, i) => (
                                    <div key={i} className="relative pl-10 mb-6">
                                        <div className="absolute left-0 top-1 w-6 h-6 bg-slate-50 border-2 border-slate-300 rounded-full flex items-center justify-center">
                                            <div className="w-3 h-3 bg-slate-300 rounded-full"></div>
                                        </div>
                                        <p className="font-semibold text-slate-700">{s.point}</p>
                                        <p className="text-sm text-slate-500">Stop {s.sno ?? i + 1}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AdminTransportPanel = () => {
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);

    const fetchRoutes = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/transport/routes`);
            if (!res.ok) throw new Error("Could not fetch routes.");
            setRoutes(await res.json());
        } catch (e) {
            alert(e.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRoutes();
    }, [fetchRoutes]);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this route? This action cannot be undone.")) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/transport/routes/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete route.");
            await fetchRoutes();
            alert("Route deleted successfully.");
        } catch (e) {
            alert(e.message);
        }
    };
    
    const handleAddNew = () => {
        setEditing(null);
        setShowModal(true);
    }
    
    const handleEdit = (route) => {
        setEditing(route);
        setShowModal(true);
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <button
                    className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-bold py-3 px-5 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    onClick={handleAddNew}
                >
                    <FaRoute />
                    <span>Add New Route</span>
                </button>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                         <div className="h-10 w-10 border-4 border-blue-200 rounded-full border-t-blue-500 animate-spin"></div>
                         <p className="text-slate-500 font-medium mt-4">Loading routes...</p>
                    </div>
                ) : routes.length > 0 ? (
                    <div className="divide-y divide-slate-200">
                        {routes.map((r, index) => (
                            <div
                                key={r.route_id}
                                className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-100 transition-colors"
                                style={{ animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both` }}
                            >
                                <div className="flex items-center gap-4">
                                     <div className="w-11 h-11 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <FaRoute className="text-blue-600 text-lg" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-800 text-base sm:text-lg">{r.route_name}</h3>
                                        <p className="text-slate-500 text-sm">Manage bus route details and stops</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 ml-4">
                                    <button
                                        className="w-9 h-9 bg-blue-50 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors duration-200 flex items-center justify-center"
                                        onClick={() => handleEdit(r)}
                                        aria-label="Edit Route"
                                        title="Edit"
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        className="w-9 h-9 bg-red-50 hover:bg-red-200 text-red-600 rounded-lg transition-colors duration-200 flex items-center justify-center"
                                        onClick={() => handleDelete(r.route_id)}
                                        aria-label="Delete Route"
                                        title="Delete"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                     <div className="p-12 text-center">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                           <TransportIcon />
                       </div>
                       <h3 className="text-xl font-bold text-slate-700 mb-2">No Routes Found</h3>
                       <p className="text-slate-500">Click 'Add New Route' to get started.</p>
                   </div>
                )}
            </div>

            {showModal && (
                <RouteFormModal
                    routeToEdit={editing}
                    onSaved={fetchRoutes}
                    onClose={() => setShowModal(false)}
                />
            )}
        </div>
    );
};

// --- Main Component to orchestrate views (Updated) ---
const TransportScreen = () => {
    const { user, token, logout, getProfileImageUrl, setUnreadCount } = useAuth();
    const navigate = useNavigate();

    // --- State for Header ---
    const [profile, setProfile] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [unreadCount, setLocalUnreadCount] = useState(0);
    const [query, setQuery] = useState("");

    // --- State for Transport functionality ---
    const [view, setView] = useState("list"); // 'list' or 'detail'
    const [selectedRoute, setSelectedRoute] = useState({ id: null, name: "" });
    
    // --- Dynamic page title for header ---
    const pageInfo = useMemo(() => {
        if (user?.role === 'admin') {
            return { title: 'Transport Management', subtitle: 'Add, edit, or delete bus routes' };
        }
        if (view === 'detail') {
            return { title: selectedRoute.name, subtitle: 'Live tracking and route information' };
        }
        return { title: 'Transport Routes', subtitle: 'Select a route to view details' };
    }, [user, view, selectedRoute]);

    // --- Hooks for Header Functionality ---
    useEffect(() => {
        async function fetchUnreadNotifications() {
            if (!token) {
                setUnreadCount?.(0);
                return;
            }
            try {
                const res = await fetch(`${API_BASE_URL}/api/notifications`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    const count = Array.isArray(data) ? data.filter((n) => !n.is_read).length : 0;
                    setLocalUnreadCount(count);
                    setUnreadCount?.(count);
                } else {
                    setUnreadCount?.(0);
                }
            } catch {
                setUnreadCount?.(0);
            }
        }
        fetchUnreadNotifications();
        const id = setInterval(fetchUnreadNotifications, 60000);
        return () => clearInterval(id);
    }, [token, setUnreadCount]);

    useEffect(() => {
        async function fetchProfile() {
            if (!user?.id) {
                setLoadingProfile(false);
                return;
            }
            setLoadingProfile(true);
            try {
                const res = await fetch(`${API_BASE_URL}/api/profiles/${user.id}`);
                if (res.ok) {
                    setProfile(await res.json());
                } else {
                    setProfile({
                        id: user.id,
                        username: user.username || "Unknown",
                        full_name: user.full_name || "User",
                        role: user.role || "user",
                    });
                }
            } catch {
                setProfile(null);
            } finally {
                setLoadingProfile(false);
            }
        }
        fetchProfile();
    }, [user]);

    // --- Helper Functions ---
    const handleLogout = () => {
        if (window.confirm("Are you sure you want to log out?")) {
            logout();
            navigate("/");
        }
    };

    const getDefaultDashboardRoute = () => {
        if (!user) return "/";
        if (user.role === "admin") return "/AdminDashboard";
        if (user.role === "teacher") return "/TeacherDashboard";
        if (user.role === "student") return "/StudentDashboard";
        if (user.role === 'donor') return '/DonorDashboard';
        return "/";
    };

    const handleSelectDetail = (routeId, routeName) => {
        setSelectedRoute({ id: routeId, name: routeName });
        setView("detail");
    };

    const handleBackToList = () => {
        setView("list");
        setSelectedRoute({ id: null, name: "" });
    };

    // Render content based on user role and current view
    const renderContent = () => {
        if (user?.role === "admin") {
            return <AdminTransportPanel />;
        }

        // Default view for students/teachers
        switch (view) {
            case "detail":
                return (
                    <RouteDetailScreen
                        routeId={selectedRoute.id}
                        routeName={selectedRoute.name}
                        onBack={handleBackToList}
                    />
                );
            case "list":
            default:
                return (
                    <TransportListScreen onSelectDetail={handleSelectDetail} />
                );
        }
    };
    
    // Render the appropriate back button based on the current view
    const renderBackButton = () => {
        if (user?.role !== 'admin' && view === 'detail') {
             return (
                 <button
                    onClick={handleBackToList}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
                    title="Back to Routes List"
                >
                    <MdArrowBack />
                    <span>Back to Routes List</span>
                </button>
            )
        }
        return (
            <button
                onClick={() => navigate(getDefaultDashboardRoute())}
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
                title="Back to Dashboard"
            >
                <MdArrowBack />
                <span>Back to Dashboard</span>
            </button>
        )
    }

    return (
        <div className="min-h-screen bg-slate-100">
            <header className="border-b border-slate-200 bg-slate-100 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                        <div className="min-w-0 flex-1">
                            <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-slate-700 truncate">{pageInfo.title}</h1>
                            <p className="text-xs sm:text-sm text-slate-600">{pageInfo.subtitle}</p>
                        </div>

                        <div className="flex items-center flex-wrap justify-end gap-2 sm:gap-3">
                            <div className="relative">
                                <input
                                    id="module-search"
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search..."
                                    className="w-full sm:w-44 lg:w-64 rounded-md border border-slate-200 bg-white px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="inline-flex items-stretch rounded-lg border border-slate-200 bg-white overflow-hidden">
                                <button
                                    onClick={() => navigate(getDefaultDashboardRoute())}
                                    className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-slate-700 hover:bg-slate-50 transition"
                                    type="button"
                                    title="Home"
                                >
                                    <HomeIcon />
                                    <span className="hidden md:inline">Home</span>
                                </button>
                                <div className="w-px bg-slate-200" aria-hidden="true" />
                                <button
                                    onClick={() => navigate("/AcademicCalendar")}
                                    className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-slate-700 hover:bg-slate-50 transition"
                                    type="button"
                                    title="Calendar"
                                >
                                    <CalendarIcon />
                                    <span className="hidden md:inline">Calendar</span>
                                </button>
                                <div className="w-px bg-slate-200" aria-hidden="true" />
                                <button
                                    onClick={() => navigate("/ProfileScreen")}
                                    className="flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-slate-700 hover:bg-slate-50 transition"
                                    type="button"
                                    title="Profile"
                                >
                                    <UserIcon />
                                    <span className="hidden md:inline">Profile</span>
                                </button>
                            </div>

                            <div className="h-4 sm:h-6 w-px bg-slate-200 mx-0.5 sm:mx-1" aria-hidden="true" />

                            <div className="flex items-center gap-2 sm:gap-3">
                                <img
                                    src={getProfileImageUrl() || "/placeholder.svg"}
                                    alt="Profile"
                                    className="w-7 h-7 sm:w-9 sm:h-9 rounded-full border border-slate-200 object-cover"
                                    onError={(e) => {
                                        e.currentTarget.src = "/assets/profile.png"
                                    }}
                                />
                                <div className="hidden sm:flex flex-col">
                                    <span className="text-xs sm:text-sm font-medium text-slate-900 truncate max-w-[8ch] sm:max-w-[12ch]">
                                        {profile?.full_name || profile?.username || "User"}
                                    </span>
                                    <span className="text-xs text-slate-600 capitalize">{profile?.role || ""}</span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="inline-flex items-center rounded-md bg-blue-600 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                >
                                    <span className="hidden sm:inline">Logout</span>
                                    <span className="sm:hidden">Exit</span>
                                </button>
                                <button
                                    onClick={() => navigate("/NotificationsScreen")}
                                    className="relative inline-flex items-center justify-center rounded-full border border-slate-200 bg-white p-1.5 sm:p-2 text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                    aria-label="Notifications"
                                    title="Notifications"
                                    type="button"
                                >
                                    <BellIcon />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-0.5 sm:-top-1 -right-0.5 sm:-right-1 px-1 sm:px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold text-white bg-red-600 rounded-full min-w-[16px] sm:min-w-[18px]">
                                            {unreadCount > 99 ? "99+" : unreadCount}
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
                <div className="mb-6">
                   {renderBackButton()}
                </div>
                {loadingProfile ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    renderContent()
                )}
            </main>
        </div>
    );
};

export default TransportScreen;