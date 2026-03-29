


// //after UI
// import React, { useState, useEffect } from "react";
// import { ChevronDown } from "lucide-react";
// import { createBus, updateBus, fetchBuses } from "../../services/busService";

// const BusModalStyles = `/* same styles as before, unchanged */ 
// .modal-overlay { position: fixed; top:0; left:0; right:0; bottom:0; background-color: rgba(0,0,0,0.4); display:flex; justify-content:center; align-items:center; z-index:1000; }
// .modal-content { background: #fff; border-radius: 8px; width: 95%; max-width: 600px; max-height: 90vh; overflow:hidden; display:flex; flex-direction: column; font-family: 'Roboto', sans-serif; color:#333; position: relative; box-sizing:border-box; padding:0; }
// .modal-header { display:flex; justify-content:center; align-items:center; padding:20px 25px 15px 25px; flex-shrink:0; position:relative; }
// .modal-header h2 { margin:0; font-size:1.3em; font-weight:600; text-align:center; }
// .close-button { display:block; background:none; border:none; font-size:1.5em; color:#888; line-height:1; padding:0; position:absolute; right:20px; top:20px; cursor:pointer; }
// .close-button:hover, .close-button:focus, .close-button:active { background:none; color:#888; outline:none; box-shadow:none; }
// .modal-body { padding:0 25px 20px 25px; flex-grow:1; overflow-y:auto; box-sizing:border-box; }
// .section { margin-bottom:25px; }
// .form-group { margin-bottom:20px; position:relative; }
// .form-group label { font-size:0.9em; color:#4A4A4A; margin-bottom:8px; display:block; font-weight:500; }
// .text-input { width:100%; padding:10px 12px; border:1px solid #D7D7D7; border-radius:6px; background:#FAFAFA; font-size:1em; box-sizing:border-box; min-width:0; }
// .text-error { color:red; font-size:0.85em; margin-top:4px; position:absolute; bottom:-18px; left:0; }
// .select-box { display:flex; align-items:center; cursor:pointer; width:100%; padding:10px 12px; border:1px solid #D7D7D7; border-radius:6px; background:#FAFAFA; position:relative; box-sizing:border-box; }
// .select-box select { border:none; flex-grow:1; background:transparent; font-size:1em; cursor:pointer; -webkit-appearance:none; -moz-appearance:none; appearance:none; }
// .dropdown-arrow { position:absolute; right:12px; pointer-events:none; }
// .modal-footer { display:flex; justify-content:center; align-items:center; gap:20px; padding:25px 0 30px 0; margin-top:5px; }
// .cancel-button { background:none;cursor:pointer; border:none; color:#626262; font-size:1em; font-weight:500; cursor:text; outline:none; box-shadow:none; }
// .cancel-button:hover, .cancel-button:focus, .cancel-button:active { background:none; color:#626262; cursor:pointer; outline:none; box-shadow:none; }
// .update-button { background-color:#132677; color:white; border:none; padding:10px 20px; border-radius:8px; cursor:pointer; font-size:1em; font-weight:600; margin-bottom:10px; }
// .alert-box { border-radius:6px; padding:15px; margin-top:10px; display:flex; align-items:flex-start; gap:15px; background:#fff7f7; border:1.5px solid #d40000; }
// .alert-icon { width:40px; height:40px; }
// .alert-text-main { color:#d40000; font-weight:700; font-size:1em; }
// .alert-text-sub { color:#555; margin-top:3px; line-height:1.4; }
// @media(max-width:600px) { .modal-content { border-radius:0; width:100%; max-height:100vh; } .modal-header { padding:15px; } .modal-body { padding:0 15px 15px 15px; } .modal-footer { flex-direction:column; gap:10px; } }
// `;
// //frontend/src/components/BusModal.jsx
// // export default function BusModal({ type, bus = {}, onClose, onSaved }) {
// //   const [formData, setFormData] = useState({ busId: "", plateNumber: "", status: "unassigned" });
// //   const [fieldErrors, setFieldErrors] = useState({});
// //   const [isSubmitting, setIsSubmitting] = useState(false);
// //   const [confirmAlert, setConfirmAlert] = useState(null);
// //   const [allBuses, setAllBuses] = useState([]);

