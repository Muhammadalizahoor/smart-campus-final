
//after styling

import React, { useState } from 'react';
import styled from 'styled-components';
import RoutesTable from '../components/admin/RoutesTable';
import DriversTable from '../components/admin/DriversTable';
import BusesTable from '../components/admin/BusesTable';

// --- Styled Components for the New UI ---

const AdminPageWrapper = styled.div`
    display: flex;
    flex-direction: column;
    padding: 20px;
    /* 1. Center the entire page content and set max width */
    max-width: 1200px; /* Adjust this width as needed */
    margin: 0 auto; /* Centers the component block horizontally */
`;

// New wrapper to apply static/sticky positioning to the tabs bar
const StickyTabsWrapper = styled.div`
    /* This centers the TabsContainer (which has width: fit-content) 
    and keeps it static on the screen.
    */
    width: 100%;
    display: flex;
    justify-content: center; /* Center the tabs horizontally */
    
    /* Sticky Positioning */
    position: sticky; 
    top: 0; /* Sticks to the top edge of the viewport */
    z-index: 10; /* Ensures the tab bar is always on top of the tables */
    
    /* Increased Padding Below Tabs */
    padding-top: 60px; /* Separates it from the top of the screen */
    padding-bottom: 20px; /* **NEW:** Adds space below the TabsContainer, pushing the table down */
`;


// Wrapper for the entire pill-shaped tab group
const TabsContainer = styled.div`
    display: flex;
    background-color: #F7F7F7; 
    border-radius: 8px; 
    padding: 4px; 
    margin-top:40px;
    width: fit-content; 
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    gap: 12px; 
`;

// Styles for the Tab Button (unchanged)
const TabButton = styled.button`
    color: #5D5D5D; 
    font-size: 14px;
    font-weight: 600;
    padding: 10px 20px;
    border: none;
    cursor: pointer;
    border-radius: 6px; 
    transition: all 0.2s ease-in-out;
    white-space: nowrap; 
    
    background-color: transparent;
    
    &:hover {
        background-color: ${props => (props.active ? '#1a237e' : 'transparent')};
    }

    ${props => props.active && `
        background-color: #1a237e; 
        color: #ffffff; 
        font-weight: bold;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    `}
`;

// --- Updated React Component ---

export const AdminRoutesPage = () => {
    const [activeTab, setActiveTab] = useState('routes'); 

    return (
        <AdminPageWrapper>
            
            <StickyTabsWrapper>
                <TabsContainer>
                    <TabButton 
                        active={activeTab === 'routes'} 
                        onClick={() => setActiveTab('routes')}
                    >
                        Routes Logs
                    </TabButton>
                    
                    <TabButton 
                        active={activeTab === 'buses'} 
                        onClick={() => setActiveTab('buses')}
                    >
                        Buses Logs
                    </TabButton>
                    
                    <TabButton 
                        active={activeTab === 'drivers'} 
                        onClick={() => setActiveTab('drivers')}
                    >
                        Driver Logs
                    </TabButton>
                </TabsContainer>
            </StickyTabsWrapper>
            
            <div style={{ minHeight: '1200px', width: '100%' }}>
                {activeTab === 'routes' && <RoutesTable />}
                {activeTab === 'drivers' && <DriversTable />}
                {activeTab === 'buses' && <BusesTable />}
            </div>
        </AdminPageWrapper>
    );
};
