

// frontend/src/pages/NotificationsPage.jsx
// frontend/src/pages/NotificationsPage.jsx
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import {
  getNotificationsForStudent,
  hideNotificationForStudent,
  softDeleteNotifications,
  markAllAsSeen
} from '../services/notificationService';

import { FaRoute, FaTrashAlt, FaPenNib, FaRegClock, FaRegCalendarAlt, FaRegDotCircle, FaTimes } from 'react-icons/fa';

// ------------------- STYLED COMPONENTS -------------------
const PageWrapper = styled.div`
  max-width: 950px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
`;

const PageHeading = styled.h2`
  text-align: left; /* Changed from center to accommodate dropdown */
  margin-bottom: 20px;
  font-size: 1.8rem;
  display: flex; /* Added display flex */
  justify-content: space-between; /* Added to push dropdown to the right */
  align-items: center; /* Vertically center items */
`;

// New styled component for the row with the "Delete All" button
const DeleteAllRow = styled.div`
  display: flex;
  justify-content: flex-end; /* Push content to the right */
  margin-bottom: 20px;
`;

// New styled component for the Delete All button
const DeleteAllButton = styled.button`
  background: #A50505; /* Requested color */
  color: white;
  border: 1px solid #7a0303; 
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px; /* Space between icon and text */

  &:hover {
    background: #7a0303;
  }
`;

const ControlsRow = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 10px;
  align-items: center;
  /* Removed background, padding, border for the filter row */
  /* background: #f9fafb;  */
  /* padding: 10px 12px; */
  /* border-radius: 8px; */
  /* border: 1px solid #e5e7eb; */
  justify-content: center; /* Centered the content (filters) */
`;

const FilterButton = styled.button`
  background: ${(props) => (props.active ? "#132677" : "#f3f4f6")};
  color: ${(props) => (props.active ? "white" : "#1f2937")};
  border: 1px solid ${(props) => (props.active ? "#132677" : "#d1d5db")};
  padding: 6px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    background: ${(props) => (props.active ? "#1e40af" : "#e5e7eb")};
  }
`;

const FilterDropdown = styled.select`
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  background: white;
  cursor: pointer;
  font-size: 0.95rem;
  color: #1f2937;

  &:hover { border-color: #2563eb; }
`;

const ToggleSelectButton = styled.button`
  background: #132677;
  color: white;
  border: 1px solid #132677;
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    background: #1e40af;
  }
`;

const ConfirmDeleteButton = styled.button`
  background: #dc2626;
  color: white;
  border: 1px solid #b91c1c;
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.2s;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:hover:enabled {
    background: #b91c1c;
  }
`;

const NotificationWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-height:70vh;
`;

const SectionWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SectionHeading = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
`;

const NotificationCardWrapper = styled.div`
  display: flex;
  gap: 16px;
  padding: 20px 20px;
  border-radius: 12px;
  background: white;
  border-left: 4px solid ${(props) => props.color || '#3b82f6'};
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  position: relative;
  transition: all 0.3s ease-in-out;
  min-height: 70px;
  cursor: pointer;
  width: 900px;
  max-width: 100%;
  margin-bottom: ${(props) => props.isLast ? '16px' : '0'};
  &:hover {
    box-shadow: 0 8px 16px rgba(0,0,0,0.12);
  }
`;

const IconWrapper = styled.div`
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${(props) => props.bgColor || '#3b82f6'};
  color: ${(props) => props.color || 'white'};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ContentWrapper = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CardTitle = styled.h4`
  font-size: 1.125rem;
  font-weight: 600;
  margin-top:5px;
  color: ${(props) => props.unread ? '#1f2937' : '#4b5563'};
`;

const CardDetails = styled.div`
  font-size: 0.9rem;
  color: #6b7280;
  margin-top:-20px;
  max-width: 400px;
  word-wrap: break-word;
  white-space: pre-wrap;
`;

const CardFooter = styled.div`
  position: absolute;
  top: 20px;
  right: 16px;
  gap:6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 0.875rem;
  color: #9ca3af;
  svg { 
    vertical-align: middle;
    margin-left: 4px;
  }
`;

const TimeRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.9rem;
  margin-top: 2px;
  svg { 
    vertical-align: middle;
    margin-left: 4px;
  }