// //   // Fetch all buses for real-time uniqueness check
// //   useEffect(() => {
// //     let mounted = true;
// //     (async () => {
// //       try {
// //         const buses = await fetchBuses();
// //         if (mounted) setAllBuses(buses || []);
// //       } catch {}
// //     })();
// //     return () => { mounted = false; };
// //   }, []);

// //   useEffect(() => {
// //     if (type === "edit" && bus) {
// //       setFormData({
// //         busId: bus.busId || "",
// //         plateNumber: bus.plateNumber || "",
// //         status: bus.status || "unassigned",
// //         capacity:""
// //       });
// //     } else {
// //       setFormData({ busId: "", plateNumber: "", status: "unassigned",capacity:"" });
// //     }
// //     setFieldErrors({});
// //     setConfirmAlert(null);
// //   }, [bus, type]);

// //   const validators = {
// //     busId: v => !!v && /^[\w-]+$/.test(v) ? "" : "Bus ID required; letters, numbers, _ or - allowed.",
// //     plateNumber: v => !!v ? "" : "Plate Number is required"
// //   };

// //   const handleChange = e => {
// //     const { name, value } = e.target;
// //     setFormData(prev => ({ ...prev, [name]: value }));

// //     // Real-time validation
// //     if (validators[name]) {
// //       const msg = validators[name](value);
// //       setFieldErrors(prev => ({ ...prev, [name]: msg }));
// //     }

// //     // Real-time uniqueness check for busId in Add modal (case-insensitive)
// //     if (name === "busId" && type === "add") {
// //       const exists = allBuses.find(b => b.busId.toLowerCase() === value.toLowerCase());
// //       setFieldErrors(prev => ({ ...prev, busId: exists ? "Bus ID already exists" : prev.busId }));
// //     }

// //     // Real-time alert for edit modal status
// //     if (type === "edit" && name === "status" && bus.routeId) {
// //       if ((value === "unassigned" || value === "maintenance") && bus.routeId) {
// //         setConfirmAlert({
// //           title: "Bus is assigned",
// //           message: `This bus is assigned to route ${bus.routeId}. Reassign the route first before changing status.`
// //         });
// //       } else setConfirmAlert(null);
// //     }
// //   };

// //   const validateAll = () => {
// //     const errs = {};
// //     Object.keys(validators).forEach(f => {
// //       const msg = validators[f](formData[f]);
// //       if (type === "add" && f === "busId" && allBuses.find(b => b.busId.toLowerCase() === formData[f].toLowerCase())) {
// //         errs[f] = "Bus ID already exists";
// //       } else if (msg) errs[f] = msg;
// //     });
// //     setFieldErrors(errs);
// //     return Object.keys(errs).length === 0;
// //   };

// //   const handleSubmit = async () => {
// //     if (!validateAll()) return;
// //     setIsSubmitting(true);
// //     try {
// //       if (type === "add") {
// //         await createBus(formData);
// //       } else {
// //         await updateBus(formData);
// //       }
// //       onSaved && onSaved();
// //       onClose();
// //     } catch (err) {
// //       setConfirmAlert({ title: "Error", message: err.response?.data?.message || "Failed" });
// //     } finally {
// //       setIsSubmitting(false);
// //     }
// //   };

// //   return (
// //     <div className="modal-overlay">
// //       <style dangerouslySetInnerHTML={{ __html: BusModalStyles }} />
// //       <div className="modal-content">
// //         <div className="modal-header">
// //           <h2>{type === "add" ? "Add Bus" : "Edit Bus"}</h2>
// //           <button className="close-button" onClick={onClose}>&times;</button>
// //         </div>

// //         <div className="modal-body">
// //           <div className="section">
// //             <div className="form-group">
// //               <label>Bus ID</label>
// //               <input
// //                 name="busId"
// //                 className="text-input"
// //                 value={formData.busId}
// //                 disabled={type === "edit"}
// //                 onChange={handleChange}
// //               />
// //               {fieldErrors.busId && <div className="text-error">{fieldErrors.busId}</div>}
// //             </div>

// //             <div className="form-group">
// //               <label>Plate Number</label>
// //               <input
// //                 name="plateNumber"
// //                 className="text-input"
// //                 value={formData.plateNumber}
// //                 onChange={handleChange}
// //               />
// //               {fieldErrors.plateNumber && <div className="text-error">{fieldErrors.plateNumber}</div>}
// //             </div>
// // <div className="form-group">
// //   <label>Capacity (Seats)</label>
// //   <input
// //     type="number"
// //     name="capacity"
// //     className="text-input"
// //     value={formData.capacity}
// //     onChange={handleChange}
// //     min={1}
// //     placeholder="e.g. 64"
// //     required
// //   />
// // </div>


