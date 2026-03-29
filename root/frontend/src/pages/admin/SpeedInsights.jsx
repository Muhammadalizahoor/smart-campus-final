import React, { useState, useEffect, useMemo } from 'react';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { ref, onValue, off, get } from 'firebase/database';
import { rtdb } from '../../services/firebase'; 
import Sidebar from '../../components/Sidebar'; 
import { Bus, Gauge, TrendingUp, ArrowDown, Activity, Calendar, Download, FileText } from 'lucide-react'; 

export default function SpeedInsights() {
  const [availableBuses, setAvailableBuses] = useState([]); 
  const [selectedBus, setSelectedBus] = useState('');
  const [chartData, setChartData] = useState([]); 
  const [monthlyData, setMonthlyData] = useState([]); 

  const getTodayDate = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const today = getTodayDate();
  // ✅ 1. Date State (Default Today)
  const [selectedDate, setSelectedDate] = useState(today);
  const currentMonth = selectedDate.substring(0, 7); 

  // 2. Fetch available buses
  useEffect(() => {
    const busesRef = ref(rtdb, 'bus_data_v2');
    const handleBuses = (snapshot) => {
      if (snapshot.exists()) {
        const keys = Object.keys(snapshot.val());
        setAvailableBuses(keys);
        if (selectedBus === '' && keys.length > 0) {
          setSelectedBus(keys[0]);
        }
      }
    };
    onValue(busesRef, handleBuses);
    return () => off(busesRef, 'value', handleBuses);
  }, []);

  // 3. DAILY DATA (Switching logic wahi purani hai, sirf path dynamic kiya hai)
  useEffect(() => {
    if (!selectedBus) return;
    
    setChartData([]); 
    const historyRef = ref(rtdb, `speed_history/${selectedBus}/${selectedDate}`);
    
    const handleData = (snapshot) => {
      if (snapshot.exists()) {
        const data = Object.values(snapshot.val());
        // Agar selected date aaj ki hai toh live effect ke liye slice, warna pura data
        setChartData(selectedDate === today ? data.slice(-60) : data); 
      } else {
        setChartData([]);
      }
    };

    onValue(historyRef, handleData);
    return () => off(historyRef, 'value', handleData);
  }, [selectedBus, selectedDate, today]); // ✅ Switching is smooth here

  // 4. MONTHLY GRAPH DATA
  useEffect(() => {
    if (!selectedBus) return;
    const monthRef = ref(rtdb, `speed_history/${selectedBus}`);
    const handleMonth = (snapshot) => {
      if (snapshot.exists()) {
        const allDays = snapshot.val();
        const monthlyRecords = [];
        Object.keys(allDays).forEach(date => {
          if (date.startsWith(currentMonth)) {
            const dayLogs = Object.values(allDays[date]);
            const avg = dayLogs.reduce((a, b) => a + (Number(b.speed) || 0), 0) / dayLogs.length;
            monthlyRecords.push({ day: date.split('-')[2], speed: Number(avg.toFixed(1)) });
          }
        });
        setMonthlyData(monthlyRecords.sort((a, b) => Number(a.day) - Number(b.day)));
      }
    };
    onValue(monthRef, handleMonth);
    return () => off(monthRef, 'value', handleMonth);
  }, [selectedBus, currentMonth]);

  const stats = useMemo(() => {
    if (chartData.length === 0) return { min: 0, avg: 0, max: 0 };
    const speeds = chartData.map(d => Number(d.speed) || 0);
    return { 
      min: Math.min(...speeds), 
      avg: (speeds.reduce((a, b) => a + b, 0) / speeds.length).toFixed(1), 
      max: Math.max(...speeds) 
    };
  }, [chartData]);

  const downloadCSV = (rows, filename) => {
    const content = "data:text/csv;charset=utf-8," + rows.map(r => r.join(",")).join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(content);
    link.download = filename;
    link.click();
  };

  // ✅ 5. Detailed Monthly Download with Stats
  const handleDetailedMonthlyDownload = async () => {
    const snapshot = await get(ref(rtdb, `speed_history/${selectedBus}`));
    if (!snapshot.exists()) return alert("No history found.");

    const allData = snapshot.val();
    let mMin = 999, mMax = 0, mSum = 0, mCount = 0;
    const rows = [["Date", "Timestamp", "Speed (km/h)"]];

    Object.keys(allData).forEach(date => {
      if (date.startsWith(currentMonth)) {
        Object.values(allData[date]).forEach(log => {
          const s = Number(log.speed) || 0;
          if (s < mMin) mMin = s;
          if (s > mMax) mMax = s;
          mSum += s;
          mCount++;
          rows.push([date, log.time, s]);
        });
      }
    });

    const mAvg = mCount > 0 ? (mSum / mCount).toFixed(1) : 0;
    const finalContent = [
      ["MONTHLY ANALYTICS SUMMARY"],
      ["Bus ID", selectedBus], ["Month", currentMonth],
      ["Min Speed", mMin === 999 ? 0 : mMin], ["Max Speed", mMax], ["Avg Speed", mAvg],
      [], ["Date", "Timestamp", "Speed (km/h)"],
      ...rows.slice(1)
    ];

    downloadCSV(finalContent, `Report_${selectedBus}_${currentMonth}.csv`);
  };

  return (
    <div style={{ display: 'flex', background: '#f4f7fe', minHeight: '100vh' }}>
      <Sidebar /> 
      <div style={{ flex: 1, padding: "100px 40px 40px 280px" }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h1 style={{ color: '#132677', fontWeight: '800' }}>Fleet Speed Analytics</h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => downloadCSV([
                ["DAILY REPORT"], ["Date", selectedDate], ["Min", stats.min], ["Avg", stats.avg], ["Max", stats.max], [],
                ["Date", "Time", "Speed"], ...chartData.map(d=>[selectedDate, d.time, d.speed])
              ], `Daily_${selectedBus}_${selectedDate}.csv`)} 
              style={{ background:'#132677', color:'white', border:'none', padding:'10px 15px', borderRadius:'8px', cursor:'pointer', display:'flex', alignItems:'center', gap:'5px' }}>
              <Download size={16}/> Daily CSV
            </button>
            <button onClick={handleDetailedMonthlyDownload}
              style={{ background:'#1e293b', color:'white', border:'none', padding:'10px 15px', borderRadius:'8px', cursor:'pointer', display:'flex', alignItems:'center', gap:'5px' }}>
              <FileText size={16}/> Monthly CSV
            </button>
          </div>
        </div>

        <div style={{ background: 'white', padding: '24px', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', marginBottom: '25px' }}>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid #132677', padding: '10px 15px', borderRadius: '10px' }}>
              <Bus size={20} color="#132677" />
              <select value={selectedBus} onChange={(e) => setSelectedBus(e.target.value)} style={{ border:'none', outline:'none', fontWeight:'bold', color:'#132677', cursor:'pointer' }}>
                {availableBuses.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            {/* ✅ FIXED DATEPICKER: Switching is still primary */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid #132677', padding: '10px 15px', borderRadius: '10px' }}>
              <Calendar size={20} color="#132677" />
              <input type="date" value={selectedDate} max={today} onChange={(e) => setSelectedDate(e.target.value)} style={{ border:'none', outline:'none', fontWeight:'bold', color:'#132677', cursor:'pointer' }} />
            </div>

            <div style={{ display: 'flex', gap: '30px', background: '#132677', padding: '12px 30px', borderRadius: '10px', color: 'white' }}>
              <div style={{textAlign:'center'}}><small style={{display:'block', opacity:0.7}}>Min</small><b>{stats.min}</b></div>
              <div style={{textAlign:'center', borderLeft:'1px solid #ffffff33', paddingLeft:'30px'}}><small style={{display:'block', opacity:0.7}}>Avg</small><b>{stats.avg}</b></div>
              <div style={{textAlign:'center', borderLeft:'1px solid #ffffff33', paddingLeft:'30px'}}><small style={{display:'block', opacity:0.7}}>Max</small><b>{stats.max}</b></div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '15px', height: '350px' }}>
            <h4 style={{ color: '#132677', marginBottom: '15px' }}><Gauge size={18} /> Daily Trend: {selectedDate}</h4>
            <ResponsiveContainer width="100%" height="90%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="time" hide />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="speed" stroke="#132677" strokeWidth={3} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={{ background: 'white', padding: '20px', borderRadius: '15px', height: '350px' }}>
            <h4 style={{ color: '#132677', marginBottom: '15px' }}><Calendar size={18} /> Monthly Avg</h4>
            <ResponsiveContainer width="100%" height="90%">
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="day" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Area type="monotone" dataKey="speed" stroke="#132677" fill="#132677" fillOpacity={0.1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}