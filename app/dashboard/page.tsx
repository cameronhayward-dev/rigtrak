import { StoreProvider } from "@/context/store";
import RigTrakApp from "@/components/RigTrakApp";

export default function Page() {
  return (
    <StoreProvider>
      <RigTrakApp />
    </StoreProvider>
  );
}