// //             <div className="form-group">
// //               <label>Status</label>
// //               {type === "add" ? (
// //                 <input
// //                   name="status"
// //                   className="text-input"
// //                   value="unassigned"
// //                   disabled
// //                 />
// //               ) : (
// //                 <div className="select-box">
// //                   <select
// //                     name="status"
// //                     value={formData.status}
// //                     onChange={handleChange}
// //                   >
// //                     <option value="assigned" disabled>Assigned</option>
// //                     <option value="unassigned">Unassigned</option>
// //                     <option value="maintenance">Maintenance</option>
// //                   </select>
// //                   <span className="dropdown-arrow"><ChevronDown size={16} color="#777" /></span>
// //                 </div>
// //               )}
// //             </div>

// //             {confirmAlert && (
// //               <div className="alert-box">
// //                 <img className="alert-icon" src="https://cdn-icons-png.flaticon.com/512/463/463612.png" alt="alert" />
// //                 <div>
// //                   <div className="alert-text-main">{confirmAlert.title}</div>
// //                   <div className="alert-text-sub">{confirmAlert.message}</div>
// //                 </div>
// //               </div>
// //             )}
// //           </div>
// //         </div>

// //         <div className="modal-footer">
// //           <button className="cancel-button" onClick={onClose}>Cancel</button>
// //           <button className="update-button" onClick={handleSubmit} disabled={isSubmitting || !!confirmAlert}>
// //             {type === "add" ? "Add Bus" : "Save Bus"}
// //           </button>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }
//  //frontend//src//components//admin//BusModal.jsx
// export default function BusModal({ type, bus = {}, onClose, onSaved }) {
//   const [formData, setFormData] = useState({
//     busId: "",
//     plateNumber: "",
//     status: "unassigned",
//     capacity: ""
//   });

//   const [fieldErrors, setFieldErrors] = useState({});
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [confirmAlert, setConfirmAlert] = useState(null);
//   const [allBuses, setAllBuses] = useState([]);

//   // fetch buses for uniqueness check
//   useEffect(() => {
//     fetchBuses().then(b => setAllBuses(b || [])).catch(() => {});
//   }, []);

//   // populate edit modal
//   useEffect(() => {
//     if (type === "edit" && bus) {
//       setFormData({
//         busId: bus.busId || "",
//         plateNumber: bus.plateNumber || "",
//         status: bus.status || "unassigned",
//         capacity: bus.capacity ?? ""
//       });
//     } else {
//       setFormData({
//         busId: "",
//         plateNumber: "",
//         status: "unassigned",
//         capacity: ""
//       });
//     }
//     setFieldErrors({});
//     setConfirmAlert(null);
//   }, [bus, type]);

//   // ✅ VALIDATORS (INCLUDING CAPACITY)
//   const validators = {
//     busId: v =>
//       !!v && /^[\w-]+$/.test(v)
//         ? ""
//         : "Bus ID required (letters, numbers, _ or -)",
//     plateNumber: v => (!!v ? "" : "Plate Number is required"),
//     capacity: v =>
//       v !== "" && Number(v) > 0
//         ? ""
//         : "Capacity must be greater than 0"
//   };

//   const handleChange = e => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));

//     if (validators[name]) {
//       setFieldErrors(prev => ({ ...prev, [name]: validators[name](value) }));
//     }

//     if (name === "busId" && type === "add") {
//       const exists = allBuses.find(
//         b => b.busId.toLowerCase() === value.toLowerCase()
//       );
//       if (exists) {
//         setFieldErrors(prev => ({ ...prev, busId: "Bus ID already exists" }));
//       }
//     }

//     if (type === "edit" && name === "status" && bus.routeId) {
//       if (value !== "assigned") {
//         setConfirmAlert({
//           title: "Bus is assigned",
//           message: `Bus is assigned to route ${bus.routeId}. Unassign route first.`
//         });
//       } else setConfirmAlert(null);
//     }
//   };

//   const validateAll = () => {
//     const errs = {};
//     Object.keys(validators).forEach(f => {
//       const msg = validators[f](formData[f]);
//       if (msg) errs[f] = msg;
//     });
//     setFieldErrors(errs);
//     return Object.keys(errs).length === 0;
//   };

