// In app/canvas/[roomId]/page.tsx
import { RoomCanvas } from "@/components/RoomCanvas";
import type { PageProps } from "@/types/types";
import type { NextPage } from "next";
 
// Use the generic to specify the params shape
const CanvasPage: NextPage<PageProps<{ roomId: string }>> = async ({ params }) => {
  return <RoomCanvas roomId={params.roomId} />;
};

export default CanvasPage;