import { useEffect, useRef, useState } from "react";
import { firestore } from "../services/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import "../styles/google-map.css";
//live markers , stops show,polyline draw kerta eta calculation 
// Distance fallback
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function GoogleMapSection({
  routes = [],
  liveLocations = {},
  onETASelect,
  zoomRouteId = null, // ← NEW PROP
}) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  const busMarkersRef = useRef(new Map());
  const stopMarkersRef = useRef(new Map());
  const polylinesRef = useRef([]);
  const stopsLoadedRef = useRef(false);

  const [allStops, setAllStops] = useState([]);

  // =========================================
  // 1️⃣ LOAD STOPS ONCE
  // =========================================
  useEffect(() => {
    if (!routes.length || stopsLoadedRef.current) return;

    async function loadStops() {
      const routeIds = routes.map((r) => String(r.routeId));

      const q = query(
        collection(firestore, "stops"),
        where("routeId", "in", routeIds)
      );

      const snap = await getDocs(q);

      const stops = snap.docs.map((d) => ({
        stopId: d.id,
        ...d.data(),
        lat: Number(d.data().lat),
        lng: Number(d.data().lng),
        order: Number(d.data().order),
      }));

      console.log("✅ Stops loaded:", stops.length);
      setAllStops(stops);
      stopsLoadedRef.current = true;
    }

    loadStops();
  }, [routes]);

  // =========================================
  // 2️⃣ INIT MAP ONCE
  // =========================================
  useEffect(() => {
    if (!window.google || mapInstance.current) return;

    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      center: { lat: 31.5, lng: 74.3 },
      zoom: 12,
    });
  }, []);

  // =========================================
  // 3️⃣ CREATE STOP MARKERS
  // =========================================
  useEffect(() => {
    if (!mapInstance.current || allStops.length === 0) return;

    // Clear existing stop markers
    stopMarkersRef.current.forEach((marker) => marker.setMap(null));
    stopMarkersRef.current.clear();

    allStops.forEach((stop) => {
      const marker = new window.google.maps.Marker({
        position: { lat: stop.lat, lng: stop.lng },
        map: mapInstance.current,
        title: stop.name,
        icon: {
          url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
          scaledSize: new window.google.maps.Size(30, 30),
        },
      });

      marker.addListener("click", () => {
        const route = routes.find(
          (r) => String(r.routeId) === String(stop.routeId)
        );
        if (!route) return;

        const liveKey = route.busId;
        const busData = liveLocations[liveKey];
        const live = busData?.current;

        if (!live?.lat) {
          alert("Cannot calculate ETA: Bus is offline.");
          return;
        }

        const dist = haversineDistance(
          Number(live.lat),
          Number(live.lng),
          stop.lat,
          stop.lng
        );
        const etaMin = Math.round((dist / 30) * 60);

        onETASelect({
          busId: liveKey,
          stopName: stop.name,
          etaMinutesLabel: `${etaMin} min`,
          distanceKm: dist.toFixed(2),
        });
      });

      stopMarkersRef.current.set(stop.stopId, marker);
    });

    console.log(`📍 Created ${allStops.length} stop markers`);
  }, [allStops, routes, liveLocations]);

  // =========================================
  // 4️⃣ CREATE POLYLINES
  // =========================================
  useEffect(() => {
    if (!mapInstance.current || allStops.length === 0) return;

    // Clear old polylines
    polylinesRef.current.forEach((p) => p.setMap(null));
    polylinesRef.current = [];

    routes.forEach((route) => {
      const routeStops = allStops
        .filter((s) => String(s.routeId) === String(route.routeId))
        .sort((a, b) => a.order - b.order);

      if (routeStops.length > 0) {
        const polyline = new window.google.maps.Polyline({
          path: routeStops.map((s) => ({ lat: s.lat, lng: s.lng })),
          map: mapInstance.current,
          strokeColor: "#1D4ED8",
          strokeOpacity: 0.8,
          strokeWeight: 5,
        });
        polylinesRef.current.push(polyline);
      }
    });
  }, [allStops, routes]);

  // =========================================
  // 5️⃣ UPDATE BUS MARKERS
  // =========================================
  useEffect(() => {
    if (!mapInstance.current) return;

    routes.forEach((route) => {
      const liveKey = route.busId;
      const busData = liveLocations[liveKey];
      const live = busData?.current;

      if (live?.lat && live?.lng) {
        const position = { lat: Number(live.lat), lng: Number(live.lng) };

        let marker = busMarkersRef.current.get(liveKey);

        if (!marker) {
          marker = new window.google.maps.Marker({
            position,
            map: mapInstance.current,
            title: `Bus ${liveKey}`,
            icon: {
              url: "https://maps.google.com/mapfiles/ms/icons/bus.png",
              scaledSize: new window.google.maps.Size(40, 40),
            },
          });
          busMarkersRef.current.set(liveKey, marker);
        } else {
          marker.setPosition(position);
        }
      } else {
        const marker = busMarkersRef.current.get(liveKey);
        if (marker) {
          marker.setMap(null);
          busMarkersRef.current.delete(liveKey);
        }
      }
    });

    const currentBusIds = routes.map((r) => r.busId);
    busMarkersRef.current.forEach((marker, busId) => {
      if (!currentBusIds.includes(busId)) {
        marker.setMap(null);
        busMarkersRef.current.delete(busId);
      }
    });
  }, [liveLocations, routes]);

  // =========================================
  // 6️⃣ AUTO ZOOM SELECTED ROUTE
  // =========================================
  useEffect(() => {
    if (!mapInstance.current || !zoomRouteId || allStops.length === 0) return;

    const routeStops = allStops
      .filter((s) => String(s.routeId) === String(zoomRouteId))
      .sort((a, b) => a.order - b.order);

    if (routeStops.length === 0) return;

    const bounds = new window.google.maps.LatLngBounds();
    routeStops.forEach((stop) => bounds.extend({ lat: stop.lat, lng: stop.lng }));

    mapInstance.current.fitBounds(bounds, { maxZoom: 2 });
  }, [zoomRouteId, allStops]);

  // =========================================
  // 7️⃣ RESET MAP ON "All Routes"
  // =========================================
  useEffect(() => {
    if (!mapInstance.current) return;
    if (!zoomRouteId) {
      mapInstance.current.setCenter({ lat: 31.5, lng: 74.3 });
      mapInstance.current.setZoom(12);
    }
  }, [zoomRouteId]);

  // =========================================
  // 8️⃣ CLEANUP
  // =========================================
  useEffect(() => {
    return () => {
      busMarkersRef.current.forEach((m) => m.setMap(null));
      stopMarkersRef.current.forEach((m) => m.setMap(null));
      polylinesRef.current.forEach((p) => p.setMap(null));

      busMarkersRef.current.clear();
      stopMarkersRef.current.clear();
      polylinesRef.current = [];
    };
  }, []);

  return (
    <div className="google-map-container">
      <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
