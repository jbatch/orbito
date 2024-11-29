// GameSettings.tsx

import { availableConfigs } from "./orbitConfig";
import { OrbitConfig } from "./types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "./ui/card";

const GameSettings = ({
  currentConfig,
  onConfigChange,
  isHost,
}: {
  currentConfig: OrbitConfig;
  onConfigChange: (config: OrbitConfig) => void;
  isHost: boolean;
}) => (
  <Card>
    <CardHeader>
      <CardTitle>Game Settings</CardTitle>
      <CardDescription>Configure the game before starting</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        <label className="text-sm font-medium">Board Configuration</label>
        <select
          className="w-full p-2 border rounded"
          value={currentConfig.name}
          onChange={(e) => {
            const newConfig = availableConfigs.find(
              (c) => c.name === e.target.value
            );
            if (newConfig) onConfigChange(newConfig);
          }}
          disabled={!isHost}
        >
          {availableConfigs.map((config) => (
            <option key={config.name} value={config.name}>
              {config.name}
            </option>
          ))}
        </select>
        {!isHost && (
          <p className="text-sm text-muted-foreground">
            Only the host can change game settings
          </p>
        )}
      </div>
    </CardContent>
  </Card>
);

export default GameSettings;
