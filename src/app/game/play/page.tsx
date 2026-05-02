import { GamePlayClient } from "@/components/game/GamePlayClient";

export default function GamePlayPage() {
  return (
    <GamePlayClient backHref="/game" questionnaireHomeHref="/game" requireGameSession={false} />
  );
}
