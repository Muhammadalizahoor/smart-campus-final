import { collection, getDocs } from "firebase/firestore";
import { firestore } from "./firebase";

export const fetchStops = async () => {
  const snap = await getDocs(collection(firestore, "stops"));
  return snap.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));
};
