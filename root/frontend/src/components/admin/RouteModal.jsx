//After adding UI frontend/src/components/admin/RouteModal.jsx
import React, { useState, useEffect, useRef } from 'react';
// Lucide icons import kiye gaye hain
import { Plus, Edit, Trash2, ChevronDown } from 'lucide-react'; 
import styled from 'styled-components'; 
import StopsSection from './StopsSection';
import { createRoute, updateRoute, deleteRoute } from '../../services/routesapi';
import axios from 'axios';

// ✅ UPDATED IMPORTS: Added 'query' and 'where'
import { doc, setDoc, deleteDoc, serverTimestamp, collection, getDocs, query, where } from "firebase/firestore";

// ✅ UPDATED IMPORTS: Added 'remove' for RTDB
import { firestore, rtdb } from "../../services/firebase";
import { ref, set, remove } from "firebase/database";

// --- FINAL RESPONSIVE CSS STYLING (Includes Media Queries) ---
const FinalModalStyles = `
/* Global Reset and Positioning */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.4); 
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    background: #FFFFFF;
    border-radius: 8px; 
    width: 90%;
    max-width: 650px; 
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    max-height: 90vh; 
    overflow: visible; 
    font-family: 'Roboto', 'Segoe UI', Tahoma, sans-serif; 
    color: #333333;
    position: relative; 
}

/* Header */
.modal-header {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px 25px 15px 25px; 
    flex-shrink: 0; 
}

.modal-header h2 {
    margin: 0;
    font-size: 1.3em; 
    font-weight: 600;
    text-align: center;
}

/* Close button */
.close-button {
    display: block; 
    background: none;
    border: none;
    font-size: 1.5em; 
    cursor: pointer;
    color: #000000;
    opacity: 0.6;
    line-height: 1;
    padding: 0;
    position: absolute;
    right: 20px;
    top: 20px;
    z-index: 10;
}

/* Body and Form Elements */
.modal-body {
    padding: 0 25px 20px 25px; 
    flex-grow: 1;
    overflow-y: auto; 
}

.section {
    margin-bottom: 25px;
}

/* Headings Bold Fix */
.section h3 {
    font-size: 0.97em;
    font-weight: 800; 
    margin-bottom: 15px;
    color: #000000;
    padding-top: 5px;
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    font-size: 0.9em;
    color: #4A4A4A;
    margin-bottom: 8px;
    font-weight: 500;
}

/* Input Field Styling */
.text-input {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #D7D7D7; 
    border-radius: 6px; 
    font-size: 1em;
    box-sizing: border-box; 
    background-color: #FAFAFA; 
    color: #333333;
    border: 1px solid #D7D7D7 !important;
}
.text-input:disabled {
    background-color: #F0F0F0;
    cursor: not-allowed;
    color: #666;
}
.text-input.error-input {
    border-color: #D32F2F;
}

/* Dropdown Simulation */
.select-box {
    display: flex;
    align-items: center;
    cursor: pointer;
    width: 100%;
    padding: 0; /* Padding will be on the select/input */
    border: 1px solid #D7D7D7; 
    border-radius: 6px;
    box-sizing: border-box;
    background-color: #FAFAFA; 
    color: #333333;
    position: relative;
    outline: none !important; 
}
.select-box:has(select:disabled) {
    background-color: #F0F0F0;
    cursor: not-allowed;
    color: #666;
}

.select-box input,
.select-box select {
    border: none;
    padding: 10px 12px;
    font-size: 1em;
    flex-grow: 1;
    background-color: transparent;
    cursor: pointer;
    outline: none !important; 
    box-shadow: none !important;
    width: 100%; /* Important for full width inside select-box */
    box-sizing: border-box;
    color: #333333;
}

.select-box select {
    -webkit-appearance: none; 
    -moz-appearance: none;    
    appearance: none;         
    padding-right: 35px; /* Space for the custom arrow */
}

/* Custom Dropdown Icon Position */
.dropdown-arrow {
    position: absolute;
    right: 12px;
    color: #777;
    pointer-events: none;
    top: 50%; 
    transform: translateY(-50%);
    width: 16px; 
    height: 16px;
}

/* Validation Error Message */
.error-message {
    color: #D32F2F;
    font-size: 0.8em;
    margin-top: 5px;
    font-weight: 500;
}

/* Checkbox Style */
.checkbox-group {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    font-size: 0.9em;
    color: #333333;
    cursor: pointer;
}
.checkbox-group input[type="checkbox"] {
    margin-right: 10px;
    width: 16px;
    height: 16px;
    outline: none;
    cursor: pointer;
}
.checkbox-group label {
    margin-bottom: 0;
    font-weight: 400;
    cursor: pointer;
}

/* Route Activity Toggle Alignment FIX */
.active-status-group {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border: 1px solid #D7D7D7; 
    border-radius: 6px;
    padding: 10px 12px;
    background-color: #FAFAFA; 
}

.status-display {
    color: #333333;
    font-size: 1em;
    font-weight: 400;
    flex-grow: 1; 
    margin-right: 10px; 
}

/* Toggle Switch - Blue color: #132677 */
.switch { position: relative; display: inline-block; width: 45px; height: 25px; margin-left: 0; }
.switch input { opacity: 0; width: 0; height: 0; }
.slider {
    position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0;
    background-color: #E0E0E0; transition: 0.4s; border-radius: 34px;
}
.slider:before {
    position: absolute; content: ""; height: 17px; width: 17px; left: 4px; bottom: 4px;
    background-color: white; transition: 0.4s; border-radius: 50%;
}
input:checked + .slider { background-color: #132677; }
input:checked + .slider:before { transform: translateX(20px); }

/* Notification Section Styling */
.notif-section {
    margin-top: 15px;
    padding: 15px;
    border: 1px dashed #D7D7D7; 
    border-radius: 8px;
    background: #F8F8F8;
}

/* --- TEXTAREA AUTO-GROW STYLING --- */
.notif-textarea {
    width: 100%;
    min-height: 80px;
    padding: 10px;
    margin-top: 8px;
    border-radius: 6px;
    border: 1px solid #D7D7D7;
    resize: none; /* User resize ko disable karein */
    overflow: hidden; /* Scroll bar ko hide karein */
    font-size: 1em;
    box-sizing: border-box;
    background-color: #FAFAFA;
    color: #333333;
    line-height: 1.5; /* Consistent line height */
}

.notif-preview {
    margin-top: 10px;
    padding: 10px;
    background-color: #EFEFEF;
    border-radius: 6px;
    font-size: 0.9em;
    color: #555;
    white-space: pre-wrap;
}

/* --- FOOTER/BUTTONS --- */
.modal-footer {
    display: flex;
    justify-content: flex-end; /* Align buttons to the right */
    align-items: center;
    gap: 15px; 
    padding: 20px 25px 20px 25px; 
    border-top: 1px solid #EEEEEE; 
    flex-shrink: 0; 
}

.cancel-button {
    background: none;
    border: none;
    color: #4A4A4A;
    padding: 10px 15px; 
    cursor: pointer;
    font-size: 1em;
    font-weight: 500;
    text-transform: capitalize; 
    transition: color 0.2s;
    border-radius: 8px;
}

.cancel-button:hover { 
    color: #132677; 
    background-color: #F0F0F0;
} 

.update-button {
    background-color: #132677; 
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1em;
    font-weight: 600;
    transition: background-color 0.2s;
}

.update-button:hover {
    background-color: #0F1E5C;
}

.update-button:disabled {
    background-color: #B0B0B0;
    cursor: not-allowed;
}

/* ===== FIX TIME INPUT (CLOCK NOT SHOWING) ===== */
.time-input {
    appearance: auto !important;
    -webkit-appearance: auto !important;
}

.time-input::-webkit-calendar-picker-indicator {
    display: block !important;
    cursor: pointer;
}


/* MEDIA QUERY */
@media (max-width: 600px) {
    .modal-content { width: 100%; max-width: 100%; margin: 0; border-radius: 0; max-height: 100vh; }
    .modal-header { padding: 15px 15px 10px 15px; }
    .modal-header h2 { font-size: 1.2em; }
    .close-button { right: 15px; top: 15px; }
    .modal-body { padding: 0 15px 15px 15px; }
    .section { margin-bottom: 20px; }
    .form-group label { font-size: 0.85em; }
    .text-input, .select-box input, .select-box select { padding: 8px 10px; font-size: 0.95em; }
    .select-box select { padding-right: 30px; }
    .dropdown-arrow { width: 14px; height: 14px; right: 10px; }
    .modal-footer { flex-direction: column; align-items: stretch; gap: 10px; padding: 15px; }
    .update-button, .cancel-button { width: 100%; margin: 0; text-align: center; }
}
/* ============================= */
/* FIX TIME INPUT TEXT + CLOCK  */
/* ============================= */

input[type="time"] {
    -webkit-appearance: auto !important;
    appearance: auto !important;
    background-color: #FAFAFA !important;
    color: #000 !important;
}

/* FIX THE ACTUAL EDITABLE TEXT */
input[type="time"]::-webkit-datetime-edit {
    color: #000 !important;
}

input[type="time"]::-webkit-datetime-edit-hour-field,
input[type="time"]::-webkit-datetime-edit-minute-field,
input[type="time"]::-webkit-datetime-edit-ampm-field {
    color: #000 !important;
}

/* SHOW CLOCK ICON */
input[type="time"]::-webkit-calendar-picker-indicator {
    opacity: 1 !important;
    display: block !important;
    cursor: pointer !important;
}

`;


