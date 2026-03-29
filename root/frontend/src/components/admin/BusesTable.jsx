
//after styyluing   /frontend/src/components/admin/BusesTable.jsx
import React, { useState, useEffect } from "react";
import styled, { css } from "styled-components";
import { Search, Plus, Edit, Trash2 } from 'lucide-react'; 

// Import your service files
import { fetchBuses, deleteBus } from "../../services/busService";
import { fetchDrivers } from "../../services/driverService"; 
import { fetchRoutes } from "../../services/routesapi";
import BusModal from "./BusModal";
import Sidebar from "../Sidebar";
import Header from "../Header";

// --- STYLING ADOPTED FROM RoutesTable.jsx ---

const Container = styled.div`
   
    /* The large padding is removed, using a more standard one */
    padding:300px 40px; 
    min-height: 80vh;
    box-sizing: border-box;
`;

const Card = styled.div`
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15); 
    padding: 24px;
`;

const TableHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
`;

const Title = styled.h2`
    font-size: 24px;
    font-weight: 700;
    color: #333;
`;

const AddButton = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 18px;
    background-color: #132677; 
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
        background-color: #0d1a4d;
    }
`;

const Controls = styled.div`
    display: flex;
    justify-content: space-between; 
    gap: 16px;
    margin-bottom: 24px;
    align-items: center;
`;

const SearchContainer = styled.div`
    flex-grow: 1; 
    position: relative;
    max-width: 700px;
    
`;

const SearchInput = styled.input`
    width: 100%;
    padding: 10px 10px 10px 40px; 
    border: 1px solid #D7D7D7;
    border-radius: 8px;
    background-color: #FCFCFC;
    font-size: 14px;
    &::placeholder {
        color: #5D5D5D;
    }
`;

const SearchIcon = styled(Search)`
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #5D5D5D;
    width: 19px;
    height: 19px;
`;

const StatusSelect = styled.select`
    flex-shrink: 0; 
    padding: 10px 30px 10px 10px;
    border: 1px solid #D7D7D7;
    border-radius: 8px;
    background-color:#FCFCFC;
    font-size: 14px;
    min-width: 300px; 
    max-width: 300px;
    appearance: none; 
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23999' width='18px' height='18px'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 8px center;
    cursor: pointer;
`;

const TableWrapper = styled.div`
    width: 100%;
    overflow-x: auto;
    border-radius: 8px;
    border: 1px solid #ebebebff;
`;

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
    font-size: 14px;
    
    thead {
        background-color: #f7f7f7;
    }

    th {
        padding: 12px 16px;
        text-align: left;
        font-weight: 600;
        color: #666;
        border-bottom: 1px solid #f0f0f0;
    }
    
    /* Center align headers for the specified columns in Buses Table */
    th:nth-child(4), /* Route ID */
    th:nth-child(6) { /* Status */
        text-align: center;
    }

    td {
        padding: 14px 16px;
        border-bottom: 1px solid #f0f0f0;
        color: #333;
        vertical-align: middle;
    }
    
    /* Center align data for the specified columns in Buses Table */
    td:nth-child(4), /* Route ID */
    td:nth-child(6) { /* Status */
        text-align: center;
    }

    tr:last-child td {
        border-bottom: none;
    }
`;

const RouteBusDetails = styled.div`
    display: flex;
    flex-direction: column;

    .primary {
        font-size: 12px;
        color: #999;
       
    }

    .secondary {
        font-size: 12px;
        color: #999;
    }
`;

/* Status Pill Styling (Adjusted for Bus Statuses) */
const StatusPill = styled.div`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 2px 10px;
    border-radius: 16px; /* Rounder shape */
    font-weight: 600;
    font-size: 11px;
    text-transform: capitalize;

    /* Assigned Status Styling (Green/Active look) */
    ${(props) => props.$status === 'assigned' && css`
        background-color: #C5F99E; 
        color: #16A249; 
        border: 1px solid #16A249;
    `}

    /* Unassigned Status Styling (Neutral/Grey look) */
    ${(props) => props.$status === 'unassigned' && css`
        background-color: #F0F0F0; 
        color: #777; 
        border: 1px solid #777;
    `}
    
    /* Maintenance Status Styling (Warning/Yellow look) */
    ${(props) => props.$status === 'maintenance' && css`
        background-color: #FFF3CD; 
        color: #856404; 
        border: 1px solid #856404;
    `}
`;

const ActionButton = styled.button`
    background: none;
    border: none;
    color: #999;
    cursor: pointer;
    margin-left: 10px;
    padding: 0;
    line-height: 1;
    transition: color 0.2s; 
    display: inline-flex;
    align-items: center;
    justify-content: center;
    
    &:first-of-type {
        margin-left: 0;
    }
    
    &:hover {
        color: #1a4d90;
        background: none;
    }
