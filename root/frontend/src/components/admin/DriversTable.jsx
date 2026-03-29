import React, { useEffect, useMemo, useState } from "react";
import styled, { css } from "styled-components";
import DriverModal from "./DriverModal";
import { Edit, Trash2, Plus, Search, CreditCard } from "lucide-react";
import { fetchDrivers, deleteDriver } from "../../services/driverService";
import { fetchAvailableRFIDs } from "../../api/studentApi";
import axios from "axios";
import Sidebar from "../Sidebar";
import Header from "../Header";
import AssignRFIDModal from "../AssignRFIDModal";

const Container = styled.div`
    padding: 100px 40px 40px 280px; 
    min-height: 80vh;
    box-sizing: border-box;
    @media (max-width: 768px) { padding: 100px 20px; }
`;

const Card = styled.div`
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15); 
    padding: 24px;
`;

const TableHeader = styled.div` display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; `;
const Title = styled.h2` font-size: 24px; font-weight: 700; color: #333; `;
const AddButton = styled.button` display: flex; align-items: center; gap: 8px; padding: 10px 18px; background-color: #132677; color: white; border: none; border-radius: 8px; cursor: pointer; transition: 0.2s; &:hover { background-color: #0d1a4d; } `;
const Controls = styled.div` display: flex; gap: 16px; margin-bottom: 24px; `;
const SearchContainer = styled.div` flex-grow: 1; position: relative; max-width: 700px; `;
const SearchInput = styled.input` width: 100%; padding: 10px 10px 10px 40px; border: 1px solid #D7D7D7; border-radius: 8px; background-color: #FCFCFC; `;
const SearchIcon = styled(Search)` position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #5D5D5D; `;
const TableWrapper = styled.div` width: 100%; overflow-x: auto; border-radius: 8px; border: 1px solid #ebebebff; `;
const Table = styled.table` width: 100%; border-collapse: collapse; font-size: 14px; thead { background-color: #f7f7f7; } th { padding: 12px 16px; text-align: left; font-weight: 600; color: #666; } td { padding: 14px 16px; border-bottom: 1px solid #f0f0f0; color: #333; } `;

const StatusPill = styled.div`
    display: inline-flex; padding: 2px 10px; border-radius: 16px; font-weight: 600; font-size: 11px; text-transform: capitalize;
    ${(props) => props.$status === 'assigned' && css` background-color: #C5F99E; color: #16A249; border: 1px solid #16A249; `}
    ${(props) => props.$status === 'unassigned' && css` background-color: #F0F0F0; color: #777; border: 1px solid #777; `}
    ${(props) => props.$status === 'on leave' && css` background-color: #FFECB3; color: #FFA000; border: 1px solid #FFA000; `}
`;

const ActionButton = styled.button` background: none; border: none; color: #999; cursor: pointer; margin-left: 10px; display: inline-flex; align-items: center; &:hover { color: #1a4d90; } `;

export default function DriversTable() {
    const [drivers, setDrivers] = useState([]);
    const [rfids, setRfids] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalType, setModalType] = useState(null);
    const [showRFIDModal, setShowRFIDModal] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    const loadDrivers = async () => {
        setLoading(true);
        try { 
            const list = await fetchDrivers(); 
            setDrivers(list || []); 
        } catch (e) { 
            console.error("Fetch Drivers Error:", e); 
        } finally { 
            setLoading(false); 
        }
    };

    const loadRFIDs = async () => {
        try { 
            const res = await fetchAvailableRFIDs(); 
            setRfids(res.data.rfids || []); 
        } catch (e) { 
            console.error("Fetch RFIDs Error:", e); 
        }
    };

    useEffect(() => { loadDrivers(); loadRFIDs(); }, []);

    // Fixed filtering logic to check both name and driverName
    const filtered = useMemo(() => {
        return drivers.filter(d => 
            (d.driverName || d.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
            (d.driverId || d._id || "").toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [drivers, searchTerm]);

    // Handle Delete with proper ID check
    const handleDelete = async (driver) => {
        const idToDelete = driver.driverId || driver._id; // Fallback to _id if driverId is missing
        if(window.confirm(`Are you sure you want to delete driver ${driver.driverName || driver.name}?`)) {
            try {
                await deleteDriver(idToDelete);
                alert("Driver deleted successfully");
                loadDrivers(); 
            } catch (error) {
                console.error("Delete Error:", error);
                alert("Failed to delete driver. Check console for details.");
            }
        }
    };

    return (
        <>
            <Header /><Sidebar />
            <Container>
                <Card>
                    <TableHeader>
                        <Title>Drivers Management</Title>
                        <AddButton onClick={() => { setSelectedDriver(null); setModalType("add"); }}><Plus size={20} /> Add Driver</AddButton>
                    </TableHeader>
                    <Controls>
                        <SearchContainer>
                            <SearchIcon />
                            <SearchInput placeholder="Search by name or ID..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                        </SearchContainer>
                    </Controls>
                    {loading ? <p>Loading...</p> : (
                        <TableWrapper>
                            <Table>
                                <thead>
                                    <tr><th>Name</th><th>RFID ID</th><th>Bus / Route</th><th>Status</th><th>Actions</th></tr>
                                </thead>
                                <tbody>
                                    {filtered.length > 0 ? filtered.map(d => (
                                        <tr key={d.driverId || d._id}>
                                            {/* Fix: Display d.name if d.driverName is undefined */}
                                            <td>{d.driverName || d.name || "N/A"}</td>
                                            <td>
                                               <span style={{background: d.rfid_id ? '#eee' : '#fff1f0', color: d.rfid_id ? '#333' : '#cf1322', padding: '2px 8px', borderRadius: '4px', fontFamily: 'monospace'}}>
                                                   {d.rfid_id || "Not Assigned"}
                                               </span>
                                            </td>
                                            <td>{d.busId || "-"} / {d.routeId || "No Route"}</td>
                                            <td><StatusPill $status={d.status}>{d.status || 'unassigned'}</StatusPill></td>
                                            <td>
                                                 <ActionButton title="Assign RFID" onClick={() => {setSelectedDriver(d); setShowRFIDModal(true);}}><CreditCard size={18}/></ActionButton>
                                                 <ActionButton title="Edit Driver" onClick={() => {setSelectedDriver(d); setModalType("edit");}}><Edit size={18}/></ActionButton>
                                                 <ActionButton title="Delete" onClick={() => handleDelete(d)}><Trash2 size={18}/></ActionButton>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="5" style={{textAlign: 'center'}}>No drivers found.</td></tr>
                                    )}
                                </tbody>
                            </Table>
                        </TableWrapper>
                    )}
                </Card>
            </Container>

            <AssignRFIDModal 
                isOpen={showRFIDModal}
                onClose={() => setShowRFIDModal(false)}
                student={selectedDriver}
                rfids={rfids}
                onSave={async (rfidValue) => {
                    try {
                        await axios.put("http://localhost:5000/api/drivers/assign-rfid", {
                            driverId: selectedDriver.driverId || selectedDriver._id,
                            rfid_id: rfidValue 
                        });
                        setShowRFIDModal(false);
                        loadDrivers();
                        loadRFIDs();
                    } catch (e) { alert("Error assigning RFID"); }
                }}
            />

            {(modalType === "add" || modalType === "edit") && (
                <DriverModal type={modalType} driver={selectedDriver} onClose={()=>setModalType(null)} onSaved={loadDrivers} />
            )}
        </>
    );
}