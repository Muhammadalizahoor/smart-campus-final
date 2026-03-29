
//after UI
// frontend/src/components/admin/StopsSection.jsx
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Plus, Edit, Trash2, Clock, MapPin } from 'lucide-react';

const StopHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const AddStopsButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: #132677;
  color: white;
  border: none;
  padding: 6px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9em;
  &:disabled {
    background-color: #B0B0B0;
    cursor: not-allowed;
  }
`;

const StopListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const StopItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 15px;
  padding: 10px;
  border: 1px solid ${props => (props.$isEditing ? '#D7D7D7' : '#E0E0E0')};
  border-radius: 6px;
  background-color: #fff;
  flex-wrap: wrap;
  position: relative;
`;

const StopDetailsContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  min-width: 200px;
  max-width: 80%;
`;

const StopName = styled.div`
  font-size: 1em;
  font-weight: 700;
  color: #333;
  margin-bottom: 4px;
`;

const SubDetailsRow = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;
  font-size: 0.85em;
  color: #777;
`;

const SubDetail = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const EditingInputsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex-grow: 1;
  min-width: 70%;
  max-width: 80%;
`;

const InputRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const TwoColRow = styled.div`
  display: flex;
  gap: 10px;

  > * {
    flex-basis: 50%;
  }

  @media (max-width: 500px) {
    flex-direction: column;
    > * {
      flex-basis: 100%;
      max-width: 100%;
    }
  }
`;

const InputField = styled.input`
  background-color: #FFFFFF !important;
  padding: 6px 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const TimeInput = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #d7d7d7;
  border-radius: 6px;
  font-size: 0.95em;
`;

const FieldError = styled.div`
  color: #D32F2F;
  font-size: 0.8em;
  margin-top: 3px;
`;

const EditingActionsContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  width: 100%;
  margin-top: 8px;
`;

const SaveButton = styled.button`
  background-color: #132677;
  color: white;
  border: none;
  padding: 8px 18px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.95em;
  font-weight: 600;
  &:hover {
    background-color: #0F1E5C;
  }
  &:disabled {
    background-color: #B0B0B0;
    cursor: not-allowed;
  }
`;

const CancelLink = styled.button`
  background: none;
  border: none;
  color: #4A4A4A;
  padding: 8px 18px;
  cursor: pointer;
  font-size: 0.95em;
  font-weight: 500;
  &:hover {
    color: #D32F2F;
  }
`;

const ActionButtonsContainer = styled.div`
  display: flex;
  gap: 8px;
  position: absolute;
  right: 10px;
  top: 10px;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #B5B5B5; /* default grey */
  padding: 5px;
  display: flex;
  align-items: center;

  &:hover {
    color: ${props => (props.$delete ? 'red' : '#132677')};
  }
`;