//   const handleSubmit = async () => {
//     if (!validateAll()) return;
//     setIsSubmitting(true);

//     try {
//       const payload = {
//         ...formData,
//         capacity: Number(formData.capacity) // ✅ store as NUMBER
//       };

//       if (type === "add") await createBus(payload);
//       else await updateBus(payload);

//       onSaved?.();
//       onClose();
//     } catch (err) {
//       setConfirmAlert({
//         title: "Error",
//         message: err.response?.data?.message || "Failed to save bus"
//       });
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="modal-overlay">
//       <div className="modal-content">
//         <div className="modal-header">
//           <h2>{type === "add" ? "Add Bus" : "Edit Bus"}</h2>
//           <button onClick={onClose}>&times;</button>
//         </div>

//         <div className="modal-body">
//           <div className="form-group">
//             <label>Bus ID</label>
//             <input
//               name="busId"
//               value={formData.busId}
//               disabled={type === "edit"}
//               onChange={handleChange}
//             />
//             {fieldErrors.busId && <div className="text-error">{fieldErrors.busId}</div>}
//           </div>

//           <div className="form-group">
//             <label>Plate Number</label>
//             <input
//               name="plateNumber"
//               value={formData.plateNumber}
//               onChange={handleChange}
//             />
//             {fieldErrors.plateNumber && (
//               <div className="text-error">{fieldErrors.plateNumber}</div>
//             )}
//           </div>

//           <div className="form-group">
//             <label>Capacity (Seats)</label>
//             <input
//               type="number"
//               name="capacity"
//               min="1"
//               value={formData.capacity}
//               onChange={handleChange}
//               placeholder="e.g. 64"
//             />
//             {fieldErrors.capacity && (
//               <div className="text-error">{fieldErrors.capacity}</div>
//             )}
//           </div>

//           <div className="form-group">
//             <label>Status</label>
//             {type === "add" ? (
//               <input value="unassigned" disabled />
//             ) : (
//               <select name="status" value={formData.status} onChange={handleChange}>
//                 <option value="assigned">Assigned</option>
//                 <option value="unassigned">Unassigned</option>
//                 <option value="maintenance">Maintenance</option>
//               </select>
//             )}
//           </div>

//           {confirmAlert && (
//             <div className="alert-box">
//               <b>{confirmAlert.title}</b>
//               <p>{confirmAlert.message}</p>
//             </div>
//           )}
//         </div>

//         <div className="modal-footer">
//           <button onClick={onClose}>Cancel</button>
//           <button onClick={handleSubmit} disabled={isSubmitting || confirmAlert}>
//             {type === "add" ? "Add Bus" : "Save Bus"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }


import React, { useState, useEffect } from "react";  //frontend//src//components//admin//BusModal.jsxc
import { ChevronDown } from "lucide-react";
import { createBus, updateBus, fetchBuses } from "../../services/busService";

/* =========================
   MODAL STYLES
========================= */
const BusModalStyles = `
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0,0,0,0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  pointer-events: auto;
}
.modal-content {
  background: #fff;
  border-radius: 8px;
  width: 95%;
  max-width: 600px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  font-family: 'Roboto', sans-serif;
   pointer-events: auto;
}
.modal-header {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px 25px 15px;
  position: relative;
}
.modal-header h2 {
  margin: 0;
  font-size: 1.3em;
  font-weight: 600;
}
.close-button {
  background: none;
  border: none;
  font-size: 1.5em;
  position: absolute;
  right: 20px;
  top: 18px;
  cursor: pointer;
}
.modal-body {
  padding: 0 25px 20px;
  overflow-y: auto;
}
.form-group {
  margin-bottom: 20px;
}
.form-group label {
  font-size: 0.9em;
  margin-bottom: 6px;
  display: block;
  font-weight: 500;
   color: #333; /* add this, dark color for visibility */
}
.text-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #D7D7D7;
  border-radius: 6px;
  background: #FAFAFA;
  font-size: 1em;
  border: 1px solid #D7D7D7 !important;
}
.text-error {
  color: red;
  font-size: 0.85em;
  margin-top: 4px;
}
.select-box {
  position: relative;
}
.select-box select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #D7D7D7;
  border-radius: 6px;
  background: #FAFAFA;
  appearance: none;
}
.dropdown-arrow {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}
.modal-footer {
  display: flex;
  justify-content: center;
  gap: 20px;
  padding: 20px;
}
.cancel-button {
  background: none;
  border: none;
  font-size: 1em;
  cursor: pointer;
}
.update-button {
  background-color: #132677;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}
.alert-box {
  border: 1px solid #d40000;
  background: #fff7f7;
  padding: 12px;
  border-radius: 6px;
  margin-top: 10px;
}
`;

