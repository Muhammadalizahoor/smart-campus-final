import React, { useEffect, useState } from 'react';
import styled, { css } from 'styled-components';
import axios from 'axios';
import { Eye, Search } from 'lucide-react';
import StopsModal from '../components/admin/StopsModal';


// --- STYLING SAME AS ADMIN ROUTES ---

const Container = styled.div`
  background-color: white;
  padding: 100px 40px;
  min-height: 100vh;
  box-sizing: border-box;
`;

const Card = styled.div`
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  padding: 24px;
`;

const Header = styled.div`
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

const Controls = styled.div`
  display: flex;
  justify-content: flex-start;
  gap: 16px;
  margin-bottom: 24px;
  align-items: center;
`;

const SearchContainer = styled.div`
  flex-grow: 1;
  position: relative;
  max-width: 500px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 10px 10px 40px;
  border: 1px solid #D7D7D7;
  border-radius: 8px;
  background-color: #FCFCFC;
  font-size: 14px;
  &::placeholder { color: #5D5D5D; }
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

  thead { background-color: #f7f7f7; }

  th {
    padding: 12px 16px;
    text-align: left;
    font-weight: 600;
    color: #666;
    border-bottom: 1px solid #f0f0f0;
  }

  td {
    padding: 14px 16px;
    border-bottom: 1px solid #f0f0f0;
    color: #333;
    vertical-align: middle;
  }

  /* Center align specific columns */
  th:nth-child(4), th:nth-child(5), th:nth-child(6), th:nth-child(7), th:nth-child(8),
  td:nth-child(4), td:nth-child(5), td:nth-child(6), td:nth-child(7), td:nth-child(8) {
    text-align: center;
  }

  tr:last-child td { border-bottom: none; }
`;

const RouteBusDetails = styled.div`
  display: flex;
  flex-direction: column;
  .primary { font-size: 14px; color: #333; }
  .secondary { font-size: 12px; color: #999; }
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
  padding: 0;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &:hover { color: #1a4d90; }
`;

// --- COMPONENT LOGIC ---

export default function StudentRoutes({ user }) {
  const [routes, setRoutes] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [buses, setBuses] = useState([]);
  const [stops, setStops] = useState([]);
  const [search, setSearch] = useState("");
  const [modalRoute, setModalRoute] = useState(null);

  const loadData = async () => {
    try {
      const [routesRes, driversRes, busesRes, stopsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/routes/all'),
        axios.get('http://localhost:5000/api/drivers/all'),
        axios.get('http://localhost:5000/api/buses/all'),
        axios.get('http://localhost:5000/api/stops/all')
      ]);

      setRoutes(routesRes.data);
      setDrivers(driversRes.data);
      setBuses(busesRes.data);
      setStops(stopsRes.data);
    } catch (err) { console.error('Error loading data:', err); }
  };

  useEffect(() => { loadData(); }, []);

  const getDriverName = (driverId) => drivers.find(d => d.driverId === driverId)?.driverName || '-';
  const getBusPlate = (busId) => buses.find(b => b.busId === busId)?.plateNumber || '-';
  const getStopsForRoute = (routeId) => stops.filter(s => s.routeId === routeId);

  const filteredRoutes = routes.filter(route => {
    const lower = search.toLowerCase();
    return (
      route.routeId.toString().includes(lower) ||
      route.busId?.toString().includes(lower) ||
      getBusPlate(route.busId).toLowerCase().includes(lower) ||
      getDriverName(route.driverId).toLowerCase().includes(lower)
    );
  });

  return (
    <Container>
      <Card>
        <Header>
          <Title>Routes Overview</Title>
        </Header>

        <Controls>
          <SearchContainer>
            <SearchIcon />
            <SearchInput
              type="text"
              placeholder="Search by Route ID, Bus ID, Bus Plate, or Driver"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </SearchContainer>
        </Controls>

        <TableWrapper>
          <Table>
            <thead>
              <tr>
                <th>Route Number</th>
                <th>Route Name</th>
                <th>Driver</th>
                <th>Bus ID</th>
                <th>Bus Plate Number</th>
                <th>Stops</th>
                <th>Stop Count</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredRoutes.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center", color: "#666" }}>No routes found.</td>
                </tr>
              ) : (
                filteredRoutes.map(route => {
                  const routeStops = getStopsForRoute(route.routeId);
                  return (
                    <tr key={route.routeId}>
                      <td>{route.routeId}</td>
                      <td>
                        <RouteBusDetails>
                          <div className="primary">{route.routeName}</div>
                        </RouteBusDetails>
                      </td>
                      <td>{getDriverName(route.driverId)}</td>
                      <td>{route.busId || "-"}</td>
                      <td>{getBusPlate(route.busId)}</td>
                      <td>
                        <ActionButton onClick={() => setModalRoute(route)}>
                          <Eye size={18} />
                        </ActionButton>
                      </td>
                      <td>{routeStops.length}</td>
                      <td>
                        <StatusPill $status={route.status?.toLowerCase()}>
                          {route.status || 'N/A'}
                        </StatusPill>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </TableWrapper>

        {/* Stops Modal */}
        {modalRoute && (
          <StopsModal
            route={modalRoute}
            stops={getStopsForRoute(modalRoute.routeId)}
            onClose={() => setModalRoute(null)}
          />
        )}
      </Card>
    </Container>
  );
}