const formatTimeWithAmPm = (time24) => {
  if (!time24) return '';
  const [h, m] = time24.split(':');
  const d = new Date();
  d.setHours(parseInt(h));
  d.setMinutes(parseInt(m));
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

export default function StopsSection({
  stopsData = [],
  setStopsData,
  deletedStops: parentDeletedStops,
  setDeletedStops,
  disabled = false,
  setValid
}) {
  const [localStops, setLocalStops] = useState(() =>
    stopsData.map(s => ({ ...s, isNew: false, isEditing: false }))
  );
  const [errors, setErrors] = useState([]);
  const [tempStopState, setTempStopState] = useState(null);
  const [attemptedSaveIndex, setAttemptedSaveIndex] = useState(null);

  useEffect(() => {
    const externalChange =
      stopsData.length !== localStops.filter(s => !s.isNew).length ||
      !stopsData.every(s =>
        localStops.some(ls => ls.stopId === s.stopId && !ls.isNew)
      );

    if (externalChange) {
      setLocalStops(stopsData.map(s => ({ ...s, isNew: false, isEditing: false })));
    }
  }, [stopsData]);

  useEffect(() => {
    const allErrors = localStops.map(stop => {
      const curr = stop.isEditing || stop.isNew ? tempStopState : stop;
      if (!curr) return {};

      const e = {};
      if (!curr.name) e.name = "Name required";
      if (curr.lat === "" || curr.lat === undefined || isNaN(Number(curr.lat)))
        e.lat = "Latitude must be a number";
      if (curr.lng === "" || curr.lng === undefined || isNaN(Number(curr.lng)))
        e.lng = "Longitude must be a number";
      if (!curr.targetTime) e.targetTime = "Time required";
      if (!curr.order || isNaN(Number(curr.order)))
  e.order = "Order must be a number";

      return e;
    });

    setErrors(allErrors);

    const isValid =
      localStops.length > 0 &&
      allErrors.every(er => Object.keys(er).length === 0) &&
      localStops.every(s => !s.isNew && !s.isEditing);

    setValid(isValid);

    if (!localStops.some(s => s.isEditing || s.isNew)) {
      const pure = localStops.map(({ isNew, isEditing, ...rest }) => rest);
      const same =
        stopsData.length === pure.length &&
        stopsData.every((s, i) => JSON.stringify(s) === JSON.stringify(pure[i]));

      if (!same) setStopsData(pure);
    }
  }, [localStops, tempStopState]);

  const startEdit = (i) => {
    if (disabled || localStops.some(s => s.isEditing || s.isNew)) return;
    setTempStopState({ ...localStops[i] });
    setLocalStops(prev =>
      prev.map((s, idx) => ({ ...s, isEditing: idx === i }))
    );
    setAttemptedSaveIndex(null);
  };

  const handleTemp = (field, val) => {
    setTempStopState(prev => ({ ...prev, [field]: val }));
  };

  const saveStop = (i) => {
    if (Object.keys(errors[i] || {}).length > 0) {
      setAttemptedSaveIndex(i);
      return;
    }

    setLocalStops(prev =>
      prev.map((s, idx) =>
        idx === i
          ? { ...tempStopState, isEditing: false, isNew: false }
          : { ...s, isEditing: false, isNew: false }
      )
    );

    setTempStopState(null);
    setAttemptedSaveIndex(null);
  };

  const cancelEdit = (i) => {
    const stop = localStops[i];
    if (stop.isNew) {
      setLocalStops(prev => prev.filter((_, idx) => idx !== i));
    } else {
      setLocalStops(prev => prev.map((s, idx) => ({ ...s, isEditing: false })));
    }
    setTempStopState(null);
    setAttemptedSaveIndex(null);
  };

  const addStop = () => {
    if (disabled || localStops.some(s => s.isEditing || s.isNew)) return;

    const newStop = {
  name: "",
  lat: "",
  lng: "",
  targetTime: "",
  order: localStops.length + 1   // ✅ AUTO ORDER
};


    setLocalStops(prev => [...prev, { ...newStop, isNew: true, isEditing: true }]);
    setTempStopState(newStop);
  };

  const deleteStop = (i) => {
    if (localStops[i].stopId && setDeletedStops)
      setDeletedStops(prev => [...prev, localStops[i].stopId]);

    setLocalStops(prev => prev.filter((_, idx) => idx !== i));
    setTempStopState(null);
  };

  return (
    <>
      <StopHeader>
        <h3>Route Stops ({localStops.length})</h3>
        <AddStopsButton
          onClick={addStop}
          disabled={disabled || localStops.some(s => s.isEditing || s.isNew)}
        >
          <Plus size={18} color="white" /> Add Stops
        </AddStopsButton>
      </StopHeader>

      <StopListContainer>
        {localStops.map((stop, idx) => {
          const editing = stop.isEditing || stop.isNew;
          const curr = editing ? tempStopState : stop;
          const err = errors[idx] || {};
          const show = attemptedSaveIndex === idx;

          return (
            <StopItem key={idx} $isEditing={editing}>
              {editing ? (
                <>
                  <EditingInputsContainer>
                    {/* NAME + TIME */}
                    {/* STOP ORDER (REQUIRED FOR LIVE TRACKING) */}
<InputRow>
  <InputField
    type="number"
    placeholder="Stop Order"
    value={curr.order}
    min="1"
    onChange={(e) =>
      handleTemp("order", Number(e.target.value))
    }
  />
  {show && err.order && <FieldError>{err.order}</FieldError>}
</InputRow>

                    <TwoColRow>
                      <InputRow>
                        <InputField
                          placeholder="Stop Name"
                          value={curr.name}
                          onChange={(e) => handleTemp("name", e.target.value)}
                        />
                        {show && err.name && <FieldError>{err.name}</FieldError>}
                      </InputRow>

                      <InputRow>
                     <TimeInput
  type="time"
  value={curr.targetTime}
  onChange={(e) => handleTemp("targetTime", e.target.value)}
/>

                        {show && err.targetTime && (
                          <FieldError>{err.targetTime}</FieldError>
                        )}
                      </InputRow>
                    </TwoColRow>

                    {/* LAT LNG */}
                    <TwoColRow>
                      <InputRow>
                        <InputField
                          placeholder="Latitude"
                          value={curr.lat}
                          onChange={(e) => handleTemp("lat", e.target.value)}
                        />
                        {show && err.lat && <FieldError>{err.lat}</FieldError>}
                      </InputRow>

                      <InputRow>
                        <InputField
                          placeholder="Longitude"
                          value={curr.lng}
                          onChange={(e) => handleTemp("lng", e.target.value)}
                        />
                        {show && err.lng && <FieldError>{err.lng}</FieldError>}
                      </InputRow>
                    </TwoColRow>
                  </EditingInputsContainer>

                  <EditingActionsContainer>
                    <CancelLink onClick={() => cancelEdit(idx)}>Cancel</CancelLink>
                    <SaveButton onClick={() => saveStop(idx)}>Save</SaveButton>
                  </EditingActionsContainer>
                </>
              ) : (
                <>
                  <StopDetailsContainer>
                    <StopName>
  #{stop.order} — {stop.name}
</StopName>

                    <SubDetailsRow>
                      <SubDetail>
                        <Clock size={14} color="#777" />
                        {formatTimeWithAmPm(stop.targetTime)}
                      </SubDetail>
                      <SubDetail>
                        <MapPin size={14} color="#777" />
                        {stop.lat}, {stop.lng}
                      </SubDetail>
                    </SubDetailsRow>
                  </StopDetailsContainer>

                  <ActionButtonsContainer>
                    <IconButton onClick={() => startEdit(idx)}>
                      <Edit size={20} />
                    </IconButton>
                    <IconButton $delete onClick={() => deleteStop(idx)}>
                      <Trash2 size={20} />
                    </IconButton>
                  </ActionButtonsContainer>
                </>
              )}
            </StopItem>
          );
        })}
      </StopListContainer>
    </>
  );
}
