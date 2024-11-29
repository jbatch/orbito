// ConnectionStatus.tsx
const ConnectionStatus = ({ isConnected }: { isConnected: boolean }) => (
  <div className="flex items-center gap-2">
    <div
      className={`w-2 h-2 rounded-full ${
        isConnected ? "bg-green-500" : "bg-red-500"
      }`}
    />
    <span className="text-sm text-muted-foreground">
      {isConnected ? "Connected" : "Disconnected"}
    </span>
  </div>
);

export default ConnectionStatus;