// We are reusing the ModalWrapper from the original component 
const ModalWrapper = styled.div`
    position: fixed; top:0; left:0; right:0; bottom:0;
    background: rgba(0,0,0,0.5);
    display:flex; justify-content:center; align-items:center;
    z-index: 9999;
`;


//export default function RouteModal({ type, route = {}, onClose, drivers = [], buses = [], stops = [] }) {
export default function RouteModal({ type, route = {}, onClose, stops = [] }){

    // useRef hook for the textarea
    const textareaRef = useRef(null);
const [busesList, setBusesList] = useState([]);
const [driversList, setDriversList] = useState([]);
useEffect(() => {
    const loadBuses = async () => {
        const snap = await getDocs(collection(firestore, "buses"));
        setBusesList(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    loadBuses();
}, []);

useEffect(() => {
    const loadDrivers = async () => {
        const snap = await getDocs(collection(firestore, "drivers"));
        setDriversList(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    loadDrivers();
}, []);

const [formData, setFormData] = useState({
    routeId: "",
    routeName: "",
    busId: "",
    driverId: "",
    status: "active",
    morningDeparture: "",
    morningArrival: "",
    eveningDeparture: "",
    eveningArrival: "",
    stopsData: [],
    plateNumber: ""
});

    const [deletedStops, setDeletedStops] = useState([]);

    const [sendNotification, setSendNotification] = useState(true);
    const [notifMessage, setNotifMessage] = useState('');
    const [notifStyle, setNotifStyle] = useState('style1');
    const [notifAutoPreview, setNotifAutoPreview] = useState('');
    const [errors, setErrors] = useState({});
    const [routeIdUniqueError, setRouteIdUniqueError] = useState("");
    const [stopsValid, setStopsValid] = useState(false);

    const isDisabled = formData.status === "inactive" && type === "edit";

    // -------------------- Textarea Auto-Grow Logic --------------------
    // Yeh hook content change hone par textarea ki height adjust karega
    const adjustTextareaHeight = () => {
        if (textareaRef.current) {
            // Pehle height ko minimum par set karo
            textareaRef.current.style.height = 'auto'; 
            // Phir scroll height ke barabar set karo
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    };

    // Jab bhi notifMessage state ya modal ka type change ho, height adjust karo
    useEffect(() => {
        if (sendNotification) {
            // Small delay to ensure DOM update is finished before calculation
            setTimeout(adjustTextareaHeight, 0); 
        }
    }, [notifMessage, type, sendNotification]);


    // Custom handler for textarea
    const handleTextareaChange = (e) => {
        setNotifMessage(e.target.value);
        // adjustTextareaHeight() will be called via useEffect
    };
    
    // -------------------- LOAD DATA (Functionality Maintained) --------------------
    useEffect(() => {
        if (type === "edit" && route) {
            setFormData({
                routeId: route.routeId || "",
                routeName: route.routeName || "",
                busId: route.busId || "",
                driverId: route.driverId || "",
                status: route.status || "active",
                stopsData: stops.filter(s => s.routeId === route.routeId) || [],
                plateNumber: busesList.find(b => b.busId === route.busId)?.plateNumber || "",
                morningDeparture: route.morningDeparture || "",
morningArrival: route.morningArrival || "",
eveningDeparture: route.eveningDeparture || "",
eveningArrival: route.eveningArrival || "",

            });
            setDeletedStops([]);
        }
        if (type === "add") {
                setFormData({
        routeId: "",
        routeName: "",
        busId: "",
        driverId: "",
        status: "active",
        morningDeparture: "",
        morningArrival: "",
        eveningDeparture: "",
        eveningArrival: "",
        stopsData: [],
        plateNumber: "" });
            setErrors({});
            setRouteIdUniqueError("");
            setStopsValid(false);
            setDeletedStops([]);
        }
        if (type === "delete") {
            setFormData({
                routeId: route.routeId || "",
                routeName: route.routeName || "",
                busId: route.busId || "",
                driverId: route.driverId || "",
                status: route.status || "active",
                stopsData: stops.filter(s => s.routeId === route.routeId) || [],
                plateNumber: busesList.find(b => b.busId === route.busId)?.plateNumber || ""
            });
        }

        // Reset notification UI
        setSendNotification(true);
        setNotifStyle('style1'); // style1: Sentence (professional), style2: Bullet format
        setNotifMessage('');
        setNotifAutoPreview('');
    }, [type, route, stops, busesList]);


    // -------------------- Notification preview (Functionality Maintained) --------------------
    useEffect(() => {
        if (!sendNotification) return setNotifAutoPreview('');

        const currentBus = busesList.find(b => b.busId === formData.busId);
        const currentDriver = driversList.find(d => d.driverId === formData.driverId);

        if (type === 'add') {
            const msg = `New route added: ${formData.routeId || '[ID]'} — ${formData.routeName || '[Name]'}. Bus: ${currentBus ? currentBus.busId : '-'} Driver: ${currentDriver ? currentDriver.driverName : '-'}.`;
            setNotifAutoPreview(msg);
            setNotifMessage(msg);
        } else if (type === 'edit') {
            const changed = [];
            const oldRouteBus = busesList.find(b => b.busId === route.busId);
            const oldRouteDriver = driversList.find(d => d.driverId === route.driverId);
            
            const newBusId = formData.busId || '';
            const oldBusId = route.busId || '';
            const newDriverId = formData.driverId || '';
            const oldDriverId = route.driverId || '';
            const newStatus = formData.status || '';
            const oldStatus = route.status || '';
            
            if (route.routeName !== formData.routeName) changed.push(`Route Name: ${route.routeName} → ${formData.routeName}`);
            if (oldBusId !== newBusId) changed.push(`Bus: ${oldRouteBus ? oldRouteBus.busId : '-'} → ${currentBus ? currentBus.busId : '-'}`);
            if (oldDriverId !== newDriverId) changed.push(`Driver: ${oldRouteDriver ? oldRouteDriver.driverName : '-'} → ${currentDriver ? currentDriver.driverName : '-'}`);
            if (oldStatus !== newStatus) changed.push(`Status: ${oldStatus} → ${newStatus}`);
            
            const initialStops = stops.filter(s => s.routeId === route.routeId);
            const oldStopsCount = initialStops.length;
            const newStopsCount = (formData.stopsData || []).length;
            if (oldStopsCount !== newStopsCount || deletedStops.length > 0) {
                let stopChangeText = `Stops: ${oldStopsCount} → ${newStopsCount}`;
                if (deletedStops.length > 0) stopChangeText += ` (${deletedStops.length} deleted)`;
                changed.push(stopChangeText);
            }

            const routeIdDisplay = formData.routeId || route.routeId || '[ID]';
            if (changed.length === 0) {
                const msg = `Route ${routeIdDisplay} updated by admin.`;
                setNotifAutoPreview(msg);
                setNotifMessage(msg);
            } else {
                if (notifStyle === 'style2') { // Bullet format
                    const msg = `Admin updated route ${routeIdDisplay}.\n• ${changed.join('\n• ')}`;
                    setNotifAutoPreview(msg);
                    setNotifMessage(msg);
                } else { // Sentence (professional)
                    const msg = `Admin updated route ${routeIdDisplay}. Changes: ${changed.join('; ')}.`;
                    setNotifAutoPreview(msg);
                    setNotifMessage(msg);
                }
            }
        } else if (type === 'delete') {
            const msg = `Route ${formData.routeId || '[ID]'} (${formData.routeName || '[Name]'}) will be deleted.`;
            setNotifAutoPreview(msg);
            setNotifMessage(msg);
        }
    }, [formData, sendNotification, type, notifStyle, deletedStops, stops, route, busesList, driversList]);


    // -------------------- FIELD VALIDATION (Functionality Maintained) --------------------
    const validateField = (name, value) => {
        if (formData.status !== 'active' && type !== 'delete') return "";

        switch (name) {
            case "routeId":
                if (!value.trim()) return "Route ID is required";
                if (/\s/.test(value)) return "Route ID cannot contain spaces";
                return "";
            case "routeName":
                if (!value.trim()) return "Route name is required";
                return "";
            case "busId":
                if (!value) return "Bus is required";
                return "";
            case "driverId":
                if (!value) return "Driver is required";
                return "";
            default:
                return "";
        }
    };


    const isFormValid = () => {
        if (type === "delete") return true;

        if (formData.status === "active" || type === "add" || (type === "edit" && route.status !== "inactive")) {
            const required = ["routeId", "routeName", "busId", "driverId"];
            let hasError = false;
            for (const f of required) {
                if (validateField(f, formData[f])) {
                    hasError = true;
                    break;
                }
            }
            if (hasError) return false;
            if (routeIdUniqueError) return false;
            if (!stopsValid) return false;
            return true;
        }
        
        if (formData.status === "inactive" && type === "edit") {
                return true; 
        }
        
        return false;
    };


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        const err = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: err }));

        if (name === "routeId") {
            setRouteIdUniqueError("");
            if (value.trim()) {
                axios.get("/api/routes/all")
                    .then(res => {
                        const exists = res.data.some(r => r.routeId === value.trim());
                        if (exists && !(type === "edit" && route.routeId === value.trim())) {
                            setRouteIdUniqueError("This Route ID already exists");
                        }
                    }).catch(() => {});
            }
        }

     if (name === "busId") {
     const bus = busesList.find(b => b.busId === value);
     setFormData(prev => ({ ...prev, plateNumber: bus?.plateNumber || "" }));
}

    };
    
    const handleStatusChange = (e) => {
        const newStatus = e.target.checked ? "active" : "inactive";
        setFormData(prev => ({ ...prev, status: newStatus }));
        if (newStatus === 'inactive') {
                setErrors({});
                setRouteIdUniqueError("");
        }
    }


    const handleSubmit = async () => {
    try {
        if (!isFormValid()) {
            alert("Form invalid — please fix errors");
            return;
        }

        // ================= ROUTE PAYLOAD (ONLY ROUTE DATA) =================
        const payload = {
            routeId: formData.routeId?.trim(),
            routeName: formData.routeName?.trim(),
            busId: formData.busId,
            driverId: formData.driverId,
            status: formData.status,

            morningDeparture: formData.morningDeparture,
            morningArrival: formData.morningArrival,
            eveningDeparture: formData.eveningDeparture,
            eveningArrival: formData.eveningArrival,
        };

        console.log("SENDING ROUTE PAYLOAD:", payload);

        // ================= SAVE ROUTE =================
        if (type === "add") {
            await createRoute(payload);
        }

        if (type === "edit") {
            await updateRoute(payload);
        }

        // ✅ HANDLE DELETE (Stops + Live Node + Route)
        if (type === "delete") {
            try {
                console.log("Deleting Route and all dependencies...");
                
                // 1. Delete All Stops from Firestore
                const stopsRef = collection(firestore, "stops");
                const q = query(stopsRef, where("routeId", "==", formData.routeId));
                const querySnapshot = await getDocs(q);
                
                const deletePromises = querySnapshot.docs.map((d) => deleteDoc(doc(firestore, "stops", d.id)));
                await Promise.all(deletePromises);
                console.log(`Deleted ${querySnapshot.size} stops associated with route ${formData.routeId}`);

                // 2. Delete Live Tracking Node from RTDB
                if (formData.busId) {
                    await remove(ref(rtdb, `bus_data_v2/${formData.busId}`));
                    console.log(`Deleted Live Node for Bus ${formData.busId}`);
                }

                // 3. Delete Route (API)
                await deleteRoute({ routeId: formData.routeId });
                
                onClose();
                return;
            } catch (error) {
                console.error("Error deleting route/stops:", error);
                alert("Error deleting route dependencies. Check console.");
                return;
            }
        }

        // ✅ SYNC RTDB NODE
        if (type === "add" || type === "edit") {
            await set(ref(rtdb, `bus_data_v2/${formData.busId}/current`), {
                lat: 0, lng: 0, speed: 0, timestamp: serverTimestamp()
            });
        }

        // ✅ FIXED DELETION: Actually remove from Firestore
        if (deletedStops.length > 0) {
            for (const stopId of deletedStops) {
                await deleteDoc(doc(firestore, "stops", stopId));
            }
        }

        // ================= SAVE STOPS (FIRESTORE ONLY) =================
        for (let i = 0; i < formData.stopsData.length; i++) {
            const stop = formData.stopsData[i];

            if (!stop.name || stop.lat === "" || stop.lng === "" || !stop.targetTime) {
                throw new Error("Stop fields missing");
            }

            const stopId = stop.stopId || `${formData.routeId}_stop_${Date.now()}_${i}`;

            await setDoc(doc(firestore, "stops", stopId), {
                stopId,
                routeId: formData.routeId,
                name: stop.name,
                lat: Number(stop.lat),
                lng: Number(stop.lng),
                targetTime: stop.targetTime,

                // ✅ ORDER (REQUIRED FOR LIVE TRACKING)
                order: Number.isFinite(Number(stop.order)) ? Number(stop.order) : i + 1,

                status: "active",
                createdAt: serverTimestamp(),
            });
        }

        onClose();
    } catch (err) {
        console.error("SAVE ERROR:", err.response?.data || err);
        alert(err.response?.data?.message || err.message || "Save failed");
    }
};



    


     // const availableBuses = busesList.filter(b => type === "add" ? b.status === "unassigned" : b.status === "unassigned" || b.busId === route.busId);
    //const availableDrivers = driversList.filter(d => type === "add" ? d.status?.toLowerCase() === "unassigned" : d.status?.toLowerCase() === "unassigned" || d.driverId === route.driverId);
const availableBuses = busesList.filter(b =>
    type === "add"
        ? (b.status || "").toLowerCase() === "unassigned"
        : (b.status || "").toLowerCase() === "unassigned" || b.busId === route.busId
);

const availableDrivers = driversList.filter(d =>
    type === "add"
        ? (d.status || "").toLowerCase() === "unassigned"
        : (d.status || "").toLowerCase() === "unassigned" || d.driverId === route.driverId
);

    const saveDisabled = !isFormValid();
    
    const modalTitle = type === "add" ? "Add New Route" : type === "edit" ? "Edit Route" : "Delete Route";


    return (
        <ModalWrapper>
                {/* Inject CSS Styles */}
                <style dangerouslySetInnerHTML={{ __html: FinalModalStyles }} />

                <div className="modal-content">
                        <div className="modal-header">
                                <h2>{modalTitle}</h2>
                                <button className="close-button" onClick={onClose}>
                                        &times;
                                </button>
                        </div>

                        <div className="modal-body">
                                {/* -------------------- ADD/EDIT UI -------------------- */}
                                {(type === "add" || type === "edit") && (
                                        <>
                                                {/* Route Info Section */}
                                                <div className="section">
                                                        <h3>Route Info</h3>
                                                        <div className="section">
  {/*  <h3>Route Timings</h3>

    <div className="form-group">
        <label>Morning Departure</label>
<input
    type="time"
    name="morningDeparture"
    className="text-input time-input"
    value={formData.morningDeparture}
    onChange={handleChange}
    disabled={isDisabled}
/>

    </div>

    <div className="form-group">
        <label>Morning Arrival</label>
        <input
            type="time"
            name="morningArrival"
            className="text-input"
            value={formData.morningArrival}
            onChange={handleChange}
            disabled={isDisabled}
        />
    </div>

    <div className="form-group">
        <label>Evening Departure</label>
        <input
            type="time"
            name="eveningDeparture"
            className="text-input"
            value={formData.eveningDeparture}
            onChange={handleChange}
            disabled={isDisabled}
        />
    </div>

    <div className="form-group">
        <label>Evening Arrival</label>
        <input
            type="time"
            name="eveningArrival"
            className="text-input"
            value={formData.eveningArrival}
            onChange={handleChange}
            disabled={isDisabled}
        />
    </div> */}
</div>

                                                        {/* Route ID */}
                                                        <div className="form-group">
                                                                <label htmlFor="routeId">Route ID</label>
                                                                <input 
                                                                        type="text" 
                                                                        id="routeId" 
                                                                        name="routeId" 
                                                                        className={`text-input ${errors.routeId || routeIdUniqueError ? 'error-input' : ''}`} 
                                                                        value={formData.routeId} 
                                                                        onChange={handleChange} 
                                                                        disabled={type === "edit" || isDisabled} 
                                                                />
                                                                {errors.routeId && <div className="error-message">{errors.routeId}</div>}
                                                                {routeIdUniqueError && <div className="error-message">{routeIdUniqueError}</div>}
                                                        </div>
                                                        
                                                        {/* Route Name */}
                                                        <div className="form-group">
                                                                <label htmlFor="routeName">Route Name</label>
                                                                <input 
                                                                        type="text" 
                                                                        id="routeName" 
                                                                        name="routeName" 
                                                                        className={`text-input ${errors.routeName ? 'error-input' : ''}`} 
                                                                        value={formData.routeName} 
                                                                        onChange={handleChange} 
                                                                        disabled={isDisabled}
                                                                />
                                                                {errors.routeName && <div className="error-message">{errors.routeName}</div>}
                                                        </div>
                                                        
                                                        {/* Assigned Bus */}
                                                        <div className="form-group">
                                                                <label htmlFor="busId">Assigned Bus</label>
                                                                <div className="select-box">
                                                                        <select 
                                                                                id="busId" 
                                                                                name="busId" 
                                                                                value={formData.busId} 
                                                                                onChange={handleChange} 
                                                                                disabled={isDisabled}
                                                                                className={errors.busId ? 'error-input' : ''}
                                                                        >
                                                                                <option value="">Select Bus</option>
                                                                                {availableBuses.map(b => (<option key={b.busId} value={b.busId}>{b.busId}</option>))}
                                                                        </select>
                                                                        <span className="dropdown-arrow"><ChevronDown size={16} color="#777" /></span>
                                                                </div>
                                                                {errors.busId && <div className="error-message">{errors.busId}</div>}
                                                        </div>
                                                        
                                                        {/* Bus PlateNumber (Readonly) */}
                                                        <div className="form-group">
                                                                <label htmlFor="plateNumber">Bus PlateNumber</label>
                                                                <input 
                                                                        type="text" 
                                                                        id="plateNumber" 
                                                                        className="text-input" 
                                                                        value={formData.plateNumber} 
                                                                        readOnly 
                                                                        disabled
                                                                />
                                                        </div>
                                                        
                                                        {/* Assigned Driver */}
                                                        <div className="form-group">
                                                                <label htmlFor="driverId">Assigned Driver</label>
                                                                <div className="select-box">
                                                                        <select 
                                                                                id="driverId" 
                                                                                name="driverId" 
                                                                                value={formData.driverId} 
                                                                                onChange={handleChange} 
                                                                                disabled={isDisabled}
                                                                                className={errors.driverId ? 'error-input' : ''}
                                                                        >
                                                                                <option value="">Select Driver</option>
                                                                                {availableDrivers.map(d => (<option key={d.driverId} value={d.driverId}>{d.driverName}</option>))}
                                                                        </select>
                                                                        <span className="dropdown-arrow"><ChevronDown size={16} color="#777" /></span>
                                                                </div>
                                                                {errors.driverId && <div className="error-message">{errors.driverId}</div>}
                                                        </div>
                                                </div>
                                                
                                                {/* Route Stops Section - Integrate StopsSection */}
                                                <div className="section">
                                                        <StopsSection
                                                                stopsData={formData.stopsData}
                                                                setStopsData={(updatedStops) => setFormData(prev => ({ ...prev, stopsData: updatedStops }))}
                                                                setDeletedStops={setDeletedStops}
                                                                disabled={isDisabled}
                                                                setValid={setStopsValid}
                                                        />
                                                </div>

                                                {/* Route Activity Section */}
                                                <div className="section">
                                                        <h3>Route Activity</h3>
                                                        <div className="active-status-group">
                                                                <div className="status-display">
                                                                        Route is currently **{formData.status === 'active' ? 'operational' : 'inactive'}**
                                                                </div>
                                                                <label className="switch">
                                                                        <input 
                                                                                type="checkbox" 
                                                                                checked={formData.status === 'active'} 
                                                                                onChange={handleStatusChange} 
                                                                        />
                                                                        <span className="slider round"></span>
                                                                </label>
                                                        </div>
                                                </div>
                                        </>
                                )}
                                
                                {/* -------------------- DELETE UI -------------------- */}
                                {type === "delete" && (
                                     <div className="section" style={{ padding: '20px 0' }}>
                                        <p style={{ fontSize: '1.1em', textAlign: 'center' }}>
                                            Are you sure you want to delete route <b>{formData.routeName} ({formData.routeId})</b>?<br/>
                                            <span style={{color:'red', fontSize:'0.9em'}}>(This will permanently delete Route, All Stops & Live Tracking Data)</span>
                                        </p>
                                     </div>
                                )}


                                {/* -------------------- Notification Section -------------------- */}
                             

                        </div>
                        
                        {/* -------------------- FOOTER/BUTTONS -------------------- */}
                        <div className="modal-footer">
                                <button className="cancel-button" onClick={onClose}>
                                        Cancel
                                </button>
                                <button 
                                        className="update-button" 
                                        onClick={handleSubmit} 
                                        disabled={saveDisabled}
                                >
                                        {type === "delete"
    ? "Delete Route"
    : type === "add"
    ? "Add Route"
    : "Update Route"}
                                </button>
                        </div>
                </div>
        </ModalWrapper>
    );
}