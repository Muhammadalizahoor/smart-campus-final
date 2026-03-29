
// frontend/src/components/route/StopsModal.jsx
import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  position: fixed; top:0; left:0; right:0; bottom:0;
  background: rgba(0,0,0,0.5);
  display:flex; justify-content:center; align-items:center;
  z-index: 9999;
`;

const Content = styled.div`
  background:#fff; padding:20px; border-radius:8px;
  width:500px; max-height:80vh; overflow-y:auto;
`;

const StopRow = styled.div`
  border-bottom:1px solid #ccc; padding:5px 0;
`;

export default function StopsModal({ route = {}, stops = [], onClose }) {
  return (
    <Wrapper>
      <Content>
        <h2>Stops for {route.routeName}</h2>
        <h4>Total Stops: {stops.length}</h4>

        {stops.map((s, i) => (
          <StopRow key={i}>
            <p><b>Name:</b> {s.name}</p>
            <p><b>Lat:</b> {s.lat} — <b>Lng:</b> {s.lng}</p>
            <p><b>Target Time:</b> {s.targetTime}</p>
          </StopRow>
        ))}

        <button onClick={onClose}>Close</button>
      </Content>
    </Wrapper>
  );
}