`;


// --- COMPONENT LOGIC (Functionality is preserved) ---

export default function BusesTable() {
    const [buses, setBuses] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [modalType, setModalType] = useState(null); // "add" | "edit"
    const [selectedBus, setSelectedBus] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("");

    const loadBuses = async () => {
        try {
            const [busesData, driversData, routesData] = await Promise.all([
                fetchBuses(),
                fetchDrivers(),
                fetchRoutes()
            ]);

            // Merge driverName & routeName into bus object
            const busesWithNames = busesData.map(bus => {
                const driver = driversData.find(d => d.driverId === bus.driverId);
                const route = routesData.find(r => r.routeId === bus.routeId);
                return {
                    ...bus,
                    driverName: driver?.driverName || "-",
                    routeName: route?.routeName || "-",
                    // Ensure status is lowercase for filtering/styling consistency
                    status: bus.status?.toLowerCase() || 'unassigned', 
                };
            });

            setBuses(busesWithNames);
            setDrivers(driversData);
            setRoutes(routesData);
        } catch (error) {
            console.error("Error loading data:", error);
            // Handle error state if necessary
        }
    };

    useEffect(() => {
        loadBuses();
    }, []);

    // Load data again when modal is closed (after add/edit)
    useEffect(() => {
        if (!modalType) loadBuses();
    }, [modalType]);

    // --- Handle Delete ---
const handleDelete = async (busId) => {
  if (!busId) return;

  const bus = buses.find(b => b.busId === busId || b.id === busId);
  if (!bus) return;

  if (bus.assignedRoute) {
    alert(`Bus is assigned to route ${bus.assignedRoute}`);
    return;
  }

  if (window.confirm(`Delete bus ${bus.plateNumber}?`)) {
    await deleteBus(busId);
    loadBuses();
  }
};


    // --- Filter & Search ---
const lowerCaseSearch = searchTerm.toLowerCase();

const filteredBuses = buses.filter((bus) => {
  const matchesSearch =
    (bus.busId || "").toLowerCase().includes(lowerCaseSearch) ||
    (bus.plateNumber || "").toLowerCase().includes(lowerCaseSearch) ||
    (bus.driverName || "").toLowerCase().includes(lowerCaseSearch) ||
    (bus.routeName || "").toLowerCase().includes(lowerCaseSearch);

  const matchesStatus = filterStatus
    ? (bus.status || "").toLowerCase() === filterStatus.toLowerCase()
    : true;

  return matchesSearch && matchesStatus;
});


    const handleAddClick = () => { setModalType("add"); setSelectedBus(null); };
    const handleEditClick = (bus) => { setModalType("edit"); setSelectedBus(bus); };

    return (
         <>
            <Header />
            <Sidebar />
        <Container>
            <Card>
                <TableHeader>
                    <Title>Buses Management</Title>
                    <AddButton onClick={handleAddClick}>
                        <Plus size={20} />
                        Add Bus
                    </AddButton>
                </TableHeader>

                <Controls>
                    <SearchContainer>
                        <SearchIcon />
                        <SearchInput
                            type="text"
                            placeholder="Search by ID, Plate Number, Driver, or Route"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </SearchContainer>
                    <StatusSelect
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="">All Status</option>
                        <option value="assigned">Assigned</option>
                        <option value="unassigned">Unassigned</option>
                        <option value="maintenance">Maintenance</option>
                    </StatusSelect>
                </Controls>

                <TableWrapper>
                    <Table>
                        <thead>
                            <tr>
                                <th>Bus ID</th>
                                <th>Plate Number</th>
                                <th>Assigned Driver</th>
                                <th>Route ID</th>
                                <th>Route Name</th>
                                <th>Capacity</th>

                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBuses.length === 0 ? (
                                <tr>
                                    <td colSpan="8" style={{ textAlign: "center", color: "#666" }}>No buses found matching the criteria.</td>
                                </tr>
                            ) : (
                                filteredBuses.map(bus => (
<tr key={bus.busId || bus.id}>
  <td>{bus.busId}</td>

  <td>
    <RouteBusDetails>
      <div className="primary">{bus.plateNumber}</div>
    </RouteBusDetails>
  </td>

  <td>{bus.driverName}</td>
  <td>{bus.routeId || "-"}</td>
  <td>{bus.routeName}</td>

  {/* ✅ CAPACITY COLUMN (ADD HERE) */}
  <td>{bus.capacity ?? "-"}</td>

  <td>
    <StatusPill $status={bus.status}>
      {bus.status}
    </StatusPill>
  </td>

  <td>
    <ActionButton onClick={() => handleEditClick(bus)} style={{ marginLeft: 0 }}>
      <Edit size={18} />
    </ActionButton>
    <ActionButton onClick={() => handleDelete(bus.busId || bus.id)}>
      <Trash2 size={18} />
    </ActionButton>
  </td>
</tr>

                                ))
                            )}
                        </tbody>
                    </Table>
                </TableWrapper>

                {/* Modal */}
                {(modalType === "add" || modalType === "edit") && (
               <BusModal
  type={modalType}
  bus={selectedBus}
  drivers={drivers}
  routes={routes}
  onClose={() => setModalType(null)}
  onSaved={loadBuses}
/>

                )}
            </Card>
        </Container>
         </>
    );
}