/* =========================
   COMPONENT
========================= */
export default function BusModal({ type, bus = {}, onClose, onSaved }) {
  const [formData, setFormData] = useState({
    busId: "",
    plateNumber: "",
    status: "unassigned",
    capacity: ""
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmAlert, setConfirmAlert] = useState(null);
  const [allBuses, setAllBuses] = useState([]);

  useEffect(() => {
    fetchBuses().then(b => setAllBuses(b || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (type === "edit" && bus) {
      setFormData({
        busId: bus.busId || "",
        plateNumber: bus.plateNumber || "",
        status: bus.status || "unassigned",
        capacity: bus.capacity ?? ""
      });
    } else {
      setFormData({
        busId: "",
        plateNumber: "",
        status: "unassigned",
        capacity: ""
      });
    }
    setFieldErrors({});
    setConfirmAlert(null);
  }, [bus, type]);

  const validators = {
    busId: v => (!!v ? "" : "Bus ID is required"),
    plateNumber: v => (!!v ? "" : "Plate Number is required"),
    capacity: v =>
      v !== "" && Number(v) > 0 ? "" : "Capacity must be greater than 0"
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (validators[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: validators[name](value) }));
    }
  };

  const validateAll = () => {
    const errs = {};
    Object.keys(validators).forEach(f => {
      const msg = validators[f](formData[f]);
      if (msg) errs[f] = msg;
    });
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateAll()) return;
    setIsSubmitting(true);
    try {
      const payload = { ...formData, capacity: Number(formData.capacity) };
      type === "add" ? await createBus(payload) : await updateBus(payload);
      onSaved?.();
      onClose();
    } catch (err) {
      setConfirmAlert({ title: "Error", message: "Failed to save bus" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <style dangerouslySetInnerHTML={{ __html: BusModalStyles }} />

      <div className="modal-content">
        <div className="modal-header">
          <h2>{type === "add" ? "Add Bus" : "Edit Bus"}</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label>Bus ID</label>
            <input
              className="text-input"
              name="busId"
              placeholder="Enter Bus ID (e.g. bus_150)"
              value={formData.busId}
              disabled={type === "edit"}
              onChange={handleChange}
            />
            {fieldErrors.busId && <div className="text-error">{fieldErrors.busId}</div>}
          </div>

          <div className="form-group">
            <label>Plate Number</label>
            <input
              className="text-input"
              name="plateNumber"
              placeholder="Enter Plate Number"
              value={formData.plateNumber}
              onChange={handleChange}
            />
            {fieldErrors.plateNumber && <div className="text-error">{fieldErrors.plateNumber}</div>}
          </div>

          <div className="form-group">
            <label>Capacity (Seats)</label>
            <input
              className="text-input"
              type="number"
              name="capacity"
              min="1"
              value={formData.capacity}
              onChange={handleChange}
              placeholder="e.g. 64"
            />
            {fieldErrors.capacity && <div className="text-error">{fieldErrors.capacity}</div>}
          </div>

          <div className="form-group">
            <label>Status</label>
            {type === "add" ? (
              <input className="text-input" value="unassigned" disabled />
            ) : (
              <div className="select-box">
                <select name="status" value={formData.status} onChange={handleChange}>
                  <option value="assigned">Assigned</option>
                  <option value="unassigned">Unassigned</option>
                  <option value="maintenance">Maintenance</option>
                </select>
                <span className="dropdown-arrow">
                  <ChevronDown size={16} />
                </span>
              </div>
            )}
          </div>

          {confirmAlert && (
            <div className="alert-box">
              <b>{confirmAlert.title}</b>
              <p>{confirmAlert.message}</p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="cancel-button" onClick={onClose}>Cancel</button>
          <button className="update-button" onClick={handleSubmit} disabled={isSubmitting}>
            {type === "add" ? "Add Bus" : "Save Bus"}
          </button>
        </div>
      </div>
    </div>
  );
}
