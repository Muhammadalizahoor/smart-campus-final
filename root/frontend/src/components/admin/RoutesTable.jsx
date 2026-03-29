import React, { useEffect, useState } from 'react';
import styled, { css } from 'styled-components';

import RouteModal from './RouteModal';
import StopsModal from './StopsModal';
import { Edit, Trash2, Eye, Search, Plus } from 'lucide-react'; 
import { fetchRoutes } from "../../services/routesapi";
import { fetchStops } from "../../services/stopService";

import { fetchBuses } from "../../services/busService";
import { fetchDrivers } from "../../services/driverService";
import Sidebar from "../Sidebar";
import Header from "../Header";

// --- STYLING FIXED FOR SIDEBAR & ALIGNMENT ---

const Container = styled.div`
    /* Sidebar ke liye space chorr di hai (280px) */
    padding: 100px 40px 40px 280px; 
    min-height: 80vh;
    box-sizing: border-box;

    @media (max-width: 1024px) {
        padding: 100px 20px 40px 80px; 
    }

    @media (max-width: 768px) {
        padding: 100px 15px;
    }
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
    min-width: 250px; 
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
    
    /* Center align headers for numerical/action columns */
    th:nth-child(4), th:nth-child(5), th:nth-child(6), th:nth-child(7), th:nth-child(8) {
        text-align: center;
    }

    td {
        padding: 14px 16px;
        border-bottom: 1px solid #f0f0f0;
        color: #333;
        vertical-align: middle;
    }
    
    td:nth-child(4), td:nth-child(5), td:nth-child(6), td:nth-child(7), td:nth-child(8) {
        text-align: center;
    }

    tr:last-child td {
        border-bottom: none;
    }
`;

const StatusPill = styled.div`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 2px 10px;
    border-radius: 16px; 
    font-weight: 600;
    font-size: 11px;
    text-transform: capitalize;

    ${(props) => props.$status === 'active' && css`
        background-color: #C5F99E; 
        color: #16A249; 
        border: 1px solid #16A249;
    `}

    ${(props) => props.$status === 'inactive' && css`
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
    transition: color 0.2s; 
    display: inline-flex;
    align-items: center;
    justify-content: center;
    
    &:hover {
        color: #132677;
    }
`;

export default function RoutesTable() {
  const [routes, setRoutes] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [buses, setBuses] = useState([]);
  const [stops, setStops] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [modalType, setModalType] = useState(null);

  // SEARCH + FILTER STATES
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const loadData = async () => {
    try {
      const [routesData, driversData, busesData, stopsData] =
        await Promise.all([
          fetchRoutes(),
          fetchDrivers(),
          fetchBuses(),
          fetchStops(),
        ]);

      setRoutes(routesData || []);
      setDrivers(driversData || []);
      setBuses(busesData || []);
      setStops(stopsData || []);
    } catch (err) {
      console.error("Error loading data:", err);
    }
  };

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    if (!modalType) loadData();
  }, [modalType]);

  const getDriverName = (driverId) =>
    drivers.find((d) => d.driverId === driverId)?.driverName || "-";

  const getBusPlate = (busId) =>
    buses.find((b) => b.busId === busId)?.plateNumber || "-";

  const getStopsForRoute = (routeId) =>
    stops.filter((s) => s.routeId === routeId);

  const filteredRoutes = routes.filter((route) => {
    const lower = search.toLowerCase();
    const matchesSearch =
      (route.routeId || "").toLowerCase().includes(lower) ||
      (route.routeName || "").toLowerCase().includes(lower) ||
      (route.busId || "").toLowerCase().includes(lower) ||
      getBusPlate(route.busId).toLowerCase().includes(lower) ||
      getDriverName(route.driverId).toLowerCase().includes(lower);

    const matchesStatus = statusFilter
      ? (route.status || "").toLowerCase() === statusFilter.toLowerCase()
      : true;

    return matchesSearch && matchesStatus;
  });

  const handleAddClick = () => { setSelectedRoute(null); setModalType("add"); };
  const handleEditClick = (route) => { setSelectedRoute(route); setModalType("edit"); };
  const handleDeleteClick = (route) => { setSelectedRoute(route); setModalType("delete"); };
  const handleViewStopsClick = (route) => { setSelectedRoute(route); setModalType("stops"); };

  return (
    <>
    <Header />
    <Sidebar />
    <Container>
      <Card>
        <TableHeader>
          <Title>Routes Management</Title>
          <AddButton onClick={handleAddClick}>
            <Plus size={20} />
            Add Route
          </AddButton>
        </TableHeader>

        <Controls>
          <SearchContainer>
            <SearchIcon />
            <SearchInput
              type="text"
              placeholder="Search by Route, Bus, or Driver..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </SearchContainer>

          <StatusSelect
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </StatusSelect>
        </Controls>

        <TableWrapper>
          <Table>
            <thead>
              <tr>
                <th>Route ID</th>
                <th>Route Name</th>
                <th>Driver</th>
                <th>Bus ID</th>
                <th>Bus Plate</th>
                <th>Stops</th>
                <th>Stop Count</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredRoutes.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: "center", padding: '30px', color: '#666' }}>
                    No routes found
                  </td>
                </tr>
              ) : (
                filteredRoutes.map((route) => {
                  const routeStops = getStopsForRoute(route.routeId);
                  return (
                    <tr key={route.routeId}>
                      <td style={{fontWeight: '600'}}>{route.routeId}</td>
                      <td>{route.routeName}</td>
                      <td>{getDriverName(route.driverId)}</td>
                      <td>{route.busId || "-"}</td>
                      <td>{getBusPlate(route.busId)}</td>

                      <td>
                        <ActionButton onClick={() => handleViewStopsClick(route)}>
                          <Eye size={18} />
                        </ActionButton>
                      </td>

                      <td>{routeStops.length}</td>

                      <td>
                        <StatusPill $status={(route.status || "").toLowerCase()}>
                          {route.status || "N/A"}
                        </StatusPill>
                      </td>

                      <td>
                        <ActionButton onClick={() => handleEditClick(route)} style={{ marginLeft: 0 }}>
                          <Edit size={18} />
                        </ActionButton>
                        <ActionButton onClick={() => handleDeleteClick(route)}>
                          <Trash2 size={18} />
                        </ActionButton>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </TableWrapper>

        {(modalType === "add" || modalType === "edit" || modalType === "delete") && (
          <RouteModal
            type={modalType}
            route={selectedRoute || {}}
            onClose={() => setModalType(null)}
            drivers={drivers}
            buses={buses}
            stops={stops}
          />
        )}

        {modalType === "stops" && selectedRoute && (
          <StopsModal
            route={selectedRoute}
            stops={getStopsForRoute(selectedRoute.routeId)}
            onClose={() => setModalType(null)}
          />
        )}
      </Card>
    </Container>
    </>
  );
}