`;

const DeleteIconButton = styled.button`
  border: none;
  background: none;
  cursor: pointer;
  color: #9b0101ff;
  position: absolute;
  right: -50px;
  top: 50%;
  transform: translateY(-50%);
  transition: color 0.2s;

  &:hover {
    color: #9b0101ff;
  }
`;

const CheckboxWrapper = styled.input`
  margin-right: 12px;
  width: 18px;
  height: 18px;
  cursor: pointer;
`;

const ReadMoreLink = styled.div`
  text-align: ${(props) => props.align || "right"};
  cursor: pointer;
  color: #3b88f6;
  font-weight: 500;
  margin-top: 4px;
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
`;

const ModalContent = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  max-width: 450px;
  width: 90%;
  text-align: center;
  position: relative;
`;

const ModalCloseButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #6b7280;
  &:hover { color: #111; }
`;

const ModalIllustration = styled.img`
  width: 120px;
  margin-bottom: 16px;
`;

const ModalTitle = styled.h3`
  font-size: 1.25rem;
  margin-bottom: 8px;
`;

const ModalText = styled.p`
  font-size: 0.95rem;
  color: #4b5563;
`;

const ModalButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
`;

const ModalCancelText = styled.span`
  cursor: pointer;
  color: grey;
`;

const typeColors = {
  'route-assignment': { icon: FaRoute, color: '#3b82f6', bgColor: '#eff6ff' },
  'route-update': { icon: FaPenNib, color: '#f59e0b', bgColor: '#fffbeb' },
  'route-deletion': { icon: FaTrashAlt, color: '#ef4444', bgColor: '#fee2e2' },
  default: { icon: FaRegDotCircle, color: '#6b7280', bgColor: '#f3f4f6' },
};

// ------------------- MAIN COMPONENT -------------------
export default function NotificationsPage() {
  const [allNotifications, setAllNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [filterDate, setFilterDate] = useState('all'); 
  const [filterType, setFilterType] = useState('all');
  const [expandedIds, setExpandedIds] = useState([]);
  const [modal, setModal] = useState({ show: false, type: '', targetId: null });
  const BATCH = 5;
  const [sectionLimits, setSectionLimits] = useState({ today: BATCH, thisWeek: BATCH, earlier: BATCH });
  const [sectionExpanded, setSectionExpanded] = useState({ today: false, thisWeek: false, earlier: false });

  const student = (() => { try { return JSON.parse(localStorage.getItem('user')); } catch(e){ return null; } })();
  const studentEmail = student?.email;

  const fetchNotifications = async () => {
    if (!studentEmail) return;
    setLoading(true);
    try {
      const data = await getNotificationsForStudent(studentEmail);
      data.sort((a, b) => (new Date(b.createdAt?._seconds * 1000 || 0)) - (new Date(a.createdAt?._seconds * 1000 || 0)));
      setAllNotifications(data);
      await markAllAsSeen(studentEmail);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchNotifications(); }, []);

  const handleToggleSelectMode = () => { setSelectMode(!selectMode); setSelectedIds([]); };

  const handleDelete = async () => {
    if(modal.type === 'single' && modal.targetId){
      await hideNotificationForStudent(modal.targetId, studentEmail);
      setAllNotifications(prev => prev.filter(n => n.id !== modal.targetId));
      setSelectedIds(prev => prev.filter(x => x !== modal.targetId));
    } else if(modal.type === 'multiple'){
      await softDeleteNotifications(selectedIds, studentEmail);
      setAllNotifications(prev => prev.filter(n => !selectedIds.includes(n.id)));
      setSelectedIds([]);
      setSelectMode(false);
    }
    setModal({ show: false, type: '', targetId: null });
  };
  
  // New function to handle 'Delete All' (soft delete all visible/filtered notifications)
  const handleDeleteAll = async () => {
      const allVisibleIds = filteredNotifications.map(n => n.id);
      if (allVisibleIds.length > 0) {
          await softDeleteNotifications(allVisibleIds, studentEmail);
          setAllNotifications(prev => prev.filter(n => !allVisibleIds.includes(n.id)));
          setSelectedIds([]);
          setSelectMode(false);
      }
      setModal({ show: false, type: '', targetId: null }); // Close modal if used
  };


  const normalizeType = (n) => {
    const type = n.type?.toLowerCase() || '';
    const title = n.title?.toLowerCase() || '';
    if (type === "route_add" || title.includes("added")) return "route-assignment";
    if (type === "route_update" || title.includes("updated")) return "route-update";
    if (type === "route_delete" || title.includes("removed")) return "route-deletion";
    return "other";
  };

  const groupNotificationsByDate = (notifications) => {
    const sections = { today: [], thisWeek: [], earlier: [] };
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    notifications.forEach(n => {
      const date = n.createdAt?._seconds ? new Date(n.createdAt._seconds * 1000) : null;
      if (!date) return;
      if (date >= startOfToday) sections.today.push(n);
      else if (date >= startOfWeek && date < startOfToday) sections.thisWeek.push(n);
      else sections.earlier.push(n);
    });
    return sections;
  };

  const loadMoreSection = (section) => { setSectionLimits(prev => ({ ...prev, [section]: prev[section] + BATCH })); setSectionExpanded(prev => ({ ...prev, [section]: true })); };
  const collapseSection = (section) => { setSectionLimits(prev => ({ ...prev, [section]: BATCH })); setSectionExpanded(prev => ({ ...prev, [section]: false })); };

  let filteredNotifications = [...allNotifications];
  if (filterType !== 'all') filteredNotifications = filteredNotifications.filter(n => normalizeType(n) === filterType);
  const sections = groupNotificationsByDate(filteredNotifications);
  const filteredSections = {};
  if (filterDate === 'all') Object.assign(filteredSections, sections);
  else if (filterDate === 'today') filteredSections.today = sections.today;
  else if (filterDate === 'thisWeek') filteredSections.thisWeek = sections.thisWeek;
  else if (filterDate === 'earlier') filteredSections.earlier = sections.earlier;

  const toggleSelectNotification = (id) => {
      if (selectMode) {
    // multiple selection
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  } else {
    // single selection: toggle
    setSelectedIds(prev => prev.includes(id) ? [] : [id]);
  }
  };

  const toggleExpandNotification = (id) => { setExpandedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]); };

  const renderNotificationCard = (n, isLast=false) => {
    const typeKey = normalizeType(n);
    const { icon: Icon, color, bgColor } = typeColors[typeKey] || typeColors.default;
    const isUnread = !n.read;
    const isSelected = selectedIds.includes(n.id);
    const isExpanded = expandedIds.includes(n.id);

    return (
      <NotificationCardWrapper key={n.id} color={color} isLast={isLast} onClick={()=>toggleSelectNotification(n.id)}>
        {selectMode && <CheckboxWrapper type="checkbox" checked={isSelected} onChange={(e)=>toggleSelectNotification(n.id)} onClick={(e)=>e.stopPropagation()}/>}
        <IconWrapper color={color} bgColor={bgColor}><Icon size={20} /></IconWrapper>
        <ContentWrapper>
          <CardHeader>
            <CardTitle unread={isUnread}>{n.title}</CardTitle>
          </CardHeader>
          <CardDetails dangerouslySetInnerHTML={{__html: isExpanded ? n.message : n.message?.substring(0,150) + (n.message?.length > 150 ? "..." : "")}} />
          {n.message?.length > 150 && (
            <ReadMoreLink align="right" onClick={(e)=>{ e.stopPropagation(); toggleExpandNotification(n.id); }}>
              {isExpanded ? "Read Less ←" : "Read More →"}
            </ReadMoreLink>
          )}
          <CardFooter>
            <TimeRow><FaRegClock size={16}/> {n.createdAt?._seconds? new Date(n.createdAt._seconds*1000).toLocaleTimeString():'No Time'}</TimeRow>
            <TimeRow><FaRegCalendarAlt size={16}/> {n.createdAt?._seconds? new Date(n.createdAt._seconds*1000).toLocaleDateString():'No Date'}</TimeRow>
          </CardFooter>
        </ContentWrapper>
        {!selectMode && isSelected && (
          <DeleteIconButton onClick={(e)=>{ e.stopPropagation(); setModal({ show: true, type: 'single', targetId: n.id }); }}>
            <FaTrashAlt size={18}/>
          </DeleteIconButton>
        )}
      </NotificationCardWrapper>
    );
  };

  const renderSection = (title, key) => {
    const items = filteredSections[key] || [];
    if (!items.length) return null;
    const visibleItems = items.slice(0, sectionLimits[key]);
    const isExpanded = sectionExpanded[key];

    return (
      <SectionWrapper key={key}>
        <SectionHeading>{title}</SectionHeading>
        {visibleItems.map((item,i) => renderNotificationCard(item, i===visibleItems.length-1))}
        <div style={{display:'flex', justifyContent:'space-between'}}>
          <div>{isExpanded && <ReadMoreLink align="left" onClick={()=>collapseSection(key)}>Read Less ←</ReadMoreLink>}</div>
          <div>{!isExpanded && visibleItems.length < items.length && <ReadMoreLink align="right" onClick={()=>loadMoreSection(key)}>Read More →</ReadMoreLink>}</div>
        </div>
      </SectionWrapper>
    );
  };

  return (
    <PageWrapper>
      {/* 1. All Notification Cdenter -> Notifictaions + dropdown + remove bell */}
      <PageHeading>
        Notifications
        {/* All Types Dropdown moved to PageHeading */}
        <FilterDropdown value={filterType} onChange={e=>setFilterType(e.target.value)}>
          <option value="all">Notification Type</option>
          <option value="route-assignment">Route Assignment</option>
          <option value="route-update">Route Update</option>
          <option value="route-deletion">Route Deletion</option>
        </FilterDropdown>
      </PageHeading>

      {/* 2. Filter Row: Center aligned, background removed */}
      <ControlsRow>
        {['all', 'today', 'thisWeek', 'earlier'].map(d=>( 
          <FilterButton key={d} active={filterDate===d} onClick={()=>setFilterDate(d)}>
            {d==='all'? 'All' : d==='thisWeek'? 'This Week' : d.charAt(0).toUpperCase() + d.slice(1)}
          </FilterButton>
        ))}
      </ControlsRow>

      {/* 3. Delete All Button Row - Directly next line after Filter Row */}
      <DeleteAllRow>
        {/* Toggle Select Mode/Delete Selected Button kept for selection logic */}
        <ToggleSelectButton onClick={handleToggleSelectMode}>{selectMode?'Cancel Selection':'Delete Selected'}</ToggleSelectButton>
        {selectMode && <ConfirmDeleteButton onClick={()=>setModal({show:true,type:'multiple'})} disabled={selectedIds.length===0}>Confirm Delete ({selectedIds.length})</ConfirmDeleteButton>}
        
        {/* Delete All Button */}
        <DeleteAllButton onClick={() => setModal({ show: true, type: 'deleteAll', targetId: null })} style={{ marginLeft: '12px' }}>
            <FaTrashAlt size={18} />
            Delete all
        </DeleteAllButton>
      </DeleteAllRow>
      

      {/* The rest of the notification sections */}
      <NotificationWrapper>
        {renderSection("Today","today")}
        {renderSection("This Week","thisWeek")}
        {renderSection("Earlier","earlier")}
      </NotificationWrapper>

      {modal.show && (
        <ModalOverlay>
          <ModalContent>
            <ModalCloseButton onClick={()=>setModal({ show:false, type:'', targetId:null })}><FaTimes /></ModalCloseButton>
            <ModalIllustration src="https://cdn-icons-png.flaticon.com/512/1345/1345822.png" alt="Red Trash Bin" />
            <ModalTitle>
                {modal.type === 'single' && 'Are you sure you want to delete this notification?'}
                {modal.type === 'multiple' && `Delete ${selectedIds.length} notifications permanently?`}
                {modal.type === 'deleteAll' && `Delete ALL visible notifications permanently?`}
            </ModalTitle>
            <ModalText>This action cannot be undone. Please confirm your decision.</ModalText>
            <ModalButtons>
              <ModalCancelText onClick={()=>setModal({ show:false, type:'', targetId:null })}>Cancel</ModalCancelText>
              <ConfirmDeleteButton 
                  onClick={modal.type === 'deleteAll' ? handleDeleteAll : handleDelete}
                  disabled={modal.type === 'multiple' && selectedIds.length === 0}
              >
                  Delete
              </ConfirmDeleteButton>
            </ModalButtons>
          </ModalContent>
        </ModalOverlay>
      )}
    </PageWrapper>
  );
}