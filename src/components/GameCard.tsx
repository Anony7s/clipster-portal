
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

export interface GameData {
  id: string;
  name: string;
  image: string;
  clipsCount: number;
}

interface GameCardProps {
  game: GameData;
}

const GameCard = ({ game }: GameCardProps) => {
  return (
    <Link to={`/games/${game.id}`}>
      <Card className="game-card h-full overflow-hidden">
        <div className="relative aspect-[16/9] overflow-hidden">
          <img 
            src={game.image} 
            alt={game.name} 
            className="w-full h-full object-cover transform transition-transform duration-300 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
            <div>
              <h3 className="text-white font-bold text-lg">{game.name}</h3>
              <p className="text-white/80 text-sm">{game.clipsCount} clipes</p>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default GameCard;
