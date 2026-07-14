import { createFileRoute } from "@tanstack/react-router";
import { Player } from "@/components/player/Player";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return <Player />;
}
