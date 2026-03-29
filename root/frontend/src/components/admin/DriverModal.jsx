import React, { useEffect, useState } from "react"; 
import { ChevronDown } from "lucide-react";
import { createDriver, updateDriver, fetchDrivers } from "../../services/driverService";
import { fetchAvailableRFIDs } from "../../api/studentApi"; 

const FinalModalStyles = `
.modal-overlay { position: fixed; top:0; left:0; right:0; bottom:0; background-color: rgba(0,0,0,0.4); display:flex; justify-content:center; align-items:center; z-index:1000; }
.modal-content { background: #fff; border-radius: 8px; width: 95%; max-width: 600px; max-height: 90vh; overflow:hidden; display:flex; flex-direction: column; font-family: 'Roboto', sans-serif; color:#333; position: relative; box-sizing:border-box; }
.modal-header { display:flex; justify-content:center; align-items:center; padding:20px 25px 15px 25px; flex-shrink:0; position:relative; }
.modal-header h2 { margin:0; font-size:1.3em; font-weight:600; text-align:center; }
.close-button { display:block; background:none; border:none; font-size:1.5em; color:#888; line-height:1; padding:0; position:absolute; right:20px; top:20px; cursor:pointer; }
.modal-body { padding:0 25px 20px 25px; flex-grow:1; overflow-y:auto; box-sizing:border-box; }
.form-group { margin-bottom:20px; position:relative; }
.form-group label { font-size:0.9em; color:#4A4A4A; margin-bottom:8px; display:block; font-weight:500; }
.text-input { width:100%; padding:10px 12px; border:1px solid #D7D7D7 !important; border-radius:6px; background:#FAFAFA; font-size:1em; box-sizing:border-box; }
.select-box { display:flex; align-items:center; cursor:pointer; width:100%; padding:10px 12px; border:1px solid #D7D7D7; border-radius:6px; background:#FAFAFA; position:relative; box-sizing:border-box; }
.select-box select { border:none; flex-grow:1; background:transparent; font-size:1em; cursor:pointer; appearance:none; width: 100%; }
.dropdown-arrow { position:absolute; right:12px; pointer-events:none; }
.modal-footer { display:flex; justify-content:center; align-items:center; gap:20px; padding:25px 0 30px 0; margin-top:5px; }
.update-button { background-color:#132677; color:white; border:none; padding:10px 20px; border-radius:8px; cursor:pointer; font-size:1em; font-weight:600; }
.cancel-button { background:none; border:none; color:#626262; font-size:1em; font-weight:500; cursor:pointer; }
`;

export default function DriverModal({ type, driver = {}, onClose, onSaved, deleteConfirm=false, assignedRoute="" }) {
  const [formData, setFormData] = useState({
    driverId:"", driverName:"", phoneNumber:"", busId:"", routeId:"", status:"unassigned", rfid_id: ""
  });
  const [rfidPool, setRfidPool] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetchAvailableRFIDs();
        setRfidPool(res.data.rfids || []);
      } catch(e) {}
    };
    loadData();

    if(type==="edit" && driver){
      setFormData({
        driverId:driver.driverId||"",
        // Check for both driverName and name from DB
        driverName:driver.driverName||driver.name||"",
        phoneNumber:driver.phoneNumber||driver.PhoneNumber||"",
        busId:driver.busId||"",
        routeId:driver.routeId||"",
        status:driver.status||"unassigned",
        rfid_id: driver.rfid_id || ""
      });
    }
  }, [type, driver]);

  const handleChange=(e)=>{
    const{name,value}=e.target;
    setFormData(p=>({...p,[name]:value}));
  };

  const handleSubmit=async()=>{
    setIsSubmitting(true);
    
    // 1. Clean the name and add suffix
    let rawName = formData.driverName ? formData.driverName.trim() : "";
    let finalName = rawName.endsWith(" Driver") ? rawName : `${rawName} Driver`;

    // 2. Prepare data for Database (Sending both 'name' and 'driverName')
    const submissionData = { 
      ...formData, 
      driverName: finalName,
      name: finalName 
    };

    try{
      if(type==="add") await createDriver(submissionData);
      else await updateDriver(submissionData);
      onSaved && onSaved();
      onClose();
    } catch(err){
      setErrors({global: err?.response?.data?.message || "Failed"});
    } finally{ setIsSubmitting(false); }
  };

  return(
    <div className="modal-overlay">
      <style dangerouslySetInnerHTML={{__html:FinalModalStyles}} />
      <div className="modal-content">
        <div className="modal-header">
          <h2>{type==="add" ? "Register New Driver" : "Edit Driver Details"}</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          {errors.global && <p style={{color: 'red', textAlign: 'center'}}>{errors.global}</p>}
          <div className="form-group">
            <label>Driver ID</label>
            <input name="driverId" className="text-input" value={formData.driverId} disabled={type==="edit"} onChange={handleChange}/>
          </div>
          <div className="form-group">
            <label>Full Name</label>
            <input name="driverName" className="text-input" value={formData.driverName} onChange={handleChange}/>
          </div>

          <div className="form-group">
            <label>Assign Attendance RFID (Available)</label>
            <div className="select-box">
              <select name="rfid_id" value={formData.rfid_id} onChange={handleChange}>
                <option value="">-- No Card Assigned --</option>
                {rfidPool.map(r => <option key={r.id} value={r.value}>{r.value}</option>)}
              </select>
              <span className="dropdown-arrow"><ChevronDown size={16} color="#777"/></span>
            </div>
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input name="phoneNumber" className="text-input" value={formData.phoneNumber} onChange={handleChange}/>
          </div>

          {type === "edit" && (
              <div className="form-group">
                <label>Status</label>
                <div className="select-box">
                    <select name="status" value={formData.status} onChange={handleChange}>
                        <option value="unassigned">Unassigned</option>
                        <option value="on leave">On Leave</option>
                        <option value="assigned" disabled>Assigned (Via Routes)</option>
                    </select>
                    <span className="dropdown-arrow"><ChevronDown size={16} color="#777"/></span>
                </div>
              </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="cancel-button" onClick={onClose}>Cancel</button>
          <button className="update-button" onClick={handleSubmit} disabled={isSubmitting}>
            {type==="add" ? "Register Driver" : "Update Driver"}
          </button>
        </div>
      </div>
    </div>
  );
}