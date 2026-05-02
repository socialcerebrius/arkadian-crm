import { GamePlayClient } from "@/components/game/GamePlayClient";

export default function ExperiencePlayPage() {
  const googleOn = Boolean(process.env.NEXT_PUBLIC_GOOGLE_GAME_CLIENT_ID?.trim());
  return (
    <GamePlayClient
      backHref="/experience"
      questionnaireHomeHref="/experience"
      requireGameSession={googleOn}
    />
  );
}
